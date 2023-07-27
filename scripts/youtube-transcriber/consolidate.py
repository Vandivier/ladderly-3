import os
import json
from typing import Optional, TypedDict


class TranscriptSegment(TypedDict):
    text: str
    start: float
    duration: float


class VideoData(TypedDict):
    id: str
    url: str
    title: str
    description: str
    publish_date: str
    length: int
    views: int
    likes: int
    dislikes: int
    comments: int
    thumbnail: str
    channel: str
    transcript: Optional[list[TranscriptSegment]]


data_dir = "video_data"
output_file = "consolidated_transcript.txt"

if not os.path.exists(data_dir):
    print(f"The directory containing raw transcripts does not exist: {data_dir}")
    exit(1)

with open(output_file, "w") as out_f:
    for filename in os.listdir(data_dir):
        if filename.endswith(".json"):
            with open(os.path.join(data_dir, filename), "r") as in_f:
                video_data: VideoData = json.load(in_f)

                if not video_data["transcript"]:
                    continue

                transcript = "\n".join(
                    [segment["text"] for segment in video_data["transcript"]]
                )

                out_f.write(f"\nURL: {video_data['url']}\n")
                out_f.write(f"Title: {video_data['title']}\n")
                out_f.write(f"Description: {video_data['description']}\n")
                out_f.write("Transcript:\n")
                out_f.write(transcript + "\n")

print(f"Consolidated transcript written to {output_file}")
