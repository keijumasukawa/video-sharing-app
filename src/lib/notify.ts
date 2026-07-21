"use client";

import { toast } from "sonner";
import { DEFAULT_ERROR_MESSAGE } from "@/constants/messages";

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string = DEFAULT_ERROR_MESSAGE) {
  toast.error(message);
}
