import { getMux } from "@/lib/mux";

export async function POST(request: Request) {
  const body = await request.text();

  try {
    await getMux().webhooks.unwrap(body, request.headers);
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  return Response.json({ received: true });
}
