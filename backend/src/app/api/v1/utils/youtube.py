from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from enum import Enum
import yt_dlp
import os
import tempfile
import shutil
from starlette.background import BackgroundTask
from urllib.parse import quote
import asyncio
from functools import partial
from ..websocket import YoutubeDownloadProgressHook

router = APIRouter(tags=["utils"])

class Resolution(str, Enum):
    R360 = "360p"
    R480 = "480p"
    R720 = "720p"
    R1080 = "1080p"

class Format(str, Enum):
    MP4 = "mp4"
    MP3 = "mp3"

class YouTubeURL(BaseModel):
    url: str
    resolution: str
    format: Format

class DownloadResponse(BaseModel):
    status: str
    file_path: str
    title: str
    

@router.post("/youtube-download/{client_id}")
async def download_video(video: YouTubeURL, client_id: str):
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()

        # 해상도에 따른 format 문자열 설정    
        format_strings = {
            Resolution.R360: 'bestvideo[height<=360][ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=360][ext=mp4][vcodec^=avc1]',
            Resolution.R480: 'bestvideo[height<=480][ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=480][ext=mp4][vcodec^=avc1]',
            Resolution.R720: 'bestvideo[height<=720][ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=720][ext=mp4][vcodec^=avc1]',
            Resolution.R1080: 'bestvideo[height<=1080][ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4][vcodec^=avc1]'
        }
        # 기본 다운로드 옵션
        base_opts = {
            'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
        }

        # progress_hook 인스턴스 생성
        progress_hook = YoutubeDownloadProgressHook(client_id, video.format == Format.MP3)

        if video.format == Format.MP3:
            # MP3 다운로드 옵션
            download_opts = {
                **base_opts,
                'format': 'bestaudio[ext=m4a]/best',
                'progress_hooks': [progress_hook.progress_hook],
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }
        else:
            # MP4 다운로드 옵션
            download_opts = {
                **base_opts,
                'format': format_strings.get(video.resolution, format_strings[Resolution.R360]),
                'progress_hooks': [progress_hook.progress_hook],
                'postprocessor_args': {
                    'ffmpeg': [
                        '-c:v', 'copy',
                        '-c:a', 'copy',
                        '-movflags', '+faststart'
                    ]
                },
                'merge_output_format': 'mp4'
            }

        # progress_hook = YoutubeDownloadProgressHook(client_id)
        # download_opts['progress_hooks'] = [progress_hook.progress_hook]
        
        # 다운로드 함수를 별도로 정의
        async def download():
            loop = asyncio.get_event_loop()
            with yt_dlp.YoutubeDL(download_opts) as ydl:
                # run_in_executor를 사용하여 비동기적으로 실행
                return await loop.run_in_executor(
                    None, 
                    partial(ydl.extract_info, str(video.url), download=True)
                )

        # 타임아웃 설정 (예: 5분)
        try:
            info = await asyncio.wait_for(download(), timeout=300)  # 300초 = 5분
        except asyncio.TimeoutError:
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            raise HTTPException(
                status_code=408,
                detail="Download timed out after 1 minute"
            )

        title = info.get('title', 'video')
        # UTF-8로 인코딩된 파일명으로 헤더 설정
        encoded_title = quote(title)
        
        # 파일 확장자 동적 처리
        file_extension = '.mp3' if video.format == Format.MP3 else '.mp4'
        downloaded_files = [f for f in os.listdir(temp_dir) if f.endswith(file_extension)]
        
        if not downloaded_files:
            raise HTTPException(
                status_code=500,
                detail=f"Download failed: No {file_extension} file found"
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
        
        # 파일명 생성 시 format 반영
        safe_filename = f"{safe_title}_{video.resolution if video.format == Format.MP4 else 'audio'}{file_extension}"
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
            'Content-Disposition': f'attachment; filename*=UTF-8\'\'{encoded_title}{file_extension}'
        }
        
        return FileResponse(
            path=safe_path,
            filename=safe_filename,
            media_type='audio/mpeg' if video.format == Format.MP3 else 'video/mp4',
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

@router.get("/youtube-video/info/{video_id}")
def get_video_info(video_id: str):
    try:
        ydl_opts = {
            "format": f'best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        url = f"https://www.youtube.com/watch?v={video_id}"
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            formats = info.get('formats', [])
            allow_resolutions = []
            resolution_index = {}  # resolution을 키로 하여 allow_resolutions의 인덱스를 저장

            for fmt in formats:
                resolution = fmt.get('format_note')
                if (fmt.get('url') and
                    not fmt.get('url').startswith('https://manifest.googlevideo.com/') and
                    fmt.get('video_ext') == 'mp4' and 
                    resolution):
                    
                    is_audio = fmt.get('acodec') != 'none'
                    new_format = { 
                        "resolution": resolution,
                        "is_audio": is_audio,
                        "download_url": fmt.get('url')
                    }

                    if resolution in resolution_index:
                        # 기존 포맷의 인덱스
                        idx = resolution_index[resolution]
                        # 기존 포맷이 오디오가 없고, 새 포맷이 오디오가 있는 경우 교체
                        if not allow_resolutions[idx]['is_audio'] and is_audio:
                            allow_resolutions[idx] = new_format
                    else:
                        # 새로운 resolution인 경우
                        allow_resolutions.append(new_format)
                        resolution_index[resolution] = len(allow_resolutions) - 1
                
            sorted_resolutions = sorted(
                allow_resolutions, 
                key=lambda x: _resolution_to_number(x['resolution']),
                reverse=False
            )
            
            return {
                "info": info,
                "allow_resolutions": sorted_resolutions
            }        

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get video info: {str(e)}"
        )

def _resolution_to_number(resolution: str) -> int:
    """해상도 문자열을 숫자로 변환하는 헬퍼 함수"""
    if not resolution:
        return 0
    try:
        return int(resolution.lower().replace('p', ''))
    except ValueError:
        return 0

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