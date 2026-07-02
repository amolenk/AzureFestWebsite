import { cancel } from "@/src/api/admitto";
import { errorResponse } from "@/src/api/route-errors";

export async function POST(
  req: Request,
  context: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await context.params;
    await cancel(registrationId);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
