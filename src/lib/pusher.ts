import PusherServer from "pusher";

// Use dummy fallback if env vars are missing so the app doesn't crash,
// but it won't actually work until real keys are provided.
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "app_id",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "key",
  secret: process.env.PUSHER_SECRET || "secret",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
  useTLS: true,
});
