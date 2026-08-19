def _resolution_to_number(resolution: str) -> int:
    """해상도 문자열을 숫자로 변환하는 헬퍼 함수"""
    if not resolution:
        return 0
    try:
        return int(resolution.lower().replace('p', ''))
    except ValueError:
        return 0