import { admittoSettings } from "@/src/config/admitto-settings";

export async function GET(
  _req: Request,
  context: { params: Promise<{ registrationId: string }> }
) {
  const { registrationId } = await context.params;
  const url = new URL(
    `${admittoSettings.baseUrl}/api/events/${admittoSettings.eventSlug}/registrations/${encodeURIComponent(registrationId)}/qr-code`
  );

  const res = await fetch(url, {
    headers: { "X-Api-Key": admittoSettings.apiKey }
  });

  if (!res.ok) {
    return new Response("Failed to fetch QR code", { status: res.status });
  }

  return new Response(await res.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/png",
      "Cache-Control": "private, max-age=300"
    }
  });
}
