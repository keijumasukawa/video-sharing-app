"use client";

import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UPLOAD_ERROR_MESSAGE } from "@/constants/messages";
import { notifyError } from "@/lib/notify";

type UploaderEndpoint = React.ComponentProps<typeof MuxUploader>["endpoint"];

interface VideoUploaderProps {
  endpoint: UploaderEndpoint;
  onSuccess: () => void;
}

const UPLOADER_ID = "video-uploader";

export function VideoUploader({ endpoint, onSuccess }: VideoUploaderProps) {
  return (
    <div>
      <MuxUploader
        onSuccess={onSuccess}
        onError={() => notifyError(UPLOAD_ERROR_MESSAGE)}
        endpoint={endpoint}
        id={UPLOADER_ID}
        className="group/uploader hidden"
      />
      <MuxUploaderDrop muxUploader={UPLOADER_ID} className="group/drop">
        <div slot="heading" className="flex flex-col items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center gap-2 rounded-full bg-muted">
            <UploadIcon className="size-10 text-muted-foreground transition-all duration-300 group-[&[active]]/drop:animate-bounce" />
          </div>
          <p className="text-sm">Drag and drop video files to upload</p>
          <MuxUploaderFileSelect muxUploader={UPLOADER_ID}>
            <Button type="button" className="rounded-full">
              Select files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot="separator" className="hidden" />
        <MuxUploaderStatus muxUploader={UPLOADER_ID} className="text-sm" />
        <MuxUploaderProgress
          muxUploader={UPLOADER_ID}
          className="text-sm"
          type="percentage"
        />
        <MuxUploaderProgress muxUploader={UPLOADER_ID} type="bar" />
      </MuxUploaderDrop>
    </div>
  );
}
