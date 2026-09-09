import { reconfirm } from "@/src/api/admitto";
import { errorResponse } from "@/src/api/route-errors";

export async function POST(
  _req: Request,
  context: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await context.params;
    await reconfirm(registrationId);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
