import { requestOtp } from "@/src/api/admitto";
import { errorResponse } from "@/src/api/route-errors";
import { getRegistrationVipCodeFromRequest, hasRegistrationAccess } from "@/src/config/registration-access";

export async function POST(req: Request) {
  try {
    if (!hasRegistrationAccess(getRegistrationVipCodeFromRequest(req))) {
      return Response.json({ message: "Registration is closed." }, { status: 403 });
    }

    const { email } = await req.json();
    await requestOtp(email);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
