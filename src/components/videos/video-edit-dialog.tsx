"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { VIDEO_UPDATE_SUCCESS_MESSAGE } from "@/constants/messages";
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/constants/videos";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/types";

const editSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
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

type EditValues = z.infer<typeof editSchema>;

type VideoListItem = RouterOutputs["videos"]["getMine"]["items"][number];

type EditableVideo = Pick<VideoListItem, "id" | "title" | "description">;

interface VideoEditDialogProps {
  video: EditableVideo | null;
  onOpenChange: (open: boolean) => void;
}

export function VideoEditDialog({ video, onOpenChange }: VideoEditDialogProps) {
  return (
    <ResponsiveModal
      title="Edit video"
      open={video !== null}
      onOpenChange={onOpenChange}
    >
      {video && (
        <VideoEditForm
          key={video.id}
          video={video}
          onSuccess={() => onOpenChange(false)}
        />
      )}
    </ResponsiveModal>
  );
}

function VideoEditForm({
  video,
  onSuccess,
}: {
  video: EditableVideo;
  onSuccess: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: video.title,
      description: video.description ?? "",
    },
  });

  const updateVideo = useMutation(
    trpc.videos.update.mutationOptions({
      meta: { successMessage: VIDEO_UPDATE_SUCCESS_MESSAGE },
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.videos.getMine.infiniteQueryFilter(),
          ),
          queryClient.invalidateQueries(trpc.videos.getOne.queryFilter()),
        ]);
        onSuccess();
      },
    }),
  );

  const onSubmit = (values: EditValues) => {
    updateVideo.mutate({ id: video.id, ...values });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="video-title">Title</FieldLabel>
              <Input
                {...field}
                id="video-title"
                placeholder="Enter a title"
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
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={updateVideo.isPending}>
          {updateVideo.isPending ? "Saving..." : "Save"}
        </Button>
      </FieldGroup>
    </form>
  );
}
