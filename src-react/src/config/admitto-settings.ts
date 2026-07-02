import "server-only";

export const admittoSettings = {
  baseUrl: process.env.ADMITTO_URL || "http://localhost:15000",
  eventSlug: process.env.ADMITTO_EVENT_SLUG || "placeholder-slug",
  apiKey: process.env.ADMITTO_API_KEY || "placeholder-api-key"
};
