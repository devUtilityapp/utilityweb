import traceback

from firebase_admin import initialize_app
from firebase_functions import https_fn, options

import yt_dlp

from utils import _resolution_to_number

initialize_app()


class _YdlLogger:
    """yt-dlp가 stderr로 직접 쓰지 못하게 막는 로거.

    Cloud Functions는 sys.stderr를 텍스트 전용 객체로 감싸는데, yt-dlp의
    write_string은 stderr.buffer에 bytes를 쓰려고 해서
    "string argument expected, got 'bytes'"로 터진다. 그러면 정작 원래 오류
    메시지는 사라지고 이 TypeError만 남는다.
    """

    def __init__(self):
        self.errors = []

    def debug(self, message):
        pass

    def info(self, message):
        pass

    def warning(self, message):
        print(f"yt-dlp warning: {message}")

    def error(self, message):
        self.errors.append(message)
        print(f"yt-dlp error: {message}")


# 정보 조회만 하므로 포맷 선택은 하지 않는다.
# player_client를 android로 강제하거나 dash/hls를 skip하면 진행형 mp4 포맷이
# 거의 걸러져서 사용 가능한 화질이 1개 이하로 줄어든다.
YDL_OPTS = {
    'quiet': True,
    'no_warnings': True,
    'no_color': True,
    'extract_flat': False,
    'skip_download': True,
}

# 데이터센터 IP는 YouTube 봇 판정에 자주 걸린다("Sign in to confirm you're not
# a bot"). 판정 여부가 클라이언트마다 달라서 성공할 때까지 순서대로 시도한다.
PLAYER_CLIENTS = [None, 'tv', 'web_safari', 'mweb']


def _describe(error, logger):
    return str(error) or (logger.errors[-1] if logger.errors else repr(error))


def _extract_info(url, logger):
    last_error = None

    for player_client in PLAYER_CLIENTS:
        opts = {**YDL_OPTS, 'logger': logger}
        if player_client:
            opts['extractor_args'] = {'youtube': {'player_client': [player_client]}}

        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
            print(f"extracted with player_client={player_client or 'default'}")
            return info
        except Exception as error:  # 다음 클라이언트로 넘어간다
            print(f"player_client={player_client or 'default'} failed: {_describe(error, logger)}")
            last_error = error

    raise last_error


def _collect_resolutions(formats):
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
                # 같은 화질이면 소리가 있는 포맷을 우선한다
                idx = resolution_index[resolution]
                if not allow_resolutions[idx]['is_audio'] and is_audio:
                    allow_resolutions[idx] = new_format
            else:
                allow_resolutions.append(new_format)
                resolution_index[resolution] = len(allow_resolutions) - 1

    return sorted(
        allow_resolutions,
        key=lambda x: _resolution_to_number(x['resolution']),
        reverse=False
    )


@https_fn.on_request(region="asia-northeast2",
        cors=options.CorsOptions(
        cors_origins=[r"*"],
        cors_methods=["get"],
    ))
def get_video_info(req: https_fn.Request) -> https_fn.Response:
    logger = _YdlLogger()

    try:
        video_id = req.args.get('video_id')

        if not video_id:
            return {'error': 'video_id is required', 'status': 400}

        info = _extract_info(f"https://www.youtube.com/watch?v={video_id}", logger)

        return {
            "info": info,
            "allow_resolutions": _collect_resolutions(info.get('formats', [])),
            "status": 200
        }

    except Exception as e:
        # 메시지만 반환하면 Cloud Logging에 아무것도 남지 않아 원인을 찾을 수 없다.
        message = _describe(e, logger)
        print(f"get_video_info failed: {message}")
        traceback.print_exc()
        return {
            'error': f"Failed to get video info: {message}",
            'status': 500
        }
