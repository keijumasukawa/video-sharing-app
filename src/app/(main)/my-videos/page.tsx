import { AuthDialog } from "@/components/auth/auth-dialog";
import { VideoUploadDialog } from "@/components/videos/video-upload-dialog";
import { getAuthUser } from "@/lib/auth";

export default async function MyVideosPage() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center gap-4 p-6 pt-16 text-center">
        <h1 className="text-2xl font-semibold">Manage your videos</h1>
        <p className="text-muted-foreground">
          Sign in to upload and manage your videos.
        </p>
        <AuthDialog />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">My Videos</h1>
        <VideoUploadDialog />
      </div>
      <p className="mt-2 text-muted-foreground">
        Manage your uploaded videos here.
      </p>
    </div>
  );
}
