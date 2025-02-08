from fastapi import APIRouter, WebSocket
import asyncio
import logging
from typing import Dict, Optional
from dataclasses import dataclass
from time import time

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DownloadProgress:
    progress: float
    speed: float
    eta: int
    status: str
    phase: str  # 추가: 현재 다운로드 단계

    @classmethod
    def from_yt_dlp_data(cls, d: Dict, is_mp3: bool = False) -> Optional['DownloadProgress']:
        """yt-dlp 데이터로부터 DownloadProgress 객체 생성"""
        if d['status'] != 'downloading':
            return None
            
        total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
        downloaded = d.get('downloaded_bytes', 0)
        if not total:
            return None

        # 현재 다운로드 중인 파일 정보로 phase 결정
        filename = d.get('filename', '').lower()
        phase = 'audio' if '.m4a' in filename else 'video'
        
        progress = (downloaded / total) * 100
        
        if is_mp3:
            # MP3는 다운로드를 50%까지로 조정
            progress = progress * 0.5  # 최대 50%   
            phase = 'downloading audio'
        else:
            if phase == 'audio':
                # 오디오는 50-99% 구간으로 조정
                progress = min(50 + (progress / 2), 99)
            else:
                # 비디오는 0-50% 구간으로 조정
                progress = progress / 2

        return cls(
            progress=round(progress, 1),
            speed=round((d.get('speed', 0) or 0) / 1024 / 1024, 1),
            eta=d.get('eta', 0) or 0,
            status='downloading',
            phase=phase
        )

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.last_update: Dict[str, Dict] = {}  # 마지막 업데이트 시간과 진행률 저장
        self.UPDATE_INTERVAL = 0.5  # 최소 업데이트 간격 (초)
        self.MIN_PROGRESS_CHANGE = 1.0  # 최소 진행률 변화 (퍼센트)

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.last_update[client_id] = {"time": 0, "progress": 0}
        logger.info(f"WebSocket connected for client: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            self.last_update.pop(client_id, None)
            logger.info(f"WebSocket connection closed for client: {client_id}")

    async def send_progress(self, client_id: str, progress: DownloadProgress):
        """진행률 전송 (최적화된 버전)"""
        if client_id not in self.active_connections:
            return

        current_time = time()
        last_update = self.last_update[client_id]
        
        # 업데이트 조건 확인
        time_elapsed = current_time - last_update["time"]
        progress_change = abs(progress.progress - last_update["progress"])
        
        # 충분한 시간이 지났거나 진행률 변화가 큰 경우에만 업데이트
        if time_elapsed >= self.UPDATE_INTERVAL or progress_change >= self.MIN_PROGRESS_CHANGE:
            try:
                await self.active_connections[client_id].send_json(progress.__dict__)
                self.last_update[client_id] = {
                    "time": current_time,
                    "progress": progress.progress
                }
                logger.debug(f"Progress sent to client: {client_id}")  # INFO -> DEBUG
            except Exception as e:
                logger.error(f"Failed to send progress: {str(e)}")
                self.disconnect(client_id)

# 전역 WebSocket 매니저 인스턴스
ws_manager = WebSocketManager()

class YoutubeDownloadProgressHook:
    def __init__(self, client_id: str, is_mp3: bool = False):
        self.client_id = client_id
        self.is_mp3 = is_mp3
        self._loop = asyncio.get_event_loop()
        logger.info(f"Progress hook initialized for client: {client_id}")

    def progress_hook(self, d: Dict):
        """yt-dlp progress hook"""
        try:
            progress = DownloadProgress.from_yt_dlp_data(d, self.is_mp3)
            if progress:
                future = asyncio.run_coroutine_threadsafe(
                    ws_manager.send_progress(self.client_id, progress),
                    self._loop
                )
                future.result(timeout=1)
        except Exception as e:
            logger.error(f"Error in progress hook: {str(e)}")

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket 엔드포인트"""
    await ws_manager.connect(client_id, websocket)
    
    try:
        while True:
            try:
                await websocket.receive_text()
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {str(e)}")
                break
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        ws_manager.disconnect(client_id)