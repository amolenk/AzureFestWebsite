import { changeTickets } from "@/src/api/admitto";
import { errorResponse } from "@/src/api/route-errors";

export async function PUT(
  req: Request,
  context: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await context.params;
    const { ticketTypeIds } = await req.json();
    await changeTickets(registrationId, ticketTypeIds);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
