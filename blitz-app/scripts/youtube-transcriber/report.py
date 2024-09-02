"""
YouTube Channel Performance Report Generator

This script generates a performance report for videos in a YouTube playlist.

Usage:
1. Ensure you have the required libraries installed:
   pip install python-dotenv pytube

2. Set up your environment:
   - Create a .env file in the same directory as this script.
   - Add the following line to the .env file:
     youtube_playlist_url=<your_playlist_url>
   - Replace <your_playlist_url> with the actual URL of the YouTube playlist you want to analyze.

3. Run the script:
   python report.py [--offline-partial]

   Options:
   --offline-partial: Generate a partial report using cached data without making API calls

Features:
- Generates a CSV report with video metrics (report_video_data.csv).
- Creates JSON files with high and low-value video URLs.
- Provides a summary report with key statistics.
- Implements crash proofing and pause/resume functionality.
- Checks for stale cache data (older than 24 hours).
- Offers an offline mode to generate partial reports from cached data.

Pause and Resume:
- To pause the script, press Ctrl+C. Progress will be saved automatically.
- To resume, simply run the script again. It will continue from where it left off.

Note: This script respects YouTube's terms of service and rate limits. Please use responsibly.
"""

import os
import csv
import json
import time
import argparse
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pytube import Playlist, YouTube
import statistics

load_dotenv()
playlist_url = os.getenv("youtube_playlist_url")
PROGRESS_FILE = "progress.json"

def get_video_data(url):
    try:
        yt = YouTube(url)
        video_id = url.split("?v=")[1]
        
        likes = yt.initial_data.get('videoDetails', {}).get('likes', 0)
        dislikes = yt.initial_data.get('videoDetails', {}).get('dislikes', 0)
        comment_count = yt.initial_data.get('videoDetails', {}).get('commentCount', 0)
        
        return {
            "title": yt.title,
            "url": f"https://youtu.be/{video_id}",
            "likes": int(likes) if likes is not None else 0,
            "dislikes": int(dislikes) if dislikes is not None else 0,
            "views": yt.views,
            "comment_count": int(comment_count) if comment_count is not None else 0,
            "duration": yt.length,
            "title_length": len(yt.title)
        }
    except Exception as e:
        print(f"Error processing video {url}: {str(e)}")
        return None

def calculate_percentile(data, percentile):
    return statistics.quantiles(data, n=4)[percentile-1]

def generate_report(video_data):
    metrics = ['likes', 'like_to_dislike_ratio', 'views', 'comment_count']
    report = {metric: {} for metric in metrics}

    for metric in metrics:
        if metric == 'like_to_dislike_ratio':
            values = [v['likes'] / (v['dislikes'] or 1) for v in video_data if v]
        else:
            values = [v[metric] for v in video_data if v]
        
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
        for metric in ['likes', 'like_to_dislike_ratio', 'views', 'comment_count']:
            value = video[metric] if metric != 'like_to_dislike_ratio' else (video['likes'] / (video['dislikes'] or 1))
            if value >= report[metric]['p75']:
                high_count += 1
            elif value <= report[metric]['p25']:
                low_count += 1
        
        if high_count >= 2:
            high_value.append(video['url'])
        if low_count >= 2:
            low_value.append(video['url'])

    return high_value, low_value

def save_progress(processed_urls, video_data):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump({
            'processed_urls': processed_urls,
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
                return set(), []
        
        return set(data['processed_urls']), data['video_data']
    return set(), []

def generate_offline_report():
    processed_urls, video_data = load_progress()
    
    if not video_data:
        print("No cached data available. Please run the script in online mode first.")
        return

    print(f"Generating offline partial report based on {len(video_data)} cached videos.")
    
    # Generate report
    generate_full_report(video_data)

def generate_full_report(video_data):
    # Write CSV report
    with open('report_video_data.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['title', 'url', 'likes', 'like_to_dislike_ratio', 'views', 'comment_count', 'duration', 'title_length']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for video in video_data:
            row = video.copy()
            row['like_to_dislike_ratio'] = row['likes'] / (row['dislikes'] or 1)
            del row['dislikes']
            writer.writerow(row)

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
    parser = argparse.ArgumentParser(description="YouTube Channel Performance Report Generator")
    parser.add_argument("--offline-partial", action="store_true", help="Generate a partial report using cached data without making API calls")
    args = parser.parse_args()

    if args.offline_partial:
        generate_offline_report()
        return

    if not playlist_url:
        playlist_url = input("Enter YouTube playlist URL: ")

    print(f"Fetching playlist data from: {playlist_url}")
    playlist = Playlist(playlist_url)

    # Estimate total number of videos
    total_videos = len(playlist.video_urls)
    print(f"Estimated number of videos in playlist: {total_videos}")

    processed_urls, video_data = load_progress()
    start_time = time.time()

    try:
        for i, url in enumerate(playlist.video_urls, 1):
            if url in processed_urls:
                continue
            
            video = get_video_data(url)
            if video:
                video_data.append(video)
                processed_urls.add(url)
            
            # Print progress every 5 videos or on the last video
            if i % 5 == 0 or i == total_videos:
                elapsed_time = time.time() - start_time
                videos_per_second = i / elapsed_time
                estimated_total_time = total_videos / videos_per_second
                remaining_time = estimated_total_time - elapsed_time
                
                print(f"Processed {i}/{total_videos} videos. "
                      f"Estimated time remaining: {remaining_time:.2f} seconds")
                
                # Save progress
                save_progress(list(processed_urls), video_data)

    except KeyboardInterrupt:
        print("\nOperation paused. Progress has been saved.")
        save_progress(list(processed_urls), video_data)
        return

    if not video_data:
        print("No valid video data could be retrieved. Please check the playlist URL and try again.")
    else:
        print("\nGenerating report...")
        generate_full_report(video_data)

    total_time = time.time() - start_time
    print(f"\nTotal execution time: {total_time:.2f} seconds")

    # Clean up progress file after successful completion
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)

if __name__ == "__main__":
    main()
