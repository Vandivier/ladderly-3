# manage_playlist.py

"""
YouTube Playlist Manager

This script manages a YouTube playlist by creating it if it doesn't exist,
clearing its contents if it does, and adding a list of recommended videos.

Usage:
1. Prepare your environment asspecified in `installation and usage` in ./README.md

2. Run the script. All flags are optional:
   python manage_playlist.py --playlist-name "Your Playlist Name" [--video-count N]
   - If --video-count is omitted or set to -1, all top-performing videos will be added.
"""

from datetime import datetime
import os
import argparse
from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from report import get_recommended_videos

# Scopes required for managing playlists
SCOPES = ["https://www.googleapis.com/auth/youtube"]

load_dotenv()

CLIENT_SECRET_FILE = os.getenv("YOUTUBE_CLIENT_SECRET_FILE", "client_secret.ignoreme.json")

def get_authenticated_service():
    """
    Authenticates the user with YouTube API using OAuth 2.0.

    Returns:
        Resource: Authorized YouTube API client.
    """
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
    credentials = flow.run_console()
    return build("youtube", "v3", credentials=credentials)

def get_playlist_id(youtube, playlist_name):
    """
    Retrieves the playlist ID for a given playlist name.

    Args:
        youtube (Resource): Authorized YouTube API client.
        playlist_name (str): Name of the playlist.

    Returns:
        str or None: Playlist ID if found, else None.
    """
    try:
        request = youtube.playlists().list(
            part="snippet",
            mine=True,
            maxResults=50
        )
        response = request.execute()
        for item in response.get("items", []):
            if item["snippet"]["title"].lower() == playlist_name.lower():
                return item["id"]
        return None
    except HttpError as e:
        print(f"An error occurred while fetching playlists: {e}")
        return None

def create_playlist(youtube, playlist_name, description=""):
    """
    Creates a new YouTube playlist.

    Args:
        youtube (Resource): Authorized YouTube API client.
        playlist_name (str): Name of the playlist.
        description (str): Description of the playlist.

    Returns:
        str or None: New playlist ID if created, else None.
    """
    try:
        request = youtube.playlists().insert(
            part="snippet,status",
            body={
                "snippet": {
                    "title": playlist_name,
                    "description": description,
                    "tags": ["automated", "playlist"],
                    "defaultLanguage": "en"
                },
                "status": {
                    "privacyStatus": "private"  # Change to "public" or "unlisted" if desired
                }
            }
        )
        response = request.execute()
        print(f"Created playlist '{playlist_name}' with ID: {response['id']}")
        return response["id"]
    except HttpError as e:
        print(f"An error occurred while creating playlist: {e}")
        return None

def clear_playlist(youtube, playlist_id):
    """
    Clears all videos from a given playlist.

    Args:
        youtube (Resource): Authorized YouTube API client.
        playlist_id (str): ID of the playlist to clear.
    """
    try:
        request = youtube.playlistItems().list(
            part="id",
            playlistId=playlist_id,
            maxResults=50
        )
        response = request.execute()
        while response:
            for item in response.get("items", []):
                youtube.playlistItems().delete(id=item["id"]).execute()
                print(f"Deleted video with Playlist Item ID: {item['id']}")
            if "nextPageToken" in response:
                request = youtube.playlistItems().list(
                    part="id",
                    playlistId=playlist_id,
                    maxResults=50,
                    pageToken=response["nextPageToken"]
                )
                response = request.execute()
            else:
                break
        print(f"Cleared all videos from playlist ID: {playlist_id}")
    except HttpError as e:
        print(f"An error occurred while clearing playlist: {e}")

def add_videos_to_playlist(youtube, playlist_id, video_urls):
    """
    Adds a list of videos to a specified playlist.

    Args:
        youtube (Resource): Authorized YouTube API client.
        playlist_id (str): ID of the playlist.
        video_urls (list): List of YouTube video URLs to add.
    """
    try:
        for url in video_urls:
            video_id = extract_video_id(url)
            if not video_id:
                print(f"Invalid YouTube URL: {url}. Skipping.")
                continue
            request = youtube.playlistItems().insert(
                part="snippet",
                body={
                    "snippet": {
                        "playlistId": playlist_id,
                        "resourceId": {
                            "kind": "youtube#video",
                            "videoId": video_id
                        }
                    }
                }
            )
            response = request.execute()
            print(f"Added video {video_id} to playlist with Playlist Item ID: {response['id']}")
    except HttpError as e:
        print(f"An error occurred while adding videos: {e}")

def extract_video_id(url):
    """
    Extracts the video ID from a YouTube URL.

    Args:
        url (str): YouTube video URL.

    Returns:
        str or None: Video ID if extracted, else None.
    """
    from urllib.parse import urlparse, parse_qs
    parsed_url = urlparse(url)
    if parsed_url.hostname in ['youtu.be']:
        return parsed_url.path[1:]
    if parsed_url.hostname in ['www.youtube.com', 'youtube.com']:
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query).get('v', [None])[0]
        elif parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
        elif parsed_url.path.startswith('/v/'):
            return parsed_url.path.split('/')[2]
    return None

def main():
    parser = argparse.ArgumentParser(
        description="YouTube Playlist Manager: Create or update a playlist with recommended videos."
    )
    today_as_string = datetime.now().strftime("%m/%d/%Y")
    parser.add_argument(
        "--playlist-name",
        type=str,
        default=f"Top Videos for ${today_as_string}",
        help="Name of the YouTube playlist to create or update."
    )
    parser.add_argument(
        "--description",
        type=str,
        default="",
        help="Description for the YouTube playlist."
    )
    parser.add_argument(
        "--video-count",
        type=int,
        default=-1,
        help="Number of top-performing videos to add to the playlist (-1 for all)."
    )
    args = parser.parse_args()

    playlist_name = args.playlist_name
    video_count = args.video_count
    description = args.description

    # Fetch recommended videos using the specified video_count
    if video_count == -1:
        print("Fetching all recommended videos...")
    else:
        print(f"Fetching top {video_count} recommended videos...")
    recommended_videos = get_recommended_videos(video_count)
    if not recommended_videos:
        print("No recommended videos found. Exiting.")
        return

    # Authenticate and manage playlist
    print("Authenticating with YouTube...")
    youtube = get_authenticated_service()

    # Check if the playlist exists
    playlist_id = get_playlist_id(youtube, playlist_name)
    if playlist_id:
        print(f"Playlist '{playlist_name}' exists with ID: {playlist_id}")
        # Clear existing videos
        print("Clearing existing videos from the playlist...")
        clear_playlist(youtube, playlist_id)
    else:
        # Create the playlist
        print(f"Playlist '{playlist_name}' does not exist. Creating a new playlist...")
        playlist_id = create_playlist(youtube, playlist_name, description)
        if not playlist_id:
            print("Failed to create the playlist. Exiting.")
            return

    # Add recommended videos to the playlist
    print("Adding recommended videos to the playlist...")
    add_videos_to_playlist(youtube, playlist_id, recommended_videos)
    print("Playlist update complete.")

if __name__ == "__main__":
    main()
