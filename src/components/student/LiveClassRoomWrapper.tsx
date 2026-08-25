"use client";

import dynamic from "next/dynamic";

const LiveClassRoom = dynamic(() => import("./LiveClassRoom"), { ssr: false });

export default function LiveClassRoomWrapper(props: any) {
  return <LiveClassRoom {...props} />;
}
