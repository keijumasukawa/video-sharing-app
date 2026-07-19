"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { VideoUploader } from "./video-uploader";

export function VideoUploadDialog() {
  const [open, setOpen] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const createVideo = useMutation(trpc.videos.create.mutationOptions());

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      if (isUploaded) {
        router.refresh();
      }
      setIsUploaded(false);
    }
  };

  return (
    <>
      <ResponsiveModal
        title="Upload video"
        open={open}
        onOpenChange={handleOpenChange}
      >
        {isUploaded ? (
          <div className="flex items-center gap-2 p-4 text-sm font-medium text-green-600">
            <CheckCircle2Icon className="size-4 shrink-0" />
            Upload complete. Your video will be available after processing
            finishes.
          </div>
        ) : (
          <div className="p-4">
            <VideoUploader
              endpoint={async () => {
                const { uploadUrl } = await createVideo.mutateAsync();
                return uploadUrl;
              }}
              onSuccess={() => setIsUploaded(true)}
            />
          </div>
        )}
      </ResponsiveModal>

      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon />
        Upload
      </Button>
    </>
  );
}
