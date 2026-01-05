// convex/http.ts
// âš ï¸ FIRST RUN: npm install svix

import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET");
      return new Response("Missing webhook secret", { status: 500 });
    }

    // Get Svix headers
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle events
    const { type, data } = evt;

    switch (type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address ?? "",
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          imageUrl: data.image_url,
        });
        break;

      case "user.deleted":
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkId: data.id!,
        });
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;