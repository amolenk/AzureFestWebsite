import { getRegistrationDetails, updateRegistration } from "@/src/api/admitto";
import { errorResponse } from "@/src/api/route-errors";

export async function GET(
  req: Request,
  context: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await context.params;
    return Response.json(await getRegistrationDetails(registrationId));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await context.params;
    const body = await req.json();
    await updateRegistration(
      registrationId,
      body.firstName,
      body.lastName,
      body.ticketTypeIds,
      body.additionalDetails
    );
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
