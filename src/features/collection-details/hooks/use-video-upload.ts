import { useState, useCallback, useRef, useEffect } from "react";
import * as tus from "tus-js-client";
import { createClient } from "@/utils/supabase/client";
import { initVideoUpload, getVideo } from "../api/video.actions";
import type { UploadingVideo } from "../components/walkthrough-uploading-card";
import type { WalkthroughVideo } from "../types/collection-details.types";

interface UseVideoUploadOptions {
  propertyId: string;
  unitId: string;
  collectionId: string;
  onUploadComplete?: (video: WalkthroughVideo) => void;
  onUploadError?: (error: string) => void;
}

interface TusUploadInstance {
  upload: tus.Upload;
  abortController: AbortController;
}

export function useVideoUpload({
  propertyId,
  unitId,
  collectionId,
  onUploadComplete,
  onUploadError,
}: UseVideoUploadOptions) {
  const [uploadingVideos, setUploadingVideos] = useState<UploadingVideo[]>([]);
  const uploadInstances = useRef<Map<string, TusUploadInstance>>(new Map());
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pollingRetryCount = useRef<Map<string, number>>(new Map());

  const pollVideoStatus = useCallback(
    async (videoId: string, uploadId: string, fileName: string) => {
      pollingRetryCount.current.set(uploadId, 0);

      const intervalId = setInterval(async () => {
        const result = await getVideo(
          propertyId,
          unitId,
          collectionId,
          videoId
        );

        if (result.success && result.data) {
          pollingRetryCount.current.set(uploadId, 0);
          const video = result.data;

          if (video.video_status === "ready") {
            clearInterval(intervalId);
            pollingIntervals.current.delete(uploadId);
            pollingRetryCount.current.delete(uploadId);
            setUploadingVideos((prev) => prev.filter((u) => u.id !== uploadId));

            const walkthroughVideo: WalkthroughVideo = {
              id: video.id,
              bunnyVideoId: video.bunny_video_id,
              title: video.title || fileName,
              thumbnailUrl: video.signed_thumbnail_url || "",
              videoUrl: video.signed_url || "",
              duration: "",
              createdAt: video.created_at,
            };
            onUploadComplete?.(walkthroughVideo);
          } else if (video.video_status === "failed") {
            clearInterval(intervalId);
            pollingIntervals.current.delete(uploadId);
            pollingRetryCount.current.delete(uploadId);
            setUploadingVideos((prev) =>
              prev.map((u) =>
                u.id === uploadId ? { ...u, status: "error" } : u
              )
            );
            onUploadError?.("Video processing failed");
          }
        }
      }, 10000);

      pollingIntervals.current.set(uploadId, intervalId);
    },
    [propertyId, unitId, collectionId, onUploadComplete, onUploadError]
  );

  const startTusUpload = useCallback(
    async (
      file: File,
      endpoint: string,
      tusHeaders: Record<string, string>,
      videoId: string,
      uploadId: string
    ) => {
      return new Promise<void>((resolve, reject) => {
        const abortController = new AbortController();

        const upload = new tus.Upload(file, {
          endpoint: endpoint,
          retryDelays: [0, 1000, 3000, 5000],
          headers: tusHeaders,
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onError: (error) => {
            uploadInstances.current.delete(uploadId);
            setUploadingVideos((prev) =>
              prev.map((u) =>
                u.id === uploadId ? { ...u, status: "error" } : u
              )
            );
            onUploadError?.(error.message || "Upload failed");
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            setUploadingVideos((prev) =>
              prev.map((u) =>
                u.id === uploadId
                  ? { ...u, progress: Math.min(percentage, 99) }
                  : u
              )
            );
          },
          onSuccess: () => {
            uploadInstances.current.delete(uploadId);
            setUploadingVideos((prev) =>
              prev.map((u) =>
                u.id === uploadId
                  ? { ...u, progress: 100, status: "processing" }
                  : u
              )
            );
            pollVideoStatus(videoId, uploadId, file.name);
            resolve();
          },
        });

        uploadInstances.current.set(uploadId, { upload, abortController });
        upload.start();
      });
    },
    [pollVideoStatus, onUploadError]
  );

  const uploadFiles = useCallback(
    async (files: FileList) => {
      const filesArray = Array.from(files);

      if (filesArray.length === 0) {
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        onUploadError?.("Not authenticated");
        return;
      }

      filesArray.forEach(async (file) => {
        const uploadId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const newUpload: UploadingVideo = {
          id: uploadId,
          fileName: file.name,
          progress: 0,
          status: "uploading",
        };
        setUploadingVideos((prev) => [...prev, newUpload]);

        try {
          const initResult = await initVideoUpload(
            propertyId,
            unitId,
            collectionId,
            file.name
          );

          if (!initResult.success) {
            setUploadingVideos((prev) =>
              prev.map((u) =>
                u.id === uploadId ? { ...u, status: "error" } : u
              )
            );
            onUploadError?.(
              initResult.message || "Failed to initialize upload"
            );
            return;
          }

          if (!initResult.data) {
            setUploadingVideos((prev) =>
              prev.map((u) =>
                u.id === uploadId ? { ...u, status: "error" } : u
              )
            );
            onUploadError?.("Failed to initialize upload: no data returned");
            return;
          }

          const { endpoint, headers, videoId } = initResult.data;

          setUploadingVideos((prev) =>
            prev.map((u) =>
              u.id === uploadId ? { ...u, videoId } : u
            )
          );

          await startTusUpload(file, endpoint, headers, videoId, uploadId);
        } catch (error) {
          setUploadingVideos((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: "error" } : u))
          );
          onUploadError?.(
            error instanceof Error ? error.message : "Upload failed"
          );
        }
      });
    },
    [propertyId, unitId, collectionId, startTusUpload, onUploadError]
  );

  const cancelUpload = useCallback((uploadId: string) => {
    const instance = uploadInstances.current.get(uploadId);
    if (instance) {
      instance.upload.abort();
      uploadInstances.current.delete(uploadId);
    }

    const intervalId = pollingIntervals.current.get(uploadId);
    if (intervalId) {
      clearInterval(intervalId);
      pollingIntervals.current.delete(uploadId);
    }

    pollingRetryCount.current.delete(uploadId);
    setUploadingVideos((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  const clearByVideoId = useCallback((videoId: string) => {
    setUploadingVideos((prev) => {
      const upload = prev.find((u) => u.videoId === videoId);
      if (upload) {
        const intervalId = pollingIntervals.current.get(upload.id);
        if (intervalId) {
          clearInterval(intervalId);
          pollingIntervals.current.delete(upload.id);
        }
        pollingRetryCount.current.delete(upload.id);
      }
      return prev.filter((u) => u.videoId !== videoId);
    });
  }, []);

  useEffect(() => {
    const intervals = pollingIntervals.current;
    const uploads = uploadInstances.current;

    return () => {
      intervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      intervals.clear();

      uploads.forEach((instance) => {
        instance.upload.abort();
      });
      uploads.clear();

      pollingRetryCount.current.clear();
    };
  }, []);

  return {
    uploadingVideos,
    uploadFiles,
    cancelUpload,
    clearByVideoId,
  };
}
