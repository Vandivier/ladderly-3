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


def replace_smart_quotes(s: str):
    s = s.replace("\u2018", "'").replace("\u2019", "'")
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    return s


def wrangle_transcript(transcript: str):
    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "laterally": "Ladderly",
        "latterly": "Ladderly",
        "latly": "Ladderly",
        "doio": "dot io",
        "arya tale": "Aria's Tale",
        "arus tale": "Aria's Tale",
        "arya": "aria",
    }

    result = transcript.lower()
    for old, new in replacements.items():
        result = result.replace(old, new)

    return result


def remove_hashtags(title):
    return " ".join(word for word in title.split() if not word.startswith("#"))


def main():
    if not os.path.exists(data_dir):
        print(f"The directory containing raw transcripts does not exist: {data_dir}")
        exit(1)

    with open("low_value_transcript_urls.json", "r") as low_value_urls_file:
        low_value_urls = json.load(low_value_urls_file)

    with open(output_file, "w", encoding="utf-8") as out_f:
        for filename in os.listdir(data_dir):
            if filename.endswith(".json"):
                with open(os.path.join(data_dir, filename), "r") as in_f:
                    video_data: VideoData = json.load(in_f)

                    if (
                        not video_data["transcript"]
                        or video_data["url"] in low_value_urls
                    ):
                        continue

                    transcript = "\n".join(
                        [segment["text"] for segment in video_data["transcript"]]
                    )

                    out_f.write(replace_smart_quotes(f"\nURL: {video_data['url']}\n"))
                    title = remove_hashtags(video_data["title"])
                    title = title.strip()
                    if title:
                        out_f.write(replace_smart_quotes(f"Title: {title}\n"))
                    if video_data["description"]:
                        out_f.write(
                            replace_smart_quotes(
                                f"Description: {video_data['description']}\n"
                            )
                        )
                    out_f.write("Transcript:\n")
                    out_f.write(wrangle_transcript(transcript + "\n"))

    print(f"Consolidated transcript written to {output_file}")

    file_info = os.stat(output_file)
    file_size_MB = file_info.st_size / 1024 / 1024
    print(f"File size: {file_size_MB:.2f} MB")

    with open(output_file, "r", encoding="utf-8") as f:
        text = f.read()
    char_count = len(text)
    print(f"Character count: {char_count}")

    token_count_estimate = char_count // 4
    print(f"Estimated token count: {token_count_estimate}")


if __name__ == "__main__":
    main()
