import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard
      // Format: https://verb-noun-00.clerk.accounts.dev (dev)
      // Format: https://clerk.yourdomain.com (prod)
      domain: "https://bright-chicken-22.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;