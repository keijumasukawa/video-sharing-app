import Image from "next/image";
import { APP_NAME } from "@/constants/app";

export function Logo() {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Image
        src="/logo.svg"
        alt=""
        aria-hidden="true"
        width={30}
        height={20}
        className="h-5 w-auto shrink-0"
      />
      <span className="truncate text-lg font-semibold tracking-tight">
        {APP_NAME}
      </span>
    </span>
  );
}
