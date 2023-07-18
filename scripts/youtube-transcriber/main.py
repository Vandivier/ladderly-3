import json
import os
import youtube_dl
from youtube_transcript_api import YouTubeTranscriptApi

# Set up output folder
output_dir = "video_data"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Get playlist URL
playlist_url = input("Enter YouTube playlist URL: ")

# Use youtube_dl to extract video IDs
ydl = youtube_dl.YoutubeDL({"verbose": True})
playlist = ydl.extract_info(playlist_url, download=False)

video_ids = []
for entry in playlist["entries"]:
    video_ids.append(entry["id"])

# Iterate through video IDs
for video_id in video_ids:
    # Get transcript
    transcript = YouTubeTranscriptApi.get_transcript(video_id)

    # Get additional metadata
    ydl = youtube_dl.YoutubeDL({"verbose": True})
    info = ydl.extract_info(f"http://youtu.be/{video_id}", download=False)

    # Construct output dict
    video_data = {
        "id": video_id,
        "url": f"http://youtu.be/{video_id}",
        "playlist_url": playlist_url,
        "title": info["title"],
        "description": info["description"],
        "publish_date": info["upload_date"],
        "length": info["duration"],
        "views": info["view_count"],
        "likes": info["like_count"],
        "dislikes": info["dislike_count"],
        "comments": info["comment_count"],
        "thumbnail": info["thumbnail"],
        "tags": info["tags"],
        "channel": info["channel"],
        "category": info["categories"][0],
        "transcript": transcript,
    }

    # Write JSON file
    output_path = os.path.join(output_dir, f"{video_id}.json")

    with open(output_path, "w") as f:
        json.dump(video_data, f, indent=2)

print("Video data extracted to", output_dir)
