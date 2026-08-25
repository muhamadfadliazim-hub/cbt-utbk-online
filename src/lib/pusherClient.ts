import PusherClient from "pusher-js";

// Make sure to only initialize one instance of the client
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || "key", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
    });
  }
  return pusherClientInstance;
};
