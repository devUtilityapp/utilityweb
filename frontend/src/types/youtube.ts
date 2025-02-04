export type YouTubeDownloadResolution = "360p" | "480p" | "720p" | "1080p";

// YouTube 관련 타입 정의
export type YouTubeDownloadRequest = {
	url: string;
	resolution: YouTubeDownloadResolution;
	format: "mp4";
};

interface Fragment {
	url: string;
	duration: number;
}

interface HttpHeaders {
	"User-Agent": string;
	Accept: string;
	"Accept-Language": string;
	"Sec-Fetch-Mode": string;
}

interface Format {
	format_id: string;
	format_note?: string;
	format_index?: number | null;
	url: string;
	manifest_url?: string;
	ext: string;
	width?: number | null;
	height?: number | null;
	fps?: number | null;
	fps_denom?: number;
	protocol: string;
	preference?: number | null;
	quality?: number;
	has_drm: boolean;
	tbr?: number | null;
	language?: string | null;
	language_preference?: number;
	format?: string;
	resolution?: string;
	aspect_ratio?: number | null;
	vcodec?: string;
	acodec?: string;
	dynamic_range?: string | null;
	audio_ext?: string;
	video_ext?: string;
	vbr?: number;
	abr?: number | null;
	asr?: number;
	filesize?: number;
	filesize_approx?: number | null;
	rows?: number;
	columns?: number;
	fragments?: Array<Fragment>;
	http_headers: HttpHeaders;
	source_preference?: number;
	audio_channels?: number;
	container?: string;
	downloader_options?: {
		http_chunk_size: number;
	};
}

interface Heatmap {
	start_time: number;
	end_time: number;
	value: number;
}

interface Chapter {
	start_time: number;
	end_time: number;
	title: string;
}

export interface ResponseYouTubeVideoInfo {
	id: string;
	title: string;
	formats: Array<Format>;
	thumbnail: string;
	description: string;
	channel_id: string;
	channel_url: string;
	duration: number;
	view_count: number;
	average_rating: number | null;
	age_limit: number;
	webpage_url: string;
	categories: Array<string>;
	tags: Array<string>;
	playable_in_embed: boolean;
	live_status: string;
	media_type: string | null;
	release_timestamp: number | null;
	automatic_captions: Record<string, unknown>;
	subtitles: Record<string, unknown>;
	comment_count: number;
	chapters: Array<Chapter> | null;
	heatmap: Array<Heatmap>;
	like_count: number;
	channel: string;
	channel_follower_count: number;
	channel_is_verified: boolean;
	uploader: string;
	uploader_id: string;
	uploader_url: string;
	upload_date: string;
	availability: string;
	original_url: string;
	webpage_url_basename: string;
	webpage_url_domain: string;
	extractor: string;
	extractor_key: string;
	display_id: string;
	fulltitle: string;
	duration_string: string;
	is_live: boolean;
	was_live: boolean;
	_format_sort_fields: Array<string>;
	requested_formats: Array<Format>;
	format: string;
	format_id: string;
}
