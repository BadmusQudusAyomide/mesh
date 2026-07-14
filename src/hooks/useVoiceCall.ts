import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { API_BASE_URL } from "../config";
import { apiService } from "../lib/api";

export type CallStatus =
  | "idle"
  | "outgoingRinging"
  | "incomingRinging"
  | "connecting"
  | "connected";

interface IncomingOffer {
  callerId: string;
  callId: string;
  sdp: RTCSessionDescriptionInit;
}

const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

/**
 * Fetches fresh TURN credentials from the backend (which proxies Xirsys so
 * the secret never reaches the browser). Falls back to STUN-only if the
 * request fails or TURN isn't configured yet.
 */
async function fetchIceServers(): Promise<RTCIceServer[]> {
  try {
    const token = apiService.getToken();
    if (!token) return FALLBACK_ICE_SERVERS;
    const response = await fetch(`${API_BASE_URL}/calls/ice-servers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return FALLBACK_ICE_SERVERS;
    const data = await response.json();
    const iceServers = data?.iceServers;
    if (!Array.isArray(iceServers) || iceServers.length === 0) {
      return FALLBACK_ICE_SERVERS;
    }
    return iceServers;
  } catch {
    return FALLBACK_ICE_SERVERS;
  }
}

/**
 * Mirrors the mobile app's CallService: a 1:1 audio-only WebRTC call, with
 * signaling relayed over the same Socket.IO connection the chat page
 * already holds open (call:offer/answer/ice-candidate/end). No TURN server
 * yet, so this only reliably connects on friendly networks/same-network —
 * same known limitation as mobile, mainly meant to make cross-testing
 * mobile <-> web calls possible without two phones.
 */
export function useVoiceCall(socket: Socket | null) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const callIdRef = useRef<string | null>(null);
  const pendingOfferRef = useRef<IncomingOffer | null>(null);

  const teardown = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    pendingOfferRef.current = null;
    callIdRef.current = null;
    setIsMuted(false);
    setPeerId(null);
    setStatus("idle");
  }, []);

  const createPeerConnection = useCallback(
    async (recipientId: string) => {
      const iceServers = await fetchIceServers();
      const pc = new RTCPeerConnection({ iceServers });

      pc.onicecandidate = (event) => {
        if (!event.candidate || !callIdRef.current) return;
        socket?.emit("call:ice-candidate", {
          recipientId,
          callId: callIdRef.current,
          candidate: event.candidate.toJSON(),
        });
      };

      pc.ontrack = (event) => {
        if (!remoteAudioRef.current) {
          remoteAudioRef.current = new Audio();
          remoteAudioRef.current.autoplay = true;
        }
        remoteAudioRef.current.srcObject = event.streams[0];
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          teardown();
        }
      };

      return pc;
    },
    [socket, teardown]
  );

  const startOutgoingCall = useCallback(
    async (recipientId: string) => {
      if (!socket) return;
      const callId = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
      callIdRef.current = callId;
      setPeerId(recipientId);
      setStatus("connecting");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;

      const pc = await createPeerConnection(recipientId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pcRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", {
        recipientId,
        callId,
        sdp: { sdp: offer.sdp, type: offer.type },
      });
      setStatus("outgoingRinging");
    },
    [socket, createPeerConnection]
  );

  const acceptIncomingCall = useCallback(async () => {
    const offer = pendingOfferRef.current;
    if (!offer || !socket) return;
    setStatus("connecting");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    localStreamRef.current = stream;

    const pc = await createPeerConnection(offer.callerId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    pcRef.current = pc;

    await pc.setRemoteDescription(new RTCSessionDescription(offer.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("call:answer", {
      recipientId: offer.callerId,
      callId: offer.callId,
      sdp: { sdp: answer.sdp, type: answer.type },
    });
    setStatus("connected");
  }, [socket, createPeerConnection]);

  const declineIncomingCall = useCallback(() => {
    const offer = pendingOfferRef.current;
    if (offer && socket) {
      socket.emit("call:end", {
        recipientId: offer.callerId,
        callId: offer.callId,
      });
    }
    teardown();
  }, [socket, teardown]);

  const hangUp = useCallback(() => {
    if (peerId && callIdRef.current && socket) {
      socket.emit("call:end", { recipientId: peerId, callId: callIdRef.current });
    }
    teardown();
  }, [peerId, socket, teardown]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    setIsMuted((prev) => {
      const next = !prev;
      stream.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  }, []);

  // Lets the offer handler below read the latest status without having to
  // re-subscribe the socket listener every time status changes.
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!socket) return;

    const onOffer = (data: IncomingOffer) => {
      // Already on a call — silently ignore, matches mobile's behavior.
      if (statusRef.current !== "idle") return;
      pendingOfferRef.current = data;
      callIdRef.current = data.callId;
      setPeerId(data.callerId);
      setStatus("incomingRinging");
    };

    const onAnswer = async (data: {
      callId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (data.callId !== callIdRef.current || !pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      setStatus("connected");
    };

    const onIceCandidate = async (data: {
      callId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (data.callId !== callIdRef.current || !pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch {
        // Benign — candidates can arrive after the connection already closed.
      }
    };

    const onEnd = (data: { callId: string }) => {
      if (data.callId !== callIdRef.current) return;
      teardown();
    };

    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onIceCandidate);
    socket.on("call:end", onEnd);

    return () => {
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onIceCandidate);
      socket.off("call:end", onEnd);
    };
  }, [socket, teardown]);

  return {
    status,
    peerId,
    isMuted,
    startOutgoingCall,
    acceptIncomingCall,
    declineIncomingCall,
    hangUp,
    toggleMute,
  };
}
