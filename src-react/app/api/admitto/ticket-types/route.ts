import { getTicketTypes } from "@/src/api/admitto";
import { errorResponse } from "@/src/api/route-errors";

export async function GET() {
  try {
    return Response.json(await getTicketTypes());
  } catch (err) {
    return errorResponse(err);
  }
}
