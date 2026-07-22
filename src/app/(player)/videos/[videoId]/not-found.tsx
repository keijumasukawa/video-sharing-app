import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VideoNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-4 pt-24 text-center">
      <h1 className="text-2xl font-semibold">Video not found</h1>
      <p className="text-sm text-muted-foreground">
        This video does not exist or is no longer available.
      </p>
      <Button
        render={<Link href="/videos" />}
        nativeButton={false}
        variant="secondary"
        size="sm"
      >
        Back to videos
      </Button>
    </div>
  );
}
