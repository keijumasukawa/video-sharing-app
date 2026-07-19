export default function AuthErrorPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Authentication error</h1>
      <p className="mt-2 text-muted-foreground">
        The confirmation link is invalid or has expired. Please sign up or sign
        in again.
      </p>
    </div>
  );
}
