"use client";

import { JitsiMeeting } from '@jitsi/react-sdk';
import { useRouter } from 'next/navigation';

type LiveClassRoomProps = {
  roomName: string;
  userName: string;
  subject: string;
};

export default function LiveClassRoom({ roomName, userName, subject }: LiveClassRoomProps) {
  const router = useRouter();

  return (
    <div style={{ width: "100%", height: "calc(100vh - 80px)", background: "#111", borderRadius: "12px", overflow: "hidden" }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          startScreenSharing: true,
          enableEmailInStats: false,
          prejoinPageEnabled: false, // Skip the intermediate screen
          fileRecordingsEnabled: true, // Enable recording UI
          localRecording: {
            enabled: true,
            format: 'flac' // or ogg
          }
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
        }}
        userInfo={{
          displayName: userName,
          email: "student@azacademy.id",
        }}
        onApiReady={(externalApi) => {
          // Listen to events if we want
          externalApi.addListener('videoConferenceLeft', () => {
            router.push('/student/live-classes');
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}
