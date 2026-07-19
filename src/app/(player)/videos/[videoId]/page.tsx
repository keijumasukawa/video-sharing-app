interface VideoPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Video</h1>
      <p className="mt-2 text-muted-foreground">Video ID: {videoId}</p>
    </div>
  );
}
