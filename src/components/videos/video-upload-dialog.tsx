"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as UpChunk from "@mux/upchunk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  UPLOAD_ERROR_MESSAGE,
  UPLOAD_START_ERROR_MESSAGE,
  UPLOAD_SUCCESS_MESSAGE,
} from "@/constants/messages";
import {
  DEFAULT_VIDEO_TITLE,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "@/constants/videos";
import { stripFileExtension } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

const uploadSchema = z.object({
  file: z.instanceof(File, { error: "Please select a video file." }),
  title: z
    .string()
    .trim()
    .max(
      TITLE_MAX_LENGTH,
      `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`,
    ),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`,
    ),
});

type UploadValues = z.infer<typeof uploadSchema>;

export function VideoUploadDialog() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && uploading) {
      return;
    }
    setOpen(nextOpen);
  };

  return (
    <>
      <ResponsiveModal
        title="Upload video"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <VideoUploadForm
          onUploadingChange={setUploading}
          onSuccess={() => setOpen(false)}
        />
      </ResponsiveModal>

      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon />
        Upload
      </Button>
    </>
  );
}

function VideoUploadForm({
  onUploadingChange,
  onSuccess,
}: {
  onUploadingChange: (uploading: boolean) => void;
  onSuccess: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createVideo = useMutation(
    trpc.videos.create.mutationOptions({
      meta: { errorMessage: UPLOAD_START_ERROR_MESSAGE },
    }),
  );

  const startUpload = (file: File, uploadUrl: string) => {
    setProgress(0);
    onUploadingChange(true);

    const upload = UpChunk.createUpload({ endpoint: uploadUrl, file });
    upload.on("progress", (event) => {
      setProgress(Math.round(event.detail));
    });
    upload.on("success", () => {
      onUploadingChange(false);
      notifySuccess(UPLOAD_SUCCESS_MESSAGE);
      void queryClient.invalidateQueries(
        trpc.videos.getMine.infiniteQueryFilter(),
      );
      onSuccess();
    });
    upload.on("error", () => {
      setProgress(null);
      onUploadingChange(false);
      notifyError(UPLOAD_ERROR_MESSAGE);
    });
  };

  const onSubmit = async (values: UploadValues) => {
    const title =
      values.title ||
      stripFileExtension(values.file.name) ||
      DEFAULT_VIDEO_TITLE;

    try {
      const { uploadUrl } = await createVideo.mutateAsync({
        title,
        description: values.description || null,
      });
      startUpload(values.file, uploadUrl);
    } catch {
      return;
    }
  };

  const isBusy = createVideo.isPending || progress !== null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
      <FieldGroup>
        <Controller
          name="file"
          control={form.control}
          render={({ field: { name, value, onChange }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-3">
                <Button
                  className={cn(
                    "rounded-full",
                    isBusy && "pointer-events-none opacity-50",
                  )}
                  nativeButton={false}
                  render={<label htmlFor="video-file" />}
                >
                  Select file
                </Button>
                <span className="truncate text-sm text-muted-foreground">
                  {value?.name ?? "No file selected"}
                </span>
              </div>
              <input
                id="video-file"
                name={name}
                type="file"
                accept="video/*"
                className="sr-only"
                disabled={isBusy}
                onChange={(event) => onChange(event.target.files?.[0])}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {progress !== null && (
          <div className="flex items-center gap-3">
            <Progress value={progress} />
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
        )}
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="video-title">Title</FieldLabel>
              <Input
                {...field}
                id="video-title"
                placeholder="Enter a title (defaults to the file name)"
                disabled={isBusy}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="video-description">Description</FieldLabel>
              <Textarea
                {...field}
                id="video-description"
                rows={5}
                placeholder="Tell viewers about your video"
                disabled={isBusy}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={isBusy}>
          {isBusy ? "Uploading..." : "Save"}
        </Button>
      </FieldGroup>
    </form>
  );
}
