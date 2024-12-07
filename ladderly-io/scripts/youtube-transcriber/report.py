# report.py

"""
YouTube Playlist Performance Report Generator

This script generates a performance report for all videos in a YouTube playlist
and recommends top-performing videos based on specified criteria.

Usage:
1. Ensure you have the required libraries installed:
   pip install google-api-python-client python-dotenv isodate

2. Set up your environment:
   - Create a .env file in the same directory as this script.
   - Add the following lines to the .env file:
     YOUTUBE_API_KEY=<your_youtube_api_key>
     YOUTUBE_PLAYLIST_ID=<your_playlist_id>

3. (Optional) Prepare Ignored URLs:
   - Create `urls_low_value_manual.ignoreme.json`
   - Each file should contain a list of YouTube video URLs to exclude from recommendations.
     Example content:
     [
         "https://youtu.be/VIDEO_ID_1",
         "https://youtu.be/VIDEO_ID_2"
     ]

4. Run the script. All flags are optional:
   python report.py [--offline-partial] [--recommend-next-n N]

   Options:
   --offline-partial      Generate a partial report using cached data without making API calls
   --recommend-next-n     Recommend the next N top-performing videos based on the report

Note: This script fetches all publicly available metrics from the YouTube Data API for all videos in the specified playlist.
Watch time is not available through this API, and dislike counts are no longer public.
The report focuses on views, likes, comments, and other available metrics.
"""

import os
import csv
import json
import argparse
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import isodate

load_dotenv()
API_KEY = os.getenv("YOUTUBE_API_KEY")
PLAYLIST_ID = os.getenv("YOUTUBE_PLAYLIST_ID")
PROGRESS_FILE = "progress.ignoreme.json"
CSV_REPORT_FILE = "report_video_data.ignoreme.csv"

youtube = build("youtube", "v3", developerKey=API_KEY)


def get_all_playlist_items(playlist_id):
    """
    Retrieves all video items from the specified YouTube playlist.

    Args:
        playlist_id (str): The ID of the YouTube playlist.

    Returns:
        list: A list of video items with their details.
    """
    videos = []
    next_page_token = None

    while True:
        try:
            request = youtube.playlistItems().list(
                part="snippet,contentDetails",
                playlistId=playlist_id,
                maxResults=50,
                pageToken=next_page_token,
            )
            response = request.execute()

            for item in response.get("items", []):
                video_id = item["contentDetails"]["videoId"]
                video_title = item["snippet"]["title"]
                videos.append({"video_id": video_id, "title": video_title})

            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break

        except HttpError as e:
            print(f"An HTTP error occurred: {e}")
            break

    return videos


def get_video_details(video_ids):
    """
    Retrieves detailed statistics for a list of video IDs.

    Args:
        video_ids (list): A list of YouTube video IDs.

    Returns:
        list: A list of video details including statistics.
    """
    video_details = []
    for i in range(0, len(video_ids), 50):
        batch_ids = video_ids[i : i + 50]
        try:
            request = youtube.videos().list(
                part="statistics,contentDetails", id=",".join(batch_ids)
            )
            response = request.execute()

            for item in response.get("items", []):
                stats = item.get("statistics", {})
                content_details = item.get("contentDetails", {})
                duration = isodate.parse_duration(
                    content_details.get("duration", "PT0S")
                )
                video_details.append(
                    {
                        "video_id": item["id"],
                        "view_count": int(stats.get("viewCount", 0)),
                        "like_count": int(stats.get("likeCount", 0)),
                        "comment_count": int(stats.get("commentCount", 0)),
                        "duration_seconds": duration.total_seconds(),
                    }
                )

        except HttpError as e:
            print(f"An HTTP error occurred while fetching video details: {e}")

    return video_details


def save_progress(video_data):
    """
    Saves the fetched video data to a progress JSON file.

    Args:
        video_data (list): A list of video data dictionaries.
    """
    with open(PROGRESS_FILE, "w") as f:
        json.dump(video_data, f, indent=2)
    print(f"Progress saved to {PROGRESS_FILE}.")


def load_progress():
    """
    Loads video data from the progress JSON file.

    Returns:
        list: A list of video data dictionaries.
    """
    if not os.path.exists(PROGRESS_FILE):
        print(f"No progress file found at {PROGRESS_FILE}.")
        return []

    with open(PROGRESS_FILE, "r") as f:
        video_data = json.load(f)
    print(f"Loaded progress from {PROGRESS_FILE}.")
    return video_data


def generate_full_report(video_data):
    """
    Generates a CSV report from the video data.

    Args:
        video_data (list): A list of video data dictionaries.
    """
    with open(CSV_REPORT_FILE, "w", newline="", encoding="utf-8") as csvfile:
        fieldnames = [
            "video_id",
            "title",
            "view_count",
            "like_count",
            "comment_count",
            "duration_seconds",
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for video in video_data:
            writer.writerow(
                {
                    "video_id": video.get("video_id"),
                    "title": video.get("title"),
                    "view_count": video.get("view_count", 0),
                    "like_count": video.get("like_count", 0),
                    "comment_count": video.get("comment_count", 0),
                    "duration_seconds": video.get("duration_seconds", 0),
                }
            )
    print(f"Full report generated at {CSV_REPORT_FILE}.")


def load_video_data_from_csv():
    """
    Loads video data from the CSV report file.

    Returns:
        list: A list of video data dictionaries.
    """
    if not os.path.exists(CSV_REPORT_FILE):
        print(f"No CSV report found at {CSV_REPORT_FILE}.")
        return []

    video_data = []
    with open(CSV_REPORT_FILE, "r", newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            video_data.append(
                {
                    "video_id": row["video_id"],
                    "title": row["title"],
                    "view_count": int(row["view_count"]),
                    "like_count": int(row["like_count"]),
                    "comment_count": int(row["comment_count"]),
                    "duration_seconds": float(row["duration_seconds"]),
                }
            )
    print(f"Loaded video data from {CSV_REPORT_FILE}.")
    return video_data


def calculate_percentile(values, percentile):
    """
    Calculates the given percentile for a list of numeric values.

    Args:
        values (list): A list of numeric values.
        percentile (float): The desired percentile (e.g., 75 for p75).

    Returns:
        float: The calculated percentile value.
    """
    if not values:
        return 0
    sorted_values = sorted(values)
    index = (percentile / 100) * (len(sorted_values) - 1)
    lower = int(index)
    upper = lower + 1
    if upper >= len(sorted_values):
        return sorted_values[lower]
    weight = index - lower
    return sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight


def load_ignored_urls():
    """
    Loads URLs to ignore from JSON files.

    Returns:
        set: A set of YouTube video URLs to exclude from recommendations.
    """
    ignored_files = [
        "urls_low_value_manual.ignoreme.json",
        "urls_low_value_manual.json",
    ]
    ignored_urls = set()

    for filename in ignored_files:
        if os.path.exists(filename):
            try:
                with open(filename, "r") as f:
                    urls = json.load(f)
                    ignored_urls.update(urls)
                print(f"Loaded {len(urls)} URLs from {filename}.")
            except json.JSONDecodeError:
                print(f"Error decoding JSON from {filename}. Skipping.")
        else:
            print(f"Ignored URLs file {filename} not found. Skipping.")

    return ignored_urls


def recommend_next_videos(n):
    """
    Recommends the next n top-performing videos based on view count percentile,
    excluding URLs from ignore lists.

    Args:
        n (int): Number of videos to recommend. If n is -1, recommend all top-performing videos.

    Returns:
        list: List of recommended video URLs.
    """
    video_data = load_video_data_from_csv()
    if not video_data:
        print("No video data available for recommendations.")
        return []

    # Load ignored URLs
    ignored_urls = load_ignored_urls()

    # Calculate the 75th percentile of view counts
    view_counts = [video["view_count"] for video in video_data]
    p75 = calculate_percentile(view_counts, 75)
    print(f"75th percentile (p75) of view counts: {p75}")

    # Select videos with view_count >= p75
    top_videos = [video for video in video_data if video["view_count"] >= p75]
    print(f"Number of top-performing videos (view_count >= p75): {len(top_videos)}")

    # Exclude ignored URLs
    top_videos = [
        video
        for video in top_videos
        if f"https://youtu.be/{video['video_id']}" not in ignored_urls
    ]
    print(
        f"Number of top-performing videos after excluding ignored URLs: {len(top_videos)}"
    )

    # Sort top_videos by view_count descending
    top_videos_sorted = sorted(top_videos, key=lambda x: x["view_count"], reverse=True)

    # If n is -1, return all top_videos
    if n == -1:
        recommended = top_videos_sorted
    else:
        # Filter out ignored URLs from lower-performing videos as well
        if n <= len(top_videos_sorted):
            recommended = top_videos_sorted[:n]
        else:
            # Include all top_videos and add lower-performing videos to reach n
            recommended = top_videos_sorted
            remaining = n - len(top_videos_sorted)
            # Select lower-performing videos sorted by view_count descending
            lower_videos = sorted(
                [
                    video
                    for video in video_data
                    if video["view_count"] < p75
                    and f"https://youtu.be/{video['video_id']}" not in ignored_urls
                ],
                key=lambda x: x["view_count"],
                reverse=True,
            )
            recommended.extend(lower_videos[:remaining])
            print(
                f"Added {remaining} lower-performing videos to reach the desired count."
            )

    recommended_urls = [
        f"https://youtu.be/{video['video_id']}" for video in recommended
    ]
    print(f"Recommended {len(recommended_urls)} videos.")
    return recommended_urls


def get_recommended_videos(n):
    """
    Retrieves the top n recommended videos.

    Args:
        n (int): Number of videos to recommend. If n is -1, recommend all top-performing videos.

    Returns:
        list: List of recommended video URLs.
    """
    # Ensure the CSV report is available
    if not os.path.exists(CSV_REPORT_FILE):
        print("CSV report not found. Generating report first...")
        video_data = get_all_playlist_items(PLAYLIST_ID)
        video_details = get_video_details([video["video_id"] for video in video_data])
        # Merge video_data and video_details
        merged_data = []
        details_dict = {video["video_id"]: video for video in video_details}
        for video in video_data:
            details = details_dict.get(video["video_id"], {})
            merged_video = {
                "video_id": video["video_id"],
                "title": video["title"],
                "view_count": details.get("view_count", 0),
                "like_count": details.get("like_count", 0),
                "comment_count": details.get("comment_count", 0),
                "duration_seconds": details.get("duration_seconds", 0),
            }
            merged_data.append(merged_video)
        save_progress(merged_data)
        generate_full_report(merged_data)

    return recommend_next_videos(n)


def main():
    parser = argparse.ArgumentParser(
        description="YouTube Playlist Performance Report Generator"
    )
    parser.add_argument(
        "--offline-partial",
        action="store_true",
        help="Generate a partial report using cached data without making API calls",
    )
    parser.add_argument(
        "--recommend-next-n",
        type=int,
        help="Recommend the next n top-performing videos, assuming the CSV report is already created.",
    )
    args = parser.parse_args()

    if args.recommend_next_n is not None:
        # Recommend next n videos
        recommended_videos = recommend_next_videos(args.recommend_next_n)
        if recommended_videos:
            print("\nHere are the recommended video URLs:")
            for url in recommended_videos:
                print(url)
    else:
        if args.offline_partial:
            video_data = load_progress()
            if not video_data:
                print(
                    "No cached data available. Please run the script in online mode first."
                )
                return
            print(
                f"Generating offline partial report based on {len(video_data)} cached videos."
            )
        else:
            print(f"Fetching all playlist data and sorting by view count...")
            video_data = get_all_playlist_items(PLAYLIST_ID)
            video_details = get_video_details(
                [video["video_id"] for video in video_data]
            )
            # Merge video_data and video_details
            merged_data = []
            details_dict = {video["video_id"]: video for video in video_details}
            for video in video_data:
                details = details_dict.get(video["video_id"], {})
                merged_video = {
                    "video_id": video["video_id"],
                    "title": video["title"],
                    "view_count": details.get("view_count", 0),
                    "like_count": details.get("like_count", 0),
                    "comment_count": details.get("comment_count", 0),
                    "duration_seconds": details.get("duration_seconds", 0),
                }
                merged_data.append(merged_video)
            save_progress(merged_data)

        if not video_data:
            print(
                "No valid video data could be retrieved. Please check your API key and playlist ID."
            )
            return

        print(f"\nGenerating report for {len(video_data)} videos...")
        generate_full_report(video_data)


if __name__ == "__main__":
    main()
