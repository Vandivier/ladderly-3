import json
import os
from pytube import Playlist, YouTube
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv

load_dotenv()
playlist_url = os.getenv("youtube_playlist_url")
should_bust_cache = os.getenv("should_bust_cache", "False").lower() == "true"

if not playlist_url:
    playlist_url = input("Enter YouTube playlist URL: ")

output_dir = "video_data"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

playlist = Playlist(playlist_url)
for url in playlist.video_urls:
    video_id = url.split("?v=")[1]

    # Check if we should bust cache
    output_path = os.path.join(output_dir, f"{video_id}.json")
    if not should_bust_cache and os.path.exists(output_path):
        print(f"Skipping video {video_id} as it already exists in cache.")
        continue

    yt = YouTube(url)
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
    except:
        print(
            f"An error occurred when trying to get the transcript of the video: {url}"
            "\nThe transcript may not exist."
        )
        transcript = None

    video_data = {
        "id": video_id,
        "url": f"https://youtu.be/{video_id}",
        "title": yt.title,
        "description": yt.description,
        "publish_date": yt.publish_date.isoformat() if yt.publish_date else None,
        "length": yt.length,
        "views": yt.views,
        "channel": yt.author,
        "transcript": transcript,
    }

    output_path = os.path.join(output_dir, f"{video_id}.json")
    with open(output_path, "w") as f:
        json.dump(video_data, f, indent=2)

print("Video data extracted to", output_dir)
