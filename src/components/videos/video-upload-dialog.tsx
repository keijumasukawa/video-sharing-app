"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import {
  UPLOAD_START_ERROR_MESSAGE,
  UPLOAD_SUCCESS_MESSAGE,
} from "@/constants/messages";
import { notifySuccess } from "@/lib/notify";
import { useTRPC } from "@/trpc/client";
import { VideoUploader } from "./video-uploader";

export function VideoUploadDialog() {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createVideo = useMutation(
    trpc.videos.create.mutationOptions({
      meta: { errorMessage: UPLOAD_START_ERROR_MESSAGE },
    }),
  );

  const handleSuccess = () => {
    setOpen(false);
    notifySuccess(UPLOAD_SUCCESS_MESSAGE);
    void queryClient.invalidateQueries(
      trpc.videos.getMine.infiniteQueryFilter(),
    );
  };

  return (
    <>
      <ResponsiveModal title="Upload video" open={open} onOpenChange={setOpen}>
        <div className="p-4">
          <VideoUploader
            endpoint={async () => {
              const { uploadUrl } = await createVideo.mutateAsync();
              return uploadUrl;
            }}
            onSuccess={handleSuccess}
          />
        </div>
      </ResponsiveModal>

      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon />
        Upload
      </Button>
    </>
  );
}
