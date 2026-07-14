import { useEffect, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import type { CallStatus } from "../hooks/useVoiceCall";

const PURPLE = "#9333EA";

interface CallOverlayProps {
  status: CallStatus;
  peerName: string;
  peerAvatar?: string;
  isMuted: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Mirrors the mobile app's CallScreen — same states, same purple accent. */
export default function CallOverlay({
  status,
  peerName,
  peerAvatar,
  isMuted,
  onAccept,
  onDecline,
  onHangUp,
  onToggleMute,
}: CallOverlayProps) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (status !== "connected") {
      setDuration(0);
      return;
    }
    const interval = window.setInterval(() => setDuration((d) => d + 1), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  if (status === "idle") return null;

  const statusLabel =
    status === "outgoingRinging"
      ? "Ringing…"
      : status === "connecting"
      ? "Connecting…"
      : status === "connected"
      ? formatDuration(duration)
      : status === "incomingRinging"
      ? "Incoming voice call…"
      : "";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F0F1A]/95 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold overflow-hidden"
          style={{ backgroundColor: PURPLE }}
        >
          {peerAvatar ? (
            <img
              src={peerAvatar}
              alt={peerName}
              className="w-full h-full object-cover"
            />
          ) : (
            peerName.charAt(0).toUpperCase()
          )}
        </div>
        <h2 className="mt-5 text-2xl font-bold text-white">{peerName}</h2>
        <p className="mt-2 text-white/60">{statusLabel}</p>
      </div>

      <div className="mt-16 flex items-center gap-6">
        {status === "incomingRinging" ? (
          <>
            <CallButton icon={<PhoneOff />} color="#ef4444" onClick={onDecline} />
            <CallButton icon={<Phone />} color="#22c55e" onClick={onAccept} />
          </>
        ) : status === "connected" ? (
          <>
            <CallButton
              icon={isMuted ? <MicOff /> : <Mic />}
              color={isMuted ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.12)"}
              onClick={onToggleMute}
            />
            <CallButton icon={<PhoneOff />} color="#ef4444" onClick={onHangUp} />
          </>
        ) : (
          <CallButton icon={<PhoneOff />} color="#ef4444" onClick={onHangUp} />
        )}
      </div>
    </div>
  );
}

function CallButton({
  icon,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
    >
      {icon}
    </button>
  );
}
