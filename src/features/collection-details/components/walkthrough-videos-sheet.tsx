"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Upload, Pencil, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/common/toast/toast";
import { getVideos, deleteVideo } from "../api/video.actions";
import { VideoPlayerDialog } from "../../../components/common/video-player-dialog";
import { VideoCard, VideoCardSkeleton } from "./walkthrough-video-card";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import {
  UploadingVideoCard,
  type UploadingVideo,
} from "./walkthrough-uploading-card";
import { useVideoUpload } from "../hooks/use-video-upload";
import type { WalkthroughVideo } from "../types/collection-details.types";
import type { Video } from "../types/video.types";
import EmptyState from "@/components/common/empty-state";

interface WalkthroughVideosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  unitId: string;
  collectionId: string;
  maxVideos?: number;
  onRemoveVideo?: (videoId: string) => void;
}

function mapVideoToWalkthroughVideo(video: Video): WalkthroughVideo {
  return {
    id: video.id,
    bunnyVideoId: video.bunny_video_id,
    title: video.title,
    thumbnailUrl: video.signed_thumbnail_url || "",
    videoUrl: video.signed_url || "",
    duration: "",
    createdAt: video.created_at,
  };
}

function mapProcessingVideoToUploadingVideo(video: Video): UploadingVideo {
  let status: "uploading" | "processing" = "processing";
  
  if (video.video_status === "initiated") {
    status = "uploading";
  } else if (video.video_status === "uploading") {
    status = "uploading";
  } else if (video.video_status === "processing") {
    status = "processing";
  }
  
  return {
    id: video.id,
    videoId: video.id,
    fileName: video.title,
    progress: status === "uploading" ? 50 : 100,
    status,
  };
}

function mapFailedVideoToUploadingVideo(video: Video): UploadingVideo {
  return {
    id: video.id,
    videoId: video.id,
    fileName: video.title,
    progress: 100,
    status: "error",
  };
}

function mapThumbnailPendingToUploadingVideo(video: Video): UploadingVideo {
  return {
    id: video.id,
    videoId: video.id,
    fileName: video.title,
    progress: 100,
    status: "thumbnail",
  };
}

export function WalkthroughVideosSheet({
  open,
  onOpenChange,
  propertyId,
  unitId,
  collectionId,
  maxVideos = 10,
  onRemoveVideo,
}: WalkthroughVideosSheetProps) {
  const [videos, setVideos] = useState<WalkthroughVideo[]>([]);
  const [processingVideos, setProcessingVideos] = useState<UploadingVideo[]>(
    []
  );
  const [thumbnailVideos, setThumbnailVideos] = useState<UploadingVideo[]>([]);
  const [failedVideos, setFailedVideos] = useState<UploadingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteVideoId, setPendingDeleteVideoId] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WalkthroughVideo | null>(
    null
  );
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const previousProcessingIdsRef = useRef<Set<string>>(new Set());

  const handleUploadComplete = useCallback((video: WalkthroughVideo) => {
    setProcessingVideos((prev) => prev.filter((v) => v.id !== video.id));
    
    if (video.thumbnailUrl) {
      setVideos((prev) => {
        if (prev.some((v) => v.id === video.id)) {
          return prev;
        }
        return [video, ...prev];
      });
    } else {
      setThumbnailVideos((prev) => {
        if (prev.some((v) => v.id === video.id)) {
          return prev;
        }
        return [
          {
            id: video.id,
            videoId: video.id,
            fileName: video.title,
            progress: 100,
            status: "thumbnail",
          },
          ...prev,
        ];
      });
    }
  }, []);

  const handleUploadError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  const { uploadingVideos, uploadFiles, cancelUpload, clearByVideoId } = useVideoUpload({
    propertyId,
    unitId,
    collectionId,
    onUploadComplete: handleUploadComplete,
    onUploadError: handleUploadError,
  });

  const fetchVideos = useCallback(async () => {
    try {
      const result = await getVideos(propertyId, unitId, collectionId);
      if (result.success && result.data) {
        const readyWithThumbnail = result.data
          .filter((v) => v.video_status === "ready" && v.signed_thumbnail_url)
          .map(mapVideoToWalkthroughVideo);
        const readyWithoutThumbnail = result.data
          .filter((v) => v.video_status === "ready" && !v.signed_thumbnail_url)
          .map(mapThumbnailPendingToUploadingVideo);
        const processing = result.data
          .filter((v) =>
            ["initiated", "uploading", "processing"].includes(v.video_status)
          )
          .map(mapProcessingVideoToUploadingVideo);
        const failed = result.data
          .filter((v) => v.video_status === "failed")
          .map(mapFailedVideoToUploadingVideo);

        const newlyFailedVideos = failed.filter((f) =>
          previousProcessingIdsRef.current.has(f.id)
        );
        if (newlyFailedVideos.length > 0) {
          toast.error(
            newlyFailedVideos.length === 1
              ? "Video processing failed"
              : `${newlyFailedVideos.length} videos failed to process`
          );
        }

        const allReady = result.data.filter((v) => v.video_status === "ready");
        const newlyReadyVideoIds = new Set(
          allReady.filter((r) =>
            previousProcessingIdsRef.current.has(r.id)
          ).map((r) => r.id)
        );

        if (newlyReadyVideoIds.size > 0) {
          toast.success(
            newlyReadyVideoIds.size === 1
              ? "Video processing complete"
              : `${newlyReadyVideoIds.size} videos finished processing`
          );
        }

        newlyReadyVideoIds.forEach((id) => {
          clearByVideoId(id);
        });

        previousProcessingIdsRef.current = new Set(processing.map((p) => p.id));

        setVideos(readyWithThumbnail);
        setThumbnailVideos(readyWithoutThumbnail);
        setProcessingVideos(processing);
        setFailedVideos(failed);
        return processing.length > 0 || readyWithoutThumbnail.length > 0;
      }
      return previousProcessingIdsRef.current.size > 0;
    } catch {
      return previousProcessingIdsRef.current.size > 0;
    }
  }, [propertyId, unitId, collectionId, clearByVideoId]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      return;
    }
    pollingRef.current = setInterval(async () => {
      const stillProcessing = await fetchVideos();
      if (!stillProcessing) {
        stopPolling();
      }
    }, 5000);
  }, [fetchVideos, stopPolling]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetchVideos().then((hasProcessing) => {
        setIsLoading(false);
        if (hasProcessing) {
          startPolling();
        }
      });
    } else {
      setIsEditMode(false);
      previousProcessingIdsRef.current.clear();
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [open, fetchVideos, startPolling, stopPolling]);

  useEffect(() => {
    if (!open) return;
    if (thumbnailVideos.length > 0 && !pollingRef.current) {
      startPolling();
    }
  }, [open, thumbnailVideos.length, startPolling]);

  const totalVideosCount =
    videos.length +
    thumbnailVideos.length +
    processingVideos.length +
    failedVideos.length +
    uploadingVideos.length;
  const remainingSlots = Math.max(0, maxVideos - totalVideosCount);
  const isUploadDisabled = totalVideosCount >= maxVideos;

  const handleUploadClick = () => {
    if (isUploadDisabled) {
      toast.error(`Maximum of ${maxVideos} videos reached`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (isUploadDisabled) {
        toast.error(`Maximum of ${maxVideos} videos reached`);
        e.target.value = "";
        return;
      }

      if (e.target.files.length > remainingSlots) {
        toast.error(
          remainingSlots === 1
            ? "You can upload 1 more video"
            : `You can upload ${remainingSlots} more videos`
        );
        e.target.value = "";
        return;
      }
      uploadFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleRequestRemoveVideo = (videoId: string) => {
    setPendingDeleteVideoId(videoId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmRemoveVideo = async () => {
    if (!pendingDeleteVideoId) {
      return;
    }

    const videoId = pendingDeleteVideoId;
    setIsDeleting(true);
    const result = await deleteVideo(
      propertyId,
      unitId,
      collectionId,
      videoId
    );
    setIsDeleting(false);

    if (result.success) {
      onRemoveVideo?.(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      toast.success("Video deleted successfully");
    } else {
      toast.error(result.message || "Failed to delete video");
    }
  };

  const handleRemoveFailedVideo = async (videoId: string) => {
    const result = await deleteVideo(propertyId, unitId, collectionId, videoId);
    if (result.success) {
      setFailedVideos((prev) => prev.filter((v) => v.id !== videoId));
    } else {
      toast.error(result.message || "Failed to remove video");
    }
  };

  const handleVideoClick = (video: WalkthroughVideo) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[454px] sm:max-w-[454px] p-0 gap-0"
      >
        <SheetHeader className="p-4 border-b border-accent-border">
          <SheetTitle className="text-xl">Walkthrough Videos</SheetTitle>
          <SheetDescription>
            These videos are for additional documentation purposes only, rather
            than inventory analysis.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-foreground">Uploaded</span>
            <span className="text-muted-foreground">
              {totalVideosCount}
              /{maxVideos}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {!isEditMode && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2"
                onClick={handleUploadClick}
                disabled={isUploadDisabled}
              >
                <Upload className="size-4 text-primary" />
                {totalVideosCount > 0
                  ? "Upload more"
                  : "Upload"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <>
                  <Check className="size-4 text-primary" />
                  Done
                </>
              ) : (
                <>
                  <Pencil className="size-4 text-primary" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="flex flex-col gap-2">
            {uploadingVideos.map((upload) => (
              <UploadingVideoCard
                key={upload.id}
                upload={upload}
                onCancel={cancelUpload}
              />
            ))}
            {processingVideos.map((video) => (
              <UploadingVideoCard key={video.id} upload={video} />
            ))}
            {thumbnailVideos.map((video) => (
              <UploadingVideoCard key={video.id} upload={video} />
            ))}
            {failedVideos.map((video) => (
              <UploadingVideoCard
                key={video.id}
                upload={video}
                onCancel={handleRemoveFailedVideo}
              />
            ))}
            {isLoading ? (
              <>
                <VideoCardSkeleton />
                <VideoCardSkeleton />
                <VideoCardSkeleton />
              </>
            ) : videos.length === 0 &&
              uploadingVideos.length === 0 &&
              processingVideos.length === 0 &&
              thumbnailVideos.length === 0 &&
              failedVideos.length === 0 ? (
              <EmptyState
                title="No videos yet"
                subtitle="Upload walkthrough videos to document your collection."
              />
            ) : (
              videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isEditMode={isEditMode}
                  onRemove={handleRequestRemoveVideo}
                  onClick={() => handleVideoClick(video)}
                />
              ))
            )}
          </div>
        </div>
      </SheetContent>

      <VideoPlayerDialog
        open={isPlayerOpen}
        onOpenChange={setIsPlayerOpen}
        video={selectedVideo}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setPendingDeleteVideoId(null);
          }
        }}
        title="Delete video?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmRemoveVideo}
        isLoading={isDeleting}
      />
    </Sheet>
  );
}
