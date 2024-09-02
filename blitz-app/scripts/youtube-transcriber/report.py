"""
YouTube Playlist Performance Report Generator

This script generates a performance report for all videos in a YouTube playlist.

Usage:
1. Ensure you have the required libraries installed:
   pip install google-api-python-client python-dotenv isodate

2. Set up your environment:
   - Create a .env file in the same directory as this script.
   - Add the following lines to the .env file:
     YOUTUBE_API_KEY=<your_youtube_api_key>
     YOUTUBE_PLAYLIST_ID=<your_playlist_id>

3. Run the script:
   python report.py [--offline-partial]

   Options:
   --offline-partial: Generate a partial report using cached data without making API calls

Note: This script fetches all publicly available metrics from the YouTube Data API for all videos in the specified playlist.
Watch time is not available through this API, and dislike counts are no longer public.
The report focuses on views, likes, comments, and other available metrics.
"""

import os
import csv
import json
import argparse
from datetime import datetime, timedelta
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import statistics
import isodate

load_dotenv()
API_KEY = os.getenv("YOUTUBE_API_KEY")
PLAYLIST_ID = os.getenv("YOUTUBE_PLAYLIST_ID")
PROGRESS_FILE = "progress.json"

youtube = build('youtube', 'v3', developerKey=API_KEY)

def get_playlist_item_count(playlist_id):
    try:
        request = youtube.playlists().list(
            part="contentDetails",
            id=playlist_id
        )
        response = request.execute()
        return int(response['items'][0]['contentDetails']['itemCount'])
    except HttpError as e:
        print(f"An error occurred while fetching playlist info: {e}")
        return None

def get_video_data(video_item):
    video_id = video_item['snippet']['resourceId']['videoId']
    title = video_item['snippet']['title']
    
    try:
        video_response = youtube.videos().list(
            part='statistics,contentDetails',
            id=video_id
        ).execute()

        if video_response['items']:
            stats = video_response['items'][0]['statistics']
            content_details = video_response['items'][0]['contentDetails']
            
            duration = isodate.parse_duration(content_details.get('duration', 'PT0S')).total_seconds()
            
            return {
                "title": title,
                "url": f"https://youtu.be/{video_id}",
                "views": int(stats.get('viewCount', 0)),
                "likes": int(stats.get('likeCount', 0)),
                "comments": int(stats.get('commentCount', 0)),
                "duration": duration,
                "title_length": len(title)
            }
    except HttpError as e:
        print(f"An error occurred: {e}")
    
    return None

def get_all_playlist_items(playlist_id):
    try:
        total_videos = get_playlist_item_count(playlist_id)
        if total_videos is None:
            print("Could not determine the total number of videos. Proceeding anyway.")
        else:
            print(f"Total videos in playlist: {total_videos}")

        videos = []
        next_page_token = None

        while True:
            request = youtube.playlistItems().list(
                part="snippet",
                playlistId=playlist_id,
                maxResults=50,
                pageToken=next_page_token
            )
            response = request.execute()

            for item in response['items']:
                video = get_video_data(item)
                if video:
                    videos.append(video)
            
            if total_videos:
                print(f"Fetched {len(videos)}/{total_videos} videos ({(len(videos)/total_videos)*100:.2f}%)")
            else:
                print(f"Fetched {len(videos)} videos so far...")

            next_page_token = response.get('nextPageToken')
            if not next_page_token:
                break

        print(f"Successfully fetched data for {len(videos)} videos")

        # Sort videos by view count in descending order
        return sorted(videos, key=lambda x: x['views'], reverse=True)

    except HttpError as e:
        print(f"An error occurred: {e}")
        return []

def calculate_percentile(data, percentile):
    return statistics.quantiles(data, n=4)[percentile-1]

def generate_report(video_data):
    metrics = ['views', 'likes', 'comments', 'duration', 'title_length']
    report = {metric: {} for metric in metrics}

    for metric in metrics:
        values = [v[metric] for v in video_data if v and v[metric] is not None]
        
        if values:
            report[metric] = {
                'max': max(values),
                'p75': calculate_percentile(values, 3),
                'p50': calculate_percentile(values, 2),
                'average': sum(values) / len(values),
                'p25': calculate_percentile(values, 1)
            }
        else:
            report[metric] = {
                'max': 0, 'p75': 0, 'p50': 0, 'average': 0, 'p25': 0
            }

    return report

def categorize_videos(video_data, report):
    high_value = []
    low_value = []

    for video in video_data:
        if video is None:
            continue
        high_count = low_count = 0
        for metric in ['views', 'likes', 'comments']:
            value = video[metric]
            if value >= report[metric]['p75']:
                high_count += 1
            elif value <= report[metric]['p25']:
                low_count += 1
        
        if high_count >= 2:
            high_value.append(video['url'])
        if low_count >= 2:
            low_value.append(video['url'])

    return high_value, low_value

def save_progress(video_data):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump({
            'video_data': video_data,
            'timestamp': datetime.now().isoformat()
        }, f)

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            data = json.load(f)
        
        timestamp = datetime.fromisoformat(data['timestamp'])
        if datetime.now() - timestamp > timedelta(hours=24):
            print("Cache is more than 24 hours old. Do you want to start fresh? (y/n)")
            if input().lower() == 'y':
                return []
        
        return data['video_data']
    return []

def generate_full_report(video_data):
    # Write CSV report
    with open('report_video_data.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['title', 'url', 'views', 'likes', 'comments', 'duration', 'title_length']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for video in video_data:
            if video:
                writer.writerow(video)

    # Generate and print summary report
    report = generate_report(video_data)
    print("Summary Report:")
    for metric, values in report.items():
        print(f"\n{metric.capitalize()}:")
        for key, value in values.items():
            print(f"  {key}: {value:.2f}")

    # Categorize videos and write to JSON files
    high_value, low_value = categorize_videos(video_data, report)

    with open('urls_high_value_automated.json', 'w') as f:
        json.dump(high_value, f, indent=2)

    with open('urls_low_value_automated.json', 'w') as f:
        json.dump(low_value, f, indent=2)

    print("\nReport generated successfully. Check 'report_video_data.csv' for detailed data.")
    print("High-value and low-value video URLs have been saved to JSON files.")

def main():
    parser = argparse.ArgumentParser(description="YouTube Playlist Performance Report Generator")
    parser.add_argument("--offline-partial", action="store_true", help="Generate a partial report using cached data without making API calls")
    args = parser.parse_args()

    if args.offline_partial:
        video_data = load_progress()
        if not video_data:
            print("No cached data available. Please run the script in online mode first.")
            return
        print(f"Generating offline partial report based on {len(video_data)} cached videos.")
    else:
        print(f"Fetching all playlist data and sorting by view count...")
        video_data = get_all_playlist_items(PLAYLIST_ID)
        save_progress(video_data)

    if not video_data:
        print("No valid video data could be retrieved. Please check your API key and playlist ID.")
        return

    print(f"\nGenerating report for {len(video_data)} videos...")
    generate_full_report(video_data)

if __name__ == "__main__":
    main()
