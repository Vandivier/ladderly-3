import os
import csv
import json
from dotenv import load_dotenv
from pytube import Playlist, YouTube
import statistics
import time

load_dotenv()
playlist_url = os.getenv("youtube_playlist_url")

if not playlist_url:
    playlist_url = input("Enter YouTube playlist URL: ")

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

# Main execution
print(f"Fetching playlist data from: {playlist_url}")
playlist = Playlist(playlist_url)

# Estimate total number of videos
total_videos = len(playlist.video_urls)
print(f"Estimated number of videos in playlist: {total_videos}")

video_data = []
start_time = time.time()

for i, url in enumerate(playlist.video_urls, 1):
    video = get_video_data(url)
    if video:
        video_data.append(video)
    
    # Print progress every 5 videos or on the last video
    if i % 5 == 0 or i == total_videos:
        elapsed_time = time.time() - start_time
        videos_per_second = i / elapsed_time
        estimated_total_time = total_videos / videos_per_second
        remaining_time = estimated_total_time - elapsed_time
        
        print(f"Processed {i}/{total_videos} videos. "
              f"Estimated time remaining: {remaining_time:.2f} seconds")

if not video_data:
    print("No valid video data could be retrieved. Please check the playlist URL and try again.")
else:
    print("\nGenerating report...")
    
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

total_time = time.time() - start_time
print(f"\nTotal execution time: {total_time:.2f} seconds")
