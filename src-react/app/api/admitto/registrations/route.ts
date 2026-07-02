import { getRegistrationDetailsByEmail } from "@/src/api/admitto";
import { errorResponse } from "@/src/api/route-errors";
import { getRegistrationVipCodeFromRequest, hasRegistrationAccess } from "@/src/config/registration-access";

export async function GET(req: Request) {
  try {
    if (!hasRegistrationAccess(getRegistrationVipCodeFromRequest(req))) {
      return Response.json({ message: "Registration is closed." }, { status: 403 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get("email")?.trim() ?? "";
    const verificationToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

    if (!email || !verificationToken) {
      return Response.json({ message: "Missing email or verification token." }, { status: 400 });
    }

    return Response.json(await getRegistrationDetailsByEmail(email, verificationToken));
  } catch (err) {
    return errorResponse(err);
  }
}
