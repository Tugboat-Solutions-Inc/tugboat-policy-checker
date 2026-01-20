export type VideoStatus =
  | "initiated"
  | "uploading"
  | "processing"
  | "ready"
  | "failed";

export interface Video {
  id: string;
  collection_id: string;
  user_id: string;
  bunny_video_id: string;
  title: string;
  thumbnail: string | null;
  video_status: VideoStatus;
  bunny_status_code: number | null;
  bunny_last_event_at: string | null;
  created_at: string;
  updated_at: string;
  signed_url: string | null;
  signed_thumbnail_url: string | null;
}

export interface InitVideoUploadResponse {
  endpoint: string;
  headers: Record<string, string>;
  videoId: string;
  expireAt: number;
}
