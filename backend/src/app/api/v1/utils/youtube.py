from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl
from enum import Enum
import yt_dlp
import os
from typing import Optional
import subprocess
from pathlib import Path
import tempfile
import shutil
from starlette.background import BackgroundTask
from urllib.parse import quote

router = APIRouter(tags=["utils"])

class Resolution(str, Enum):
    R360 = "360p"
    R480 = "480p"
    R720 = "720p"
    R1080 = "1080p"

class YouTubeURL(BaseModel):
    url: HttpUrl = "https://www.youtube.com/watch?v=2C3CuRQcBuM"
    format: Optional[str] = "mp4"
    resolution: Optional[Resolution] = Resolution.R360  # 기본값 360p

class DownloadResponse(BaseModel):
    status: str
    file_path: str
    title: str
    


@router.post("/youtube-download")
async def download_video(video: YouTubeURL):
    temp_dir = None
    try:
        # 임시 디렉토리 생성
        temp_dir = tempfile.mkdtemp()
        
        # 해상도에 따른 format 문자열 설정
        format_strings = {
            Resolution.R360: 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]',
            Resolution.R480: 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]',
            Resolution.R720: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]',
            Resolution.R1080: 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]'
        }
        
        download_opts = {
            'format': format_strings.get(video.resolution, format_strings[Resolution.R360]),
            'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': video.format,
            }],
        }

        # YouTube 동영상 정보 추출 및 다운로드
        with yt_dlp.YoutubeDL(download_opts) as ydl:
            info = ydl.extract_info(str(video.url), download=True)
            title = info.get('title', 'video')
            # UTF-8로 인코딩된 파일명으로 헤더 설정
            encoded_title = quote(title)
            
            # 다운로드된 파일 찾기
            downloaded_files = [f for f in os.listdir(temp_dir) if f.endswith('.mp4')]
            if not downloaded_files:
                raise HTTPException(
                    status_code=500,
                    detail="Download failed: No MP4 file found"
                )
            
            # 실제 다운로드된 파일의 경로
            actual_file = os.path.join(temp_dir, downloaded_files[0])
            
            if not os.path.exists(actual_file):
                raise HTTPException(
                    status_code=500,
                    detail="Download failed: File not found after download"
                )
            
            # 안전한 출력 파일명 생성
            
            safe_title = "".join(c for c in title if c.isalnum() or c in ('-', '_')).strip()
            if not safe_title:
                safe_title = "video"
            
            # 임시 파일을 새로운 이름으로 복사
            safe_filename = f"{safe_title}_{video.resolution}.mp4"
            safe_path = os.path.join(temp_dir, safe_filename)
            shutil.copy2(actual_file, safe_path)
            
            def cleanup_temp_dir():
                try:
                    if temp_dir and os.path.exists(temp_dir):
                        shutil.rmtree(temp_dir)
                        print(f"Cleaned up temp directory: {temp_dir}")
                except Exception as e:
                    print(f"Failed to clean up temp directory: {str(e)}")
            

            headers = {
                'Content-Disposition': f'attachment; filename*=UTF-8\'\'{encoded_title}.mp4'
            }
            
            return FileResponse(
                path=safe_path,
                filename=safe_filename,
                media_type="video/mp4",
                headers=headers,
                background=BackgroundTask(cleanup_temp_dir)
            )

    except Exception as e:
        print(f"Error details: {str(e)}")
        if temp_dir and os.path.exists(temp_dir):
            print(f"Temp directory contents: {os.listdir(temp_dir)}")
            try:
                shutil.rmtree(temp_dir)
                print(f"Cleaned up temp directory on error: {temp_dir}")
            except Exception as cleanup_error:
                print(f"Failed to clean up temp directory: {str(cleanup_error)}")
        raise HTTPException(
            status_code=500,
            detail=f"Download failed: {str(e)}"
        )

@router.get("/youtube-video/formats/{video_id}")
async def get_video_formats(video_id: str):
    try:
        url = f"https://www.youtube.com/watch?v={video_id}"
        with yt_dlp.YoutubeDL() as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            
            return {
                "title": info.get('title'),
                "formats": [
                    {
                        "format_id": f.get('format_id'),
                        "ext": f.get('ext'),
                        "resolution": f.get('resolution'),
                        "filesize": f.get('filesize'),
                        "format": f.get('format')
                    }
                    for f in formats
                ]
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get video formats: {str(e)}"
        )

# 사용 가능한 해상도 조회 API 추가
@router.get("/available-resolutions")
async def get_available_resolutions():
    return {
        "resolutions": [resolution.value for resolution in Resolution],
        "default": Resolution.R360.value
    }