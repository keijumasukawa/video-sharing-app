import { AuthDialog } from "@/components/auth/auth-dialog";
import { getAuthUser } from "@/lib/auth";

export default async function MyVideosPage() {
  const user = await getAuthUser();

  // 未認証時はリダイレクトせず、ページ内でサインインを促す(YouTube と同様の方式)
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
      <h1 className="text-2xl font-semibold">My Videos</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your uploaded videos here.
      </p>
    </div>
  );
}
