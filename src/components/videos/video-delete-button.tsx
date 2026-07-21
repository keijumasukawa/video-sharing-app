"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { videoDeleteSuccessMessage } from "@/constants/messages";
import { notifySuccess } from "@/lib/notify";
import { useTRPC } from "@/trpc/client";

interface VideoDeleteButtonProps {
  ids: string[];
  onDeleted: () => void;
}

export function VideoDeleteButton({ ids, onDeleted }: VideoDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const removeVideos = useMutation(
    trpc.videos.remove.mutationOptions({
      onSuccess: async ({ deletedCount }) => {
        notifySuccess(videoDeleteSuccessMessage(deletedCount));
        await queryClient.invalidateQueries(trpc.videos.pathFilter());
        setOpen(false);
        onDeleted();
      },
      onError: () => {
        setOpen(false);
      },
    }),
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="destructive" size="sm" />}
      >
        <Trash2Icon />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {ids.length} {ids.length === 1 ? "video" : "videos"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The selected videos will be
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeVideos.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={removeVideos.isPending}
            onClick={() => removeVideos.mutate({ ids })}
          >
            {removeVideos.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
