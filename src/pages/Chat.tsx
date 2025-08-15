import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextHelpers";
import { apiService } from "../lib/api";
import socketIOClient from "socket.io-client";
// Add message virtualization for large conversations
// Virtualize search results list to keep main view unchanged and avoid complex variable heights
import { FixedSizeList as List } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  CheckCheck,
  Image,
  Mic,
  Plus,
  Camera,
  FileText,
  MapPin,
  X,
  RotateCw,
  AlertCircle,
  Search,
  Copy,
  Reply,
  Edit3,
  Trash2,
  ChevronDown,
  WifiOff,
} from "lucide-react";
// Optional: add a stop icon for finishing recordings
import { Square } from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Highlight helper for search results and inline messages
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const renderHighlighted = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return <>{text}</>;
  try {
    const regex = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
};

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  recipient: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  replyTo?: {
    _id: string;
    content: string;
    sender: { _id: string; username: string; fullName: string; avatar: string };
  } | null;
  reactions?: { user: string; emoji: string; createdAt: string }[];
  edited?: boolean;
  editedAt?: string;
  status?: 'sending' | 'failed' | 'sent';
  threadId?: string | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
}

interface ChatUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

function Chat() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  // Date range filters for search
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // Implement message pagination (state only; fetchMore placeholder)
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, messageId: string } | null>(null);
  const [mobileActionSheet, setMobileActionSheet] = useState<{ messageId: string } | null>(null);
  const [showTopMenu, setShowTopMenu] = useState(false);

  // Threading state
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadRoot, setThreadRoot] = useState<Message | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [threadHasMore, setThreadHasMore] = useState<boolean>(false);
  const [threadLoading, setThreadLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof socketIOClient> | null>(null);

  // Minimal socket listeners to append incoming messages immediately
  useEffect(() => {
    if (socketRef.current) return; // initialize once
    const s = socketIOClient(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = s;
    const onNew = (msg: any) => {
      // If the message is part of the current chat, append
      if (!chatUser) return;
      const isRelated = msg.sender?._id === chatUser._id || msg.recipient?._id === chatUser._id;
      if (isRelated) {
        setMessages((prev) => {
          // If the real message arrives and we have a temp one, replace by thread/time heuristics
          const exists = prev.some(p => p._id === msg._id);
          if (exists) return prev; // de-dupe by _id
          // attempt to replace the last temp audio if same sender and close timestamp
          const last = prev[prev.length - 1];
          if (last && last._id.startsWith('temp-') && last.messageType === 'audio' && last.sender._id === msg.sender?._id) {
            const replaced = [...prev];
            replaced[replaced.length - 1] = msg;
            return replaced;
          }
          return [...prev, msg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 20);
      }
    };
    s.on('newMessage', onNew);
    s.on('messageSent', onNew);
    return () => {
      s.off('newMessage', onNew);
      s.off('messageSent', onNew);
      s.disconnect();
      socketRef.current = null;
    };
  }, [chatUser?._id]);

  // Voice note recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const cancelRecordingRef = useRef(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const currentTempVoiceIdRef = useRef<string | null>(null);
  const currentTempVoiceUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => {
      if (recordingStartedAt) {
        setRecordElapsed(Math.max(0, Math.floor((Date.now() - recordingStartedAt) / 1000)));
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [isRecording, recordingStartedAt]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recordedChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const duration = recordingStartedAt ? Math.round((Date.now() - recordingStartedAt) / 1000) : undefined;
          if (!cancelRecordingRef.current && chatUser) {
            setIsUploadingVoice(true);
            setUploadProgress(0);
            // Update previously created temp with the real blob URL so it becomes playable while uploading
            const tempId = currentTempVoiceIdRef.current;
            const localUrl = URL.createObjectURL(blob);
            currentTempVoiceUrlRef.current = localUrl;
            if (tempId) {
              setMessages((prev) => prev.map(m => m._id === tempId ? { ...m, audioUrl: localUrl, audioDuration: duration ?? m.audioDuration } : m));
            }

            const res = await apiService.uploadVoiceNoteWithProgress(
              chatUser._id,
              blob,
              {
                duration,
                replyTo: replyToMessage?._id,
                onProgress: (p) => setUploadProgress(p),
              }
            );
            // Replace temp message with real one
            if (res?.message) {
              setMessages((prev) => prev.map(m => m._id === tempId ? res.message : m));
            }
            // Background refetch: pull a few latest messages to ensure UI reflects instantly
            try {
              if (chatUser) {
                const latest = await apiService.getMessages(chatUser._id, { limit: 10 });
                if (latest?.messages?.length) {
                  // Merge by _id de-dupe
                  setMessages((prev) => {
                    const map = new Map(prev.map(m => [m._id, m]));
                    for (const m of latest.messages) map.set(m._id, m);
                    return Array.from(map.values()).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                  });
                }
              }
            } catch {}
            if (localUrl) URL.revokeObjectURL(localUrl);
            setReplyToMessage(null);
          }
        } catch (e) {
          console.error('Voice upload failed', e);
          const tempId = currentTempVoiceIdRef.current;
          if (tempId) setMessages((prev) => prev.map(m => m._id === tempId ? { ...m, status: 'failed' as const } : m));
        } finally {
          setIsRecording(false);
          setRecordingStartedAt(null);
          cancelRecordingRef.current = false;
          setIsUploadingVoice(false);
          setUploadProgress(null);
          stream.getTracks().forEach(t => t.stop());
          currentTempVoiceIdRef.current = null;
          currentTempVoiceUrlRef.current = null;
        }
      };
      mediaRecorderRef.current = mr;
      // Use a very small timeslice to flush chunks faster for near-instant stop
      mr.start(50);
      setIsRecording(true);
      setRecordingStartedAt(Date.now());
    } catch (e) {
      console.error('Could not start recording', e);
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      // Immediately update UI and flush any remaining data
      setIsRecording(false);
      // Create a temp placeholder message immediately so user sees it instantly
      try {
        const duration = recordingStartedAt ? Math.round((Date.now() - recordingStartedAt) / 1000) : undefined;
        if (chatUser && currentUser) {
          const tempId = `temp-${Date.now()}`;
          currentTempVoiceIdRef.current = tempId;
          const tempMsg: Message = {
            _id: tempId,
            sender: { _id: currentUser._id, username: currentUser.username, fullName: currentUser.fullName, avatar: currentUser.avatar },
            recipient: { _id: chatUser._id, username: chatUser.username, fullName: chatUser.fullName, avatar: chatUser.avatar },
            content: '',
            messageType: 'audio',
            isRead: false,
            createdAt: new Date().toISOString(),
            reactions: [],
            status: 'sending',
            threadId: replyToMessage?.threadId ?? null,
            replyTo: replyToMessage ? { _id: replyToMessage._id, content: replyToMessage.content, sender: replyToMessage.sender } as any : null,
            audioUrl: null,
            audioDuration: duration ?? null,
          };
          setMessages((prev) => [...prev, tempMsg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 10);
        }
      } catch {}
      try { mr.requestData(); } catch {}
      mr.stop();
    }
  };

  const cancelRecording = () => {
    cancelRecordingRef.current = true;
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') mr.stop();
  };
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingEmitRef = useRef<number>(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageNotice, setShowNewMessageNotice] = useState(false);
  const isAtBottomRef = useRef<boolean>(true);
  const didInitialScrollRef = useRef<boolean>(false);
  const lastUserScrollAtRef = useRef<number>(0);
  const chatUserIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const messageNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const PAGE_SIZE = 30;

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleContextMenu = (e: MouseEvent) => {
      if (!contextMenu) return;
      e.preventDefault();
      setContextMenu(null);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [contextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (replyToMessage) setReplyToMessage(null);
        if (editingMessageId) {
          setEditingMessageId(null);
          setMessage("");
        }
        if (selectionMode) {
          setSelectionMode(false);
          setSelectedMessages(new Set());
        }
        if (showSearch) setShowSearch(false);
      }

      if (e.key === 'ArrowUp' && !message.trim() && !editingMessageId) {
        e.preventDefault();
        const myLastMessage = [...messages].reverse().find(m => m.sender._id === currentUser?._id);
        if (myLastMessage) {
          setEditingMessageId(myLastMessage._id);
          setMessage(myLastMessage.content);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [message, editingMessageId, replyToMessage, selectionMode, showSearch, messages, currentUser]);

  // Save draft to localStorage
  useEffect(() => {
    if (message.trim() && chatUser) {
      localStorage.setItem(`draft_${chatUser._id}`, message);
    } else if (chatUser) {
      localStorage.removeItem(`draft_${chatUser._id}`);
    }
  }, [message, chatUser]);

  // Load draft from localStorage
  useEffect(() => {
    if (chatUser && !editingMessageId) {
      const draft = localStorage.getItem(`draft_${ chatUser._id }`);
      if (draft) {
        setMessage(draft);
      }
    }
  }, [chatUser, editingMessageId]);

  // Filter messages based on search and date range
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const hasQ = q.length > 0;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) {
      // Include entire end day
      end.setHours(23, 59, 59, 999);
    }
    return messages.filter(msg => {
      const created = new Date(msg.createdAt);
      if (start && created < start) return false;
      if (end && created > end) return false;
      if (!hasQ) return true;
      return (
        msg.content.toLowerCase().includes(q) ||
        msg.sender.fullName.toLowerCase().includes(q)
      );
    });
  }, [messages, searchQuery, startDate, endDate]);

  // Group messages by sender and time
  const groupedMessages = filteredMessages.reduce((groups: Array<{messages: Message[], sender: Message['sender'], isOwn: boolean}>, msg, index) => {
    const prevMsg = filteredMessages[index - 1];
    const isOwn = msg.sender._id === currentUser?._id;
    const shouldGroup = prevMsg && 
      prevMsg.sender._id === msg.sender._id && 
      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000; // 5 minutes
    
    if (shouldGroup && groups.length > 0) {
      groups[groups.length - 1].messages.push(msg);
    } else {
      groups.push({
        messages: [msg],
        sender: msg.sender,
        isOwn
      });
    }
    
    return groups;
  }, []);

  // Add date separators
  const messagesWithDates = groupedMessages.reduce((acc: Array<any>, group, index) => {
    const currentDate = new Date(group.messages[0].createdAt);
    const prevGroup = groupedMessages[index - 1];
    const prevDate = prevGroup ? new Date(prevGroup.messages[0].createdAt) : null;
    
    const shouldShowDate = !prevDate || 
      currentDate.toDateString() !== prevDate.toDateString();
    
    if (shouldShowDate) {
      acc.push({
        type: 'date',
        date: currentDate,
        id: `date - ${ currentDate.toDateString() }`
      });
    }
    
    acc.push({
      type: 'group',
      ...group,
      id: `group - ${ group.messages[0]._id }`
    });
    
    return acc;
  }, []);

  const upsertMessage = (incoming: Message) => {
    setMessages((prev) => {
      const next = prev.some((m) => m._id === incoming._id)
        ? prev.map((m) => (m._id === incoming._id ? incoming : m))
        : [...prev, incoming];
      const map = new Map<string, Message>();
      for (const m of next as Message[]) map.set(m._id, m);
      return Array.from(map.values()) as Message[];
    });
  };

  const emitTyping = () => {
    if (!socketRef.current || !chatUser || !currentUser) return;
    const now = Date.now();
    if (now - lastTypingEmitRef.current < 500) return;
    lastTypingEmitRef.current = now;
    socketRef.current.emit('typing', { senderId: currentUser._id, recipientId: chatUser._id });
  };

  const retrySend = async (tempId: string, content: string) => {
    if (!chatUser) return;
    try {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'sending' as const } : m));
      const res = await apiService.sendMessage(chatUser._id, content);
      const confirmed = res.message as Message;
      setMessages(prev => prev.map(m => m._id === tempId ? { ...confirmed, status: 'sent' as const } : m));
      scrollToBottom();
    } catch (e) {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' as const } : m));
    }
  };

  useEffect(() => {
    chatUserIdRef.current = chatUser?._id ?? null;
  }, [chatUser]);
  useEffect(() => {
    currentUserIdRef.current = currentUser?._id ?? null;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const socket = socketIOClient(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join', currentUser._id);

    const handleNewMessage = (newMessage: Message) => {
      const me = currentUserIdRef.current;
      const other = chatUserIdRef.current;
      const ok = !!me && !!other && (
        (newMessage.sender._id === other && newMessage.recipient._id === me) ||
        (newMessage.sender._id === me && newMessage.recipient._id === other)
      );
      if (!ok) return;
      upsertMessage(newMessage);
      // If a thread panel is open, update it when message belongs to current thread
      if (threadOpen && threadRoot) {
        const activeThreadId = threadRoot.threadId || threadRoot._id;
        if ((newMessage.threadId || newMessage._id) === activeThreadId) {
          setThreadMessages(prev => {
            const exists = prev.some(m => m._id === newMessage._id);
            return exists ? prev.map(m => (m._id === newMessage._id ? newMessage : m)) : [...prev, newMessage];
          });
        }
      }
      const idleMs = Date.now() - (lastUserScrollAtRef.current || 0);
      if (isAtBottomRef.current && idleMs > 500) {
        scrollToBottom();
      } else {
        setShowNewMessageNotice(true);
      }
    };

    const handleMessageSent = (sentMessage: Message) => {
      const me = currentUserIdRef.current;
      const other = chatUserIdRef.current;
      const ok = !!me && !!other && (
        (sentMessage.sender._id === other && sentMessage.recipient._id === me) ||
        (sentMessage.sender._id === me && sentMessage.recipient._id === other)
      );
      if (!ok) return;
      if (sentMessage.sender._id === me) return;
      upsertMessage(sentMessage);
      if (threadOpen && threadRoot) {
        const activeThreadId = threadRoot.threadId || threadRoot._id;
        if ((sentMessage.threadId || sentMessage._id) === activeThreadId) {
          setThreadMessages(prev => {
            const exists = prev.some(m => m._id === sentMessage._id);
            return exists ? prev.map(m => (m._id === sentMessage._id ? sentMessage : m)) : [...prev, sentMessage];
          });
        }
      }
      const idleMs = Date.now() - (lastUserScrollAtRef.current || 0);
      if (isAtBottomRef.current && idleMs > 500) {
        scrollToBottom();
      } else {
        setShowNewMessageNotice(true);
      }
    };

    const handleTyping = (payload: { senderId: string; recipientId: string }) => {
      const me = currentUserIdRef.current;
      const other = chatUserIdRef.current;
      const ok = !!me && !!other && payload.senderId === other && payload.recipientId === me;
      if (!ok) return;
      setIsTyping(true);
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => setIsTyping(false), 2000);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('typing', handleTyping);

    const handleEdited = (msg: Message) => {
      setMessages(prev => prev.map(m => (m._id === msg._id ? { ...m, ...msg } : m)));
    };
    socket.on('messageEdited', handleEdited);

    const handleReaction = (payload: { messageId: string; reactions: any[] }) => {
      setMessages(prev => prev.map(m => (m._id === payload.messageId ? { ...m, reactions: payload.reactions as any } : m)));
    };
    socket.on('messageReaction', handleReaction);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSent', handleMessageSent);
      socket.off('typing', handleTyping);
      socket.off('messageEdited', handleEdited);
      socket.off('messageReaction', handleReaction);
      socket.disconnect();
      socketRef.current = null;
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    };
  }, [currentUser]);

  useEffect(() => {
    const run = async () => {
      if (!username) return;
      try {
        setIsLoading(true);
        const userProfile = await apiService.getUserProfile(username);
        setChatUser(userProfile.user);
        const messagesResponse = await apiService.getMessages(userProfile.user._id, { limit: PAGE_SIZE });
        setMessages(messagesResponse.messages as any);
        setHasMoreMessages(!!messagesResponse.hasMore);
        setTimeout(() => {
          if (!didInitialScrollRef.current) {
            scrollToBottom();
            didInitialScrollRef.current = true;
          }
        }, 50);
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [username]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      setIsAtBottom(nearBottom);
      lastUserScrollAtRef.current = Date.now();
      if (nearBottom) setShowNewMessageNotice(false);
      // Load older messages when near the top
      if (el.scrollTop < 60 && !loadingMore && hasMoreMessages) {
        void fetchMoreMessages();
      }
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadingMore, hasMoreMessages]);

  // Safe placeholder for fetching more messages (no API assumptions)
  const fetchMoreMessages = useCallback(async () => {
    if (!chatUser || messages.length === 0) {
      setHasMoreMessages(false);
      return;
    }
    setLoadingMore(true);
    try {
      const oldest = messages[0];
      const container = messagesContainerRef.current;
      const prevScrollHeight = container ? container.scrollHeight : 0;
      const res = await apiService.getMessages(chatUser._id, { before: oldest.createdAt, limit: PAGE_SIZE });
      const older = res.messages as any[];
      if (!older || older.length === 0) {
        setHasMoreMessages(false);
      } else {
        setMessages(prev => [...older, ...prev]);
        // Maintain scroll position after prepending
        requestAnimationFrame(() => {
          const newScrollHeight = container ? container.scrollHeight : 0;
          if (container) container.scrollTop = newScrollHeight - prevScrollHeight;
        });
      }
      setHasMoreMessages(!!res.hasMore);
    } catch (e) {
      console.error('Failed to load older messages', e);
    } finally {
      setLoadingMore(false);
    }
  }, [chatUser, messages]);

  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMessage = useCallback((id: string) => {
    const node = messageNodeRefs.current[id];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowSearch(false);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!chatUser || !currentUser) return;
    const trimmed = message.trim();
    if (!trimmed && !editingMessageId) return;

    try {
      const messageContent = trimmed;

      if (editingMessageId) {
        const res = await apiService.editMessage(editingMessageId, messageContent);
        const updated = res.message as Message;
        setMessages(prev => prev.map(m => (m._id === updated._id ? { ...m, ...updated } : m)));
        setEditingMessageId(null);
        setMessage("");
        return;
      }

      setMessage("");
      localStorage.removeItem(`draft_${ chatUser._id }`);

      const tempId = `${Date.now()}-tmp`;
      const optimistic: Message = {
        _id: tempId,
        sender: {
          _id: currentUser._id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
        },
        recipient: {
          _id: chatUser._id,
          username: chatUser.username,
          fullName: chatUser.fullName,
          avatar: chatUser.avatar,
        },
        content: messageContent,
        messageType: "text",
        isRead: false,
        createdAt: new Date().toISOString(),
        replyTo: replyToMessage
          ? {
              _id: replyToMessage._id,
              content: replyToMessage.content,
              sender: {
                _id: replyToMessage.sender._id,
                username: replyToMessage.sender.username,
                fullName: replyToMessage.sender.fullName,
                avatar: replyToMessage.sender.avatar,
              },
            }
          : undefined,
        status: 'sending' as const,
      };
      setMessages((prev) => [...prev, optimistic]);
      scrollToBottom();

      const res = await apiService.sendMessage(chatUser._id, messageContent, 'text', replyToMessage?._id);
      const confirmed = res.message as Message;
      setMessages((prev) => {
        const replaced = prev.map((m) => (m._id === tempId ? { ...confirmed, status: 'sent' } : m));
        const map = new Map<string, Message>();
        for (const m of replaced as Message[]) map.set(m._id, m);
        return Array.from(map.values()) as Message[];
      });
      setReplyToMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.map((m) => (m._id.endsWith('-tmp') ? { ...m, status: 'failed' as const } : m)));
      setMessage(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    const textarea = document.querySelector('.chat-textarea');
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }, [message]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showAttachments) {
        setShowAttachments(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAttachments]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const truncate = (text: string, n = 80) => (text.length > n ? text.slice(0, n - 1) + '…' : text);

  const groupedReactions = (msg: Message) => {
    const map = new Map<string, number>();
    (msg.reactions || []).forEach(r => map.set(r.emoji, (map.get(r.emoji) || 0) + 1));
    return Array.from(map.entries());
  };

  const handleReact = async (msg: Message, emoji: string) => {
    try {
      await apiService.reactToMessage(msg._id, emoji);
      setMessages(prev => prev.map(m => {
        if (m._id !== msg._id) return m;
        const mineId = currentUser?._id;
        const reactions = [...(m.reactions || [])];
        const idx = reactions.findIndex(r => (r as any).user?.toString?.() === String(mineId));
        if (idx !== -1) {
          if (reactions[idx].emoji === emoji) reactions.splice(idx, 1); else reactions[idx].emoji = emoji;
        } else {
          reactions.push({ user: String(mineId), emoji, createdAt: new Date().toISOString() } as any);
        }
        return { ...m, reactions };
      }));
    } catch (e) {
      console.error('Failed to react:', e);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyToMessage(msg);
  };

  const openThread = async (msg: Message) => {
    const rootId = msg.threadId || msg._id;
    setThreadRoot(msg);
    setThreadOpen(true);
    setThreadLoading(true);
    try {
      const res = await apiService.getThreadMessages(rootId, { limit: PAGE_SIZE });
      setThreadMessages(res.messages as any);
      setThreadHasMore(!!res.hasMore);
    } catch (e) {
      console.error('Failed to load thread', e);
    } finally {
      setThreadLoading(false);
    }
  };

  const closeThread = () => {
    setThreadOpen(false);
    setThreadRoot(null);
    setThreadMessages([]);
    setThreadHasMore(false);
  };

  const fetchMoreThreadMessages = async () => {
    if (!threadRoot || threadMessages.length === 0) return;
    const rootId = threadRoot.threadId || threadRoot._id;
    setThreadLoading(true);
    try {
      const oldest = threadMessages[0];
      const res = await apiService.getThreadMessages(rootId, { before: oldest.createdAt, limit: PAGE_SIZE });
      const older = res.messages as any[];
      if (!older || older.length === 0) {
        setThreadHasMore(false);
      } else {
        setThreadMessages(prev => [...older, ...prev]);
      }
      setThreadHasMore(!!res.hasMore);
    } catch (e) {
      console.error('Failed to load older thread messages', e);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleEditStart = (msg: Message) => {
    if (msg.sender._id !== currentUser?._id) return;
    setEditingMessageId(msg._id);
    setMessage(msg.content);
  };

  const handleCopyMessage = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setContextMenu(null);
  };

  const handleMessageSelect = (msgId: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
    }
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      if (next.size === 0) {
        setSelectionMode(false);
      }
      return next;
    });
  };

  const handleMessageLongPress = (msgId: string, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if ('touches' in e) {
      // Mobile long press - open action sheet
      setMobileActionSheet({ messageId: msgId });
    } else {
      // Desktop right click - show context menu
      setContextMenu({
        x: (e as React.MouseEvent).clientX,
        y: (e as React.MouseEvent).clientY,
        messageId: msgId
      });
    }
  };

  const formatLastSeen = (lastActive: string, isOnline: boolean) => {
    if (isOnline) return "Active now";
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Last seen ${ diffInMinutes }m ago`;
    if (diffInMinutes < 1440) return `Last seen ${ Math.floor(diffInMinutes / 60) }h ago`;
    return `Last seen ${ Math.floor(diffInMinutes / 1440) }d ago`;
  };

  const emojiCategories = [
    { name: 'Frequently used', emojis: ['👍','❤️','😂','😮','😢','😡','👏','🔥'] },
    { name: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇'] },
    { name: 'Hearts', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕'] },
    { name: 'Gestures', emojis: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇'] }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>

      {/* Upload progress bar */}
      {isUploadingVoice && typeof uploadProgress === 'number' && (
        <div className="px-6 pb-2">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          <div className="mt-1 text-xs text-gray-500">Uploading voice note… {uploadProgress}%</div>
        </div>
      )}

    {/* Thread Side Panel */}
    {threadOpen && (
      <div className="fixed inset-0 z-30">
        <div className="absolute inset-0 bg-black/30" onClick={closeThread} />
        <div className="absolute right-0 top-0 h-full w-full sm:w-[28rem] bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm text-gray-500">Thread</div>
              <div className="font-semibold text-gray-900 truncate max-w-[70%]">{threadRoot?.content || 'Thread'}</div>
            </div>
            <button onClick={closeThread} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {threadLoading && threadMessages.length === 0 && (
              <div className="text-sm text-gray-500">Loading thread…</div>
            )}
            {threadHasMore && (
              <div className="flex justify-center">
                <button onClick={fetchMoreThreadMessages} className="text-xs text-blue-600 hover:underline">Load older</button>
              </div>
            )}
            {threadMessages.map((m) => (
              <div key={m._id} className={`flex ${m.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl shadow ${m.sender._id === currentUser?._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {m.replyTo && (
                    <div className={`mb-2 text-xs rounded-lg px-2 py-1 border-l-2 ${m.sender._id === currentUser?._id ? 'bg-white/10 text-white/90 border-white/40' : 'bg-white text-gray-700 border-gray-300'}`}>
                      <div className="font-semibold truncate mb-1">{m.replyTo.sender.fullName.split(' ')[0]}</div>
                      <div className="truncate opacity-75">{m.replyTo.content}</div>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                  <div className="mt-1 text-[11px] opacity-70">{formatTime(m.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
            Reply in the main composer to add to this thread.
          </div>
        </div>
      </div>
    )}
          <span className="text-gray-600 font-medium">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-500 mb-4">The user you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/inbox')}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] h-[100dvh] bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button 
            onClick={() => navigate('/inbox')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
          </button>
          
          <Link to={`/profile/${chatUser.username}`} className="relative group flex-shrink-0" aria-label={`View ${chatUser.fullName}'s profile`}>
            <img
              src={chatUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
              alt={chatUser.fullName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-3 ring-white shadow-lg group-hover:scale-105 transition-all duration-300"
            />
          {
            chatUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )
          }
          </Link>

        <div className="min-w-0 flex-1 overflow-hidden">
          <Link
            to={`/profile/${chatUser.username}`}
            className="block font-semibold text-gray-900 text-base sm:text-lg truncate hover:underline transition-colors max-w-full"
            title={chatUser.fullName}
          >
            {chatUser.fullName || chatUser.username}
          </Link>
          <div className="mt-0.5 flex items-center gap-2 min-w-0">
            <p className="hidden sm:block text-xs sm:text-sm text-gray-500 truncate">
              {formatLastSeen(chatUser.lastActive, chatUser.isOnline)}
            </p>
            {!isOnline && (
              <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
        </div >

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
          <button className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
            <Phone className="w-5 h-5 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
          </button>
          <button className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
            <Video className="w-5 h-5 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
          </button>
          <button className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group" onClick={() => setShowTopMenu(v => !v)}>
            <MoreVertical className="w-5 h-5 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
          </button>
        </div>
      </div >

      {/* Top Menu (WhatsApp-like) */}
      {showTopMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowTopMenu(false)} />
          <div className="fixed right-4 top-16 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 min-w-[200px]">
            <button
              onClick={() => { setShowSearch(true); setShowTopMenu(false); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
            >
              Search
            </button>
            <button
              onClick={() => { navigate(`/profile/${chatUser.username}`); setShowTopMenu(false); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
            >
              View profile
            </button>
            <button
              onClick={() => setShowTopMenu(false)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-400 cursor-not-allowed"
              disabled
            >
              Mute notifications
            </button>
            <button
              onClick={() => setShowTopMenu(false)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-400 cursor-not-allowed"
              disabled
            >
              Block
            </button>
          </div>
        </>
      )}

        {/* Search Bar */ }
      { showSearch && (
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-6 py-3 animate-in slide-in-from-top duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
          {/* Date range filters */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-xs text-gray-500 sm:col-span-1">
              {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'} found
            </div>
            <div className="sm:col-span-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
                aria-label="Start date"
              />
            </div>
            <div className="sm:col-span-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
                aria-label="End date"
              />
            </div>
          </div>

          {/* Virtualized search results list */}
          {(searchQuery || startDate || endDate) && filteredMessages.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
              <List
                height={240}
                itemCount={filteredMessages.length}
                itemSize={56}
                width={'100%'}
                itemData={{
                  items: filteredMessages,
                  onJump: (id: string) => scrollToMessage(id),
                  query: searchQuery,
                }}
              >
                {({ index, style, data }: ListChildComponentProps<{ items: Message[]; onJump: (id: string) => void; query: string }>) => {
                  const msg = data.items[index] as Message;
                  return (
                    <div style={style} className="px-3 py-2 bg-white hover:bg-gray-50 cursor-pointer" onClick={() => data.onJump(msg._id)}>
                      <div className="text-xs text-gray-500 truncate">{new Date(msg.createdAt).toLocaleString()}</div>
                      <div className="text-sm text-gray-900 truncate">
                        {renderHighlighted(msg.content, data.query)}
                      </div>
                    </div>
                  );
                }}
              </List>
            </div>
          )}
        </div>
      )}

    {/* Selection Mode Header */ }
    {
      selectionMode && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectionMode(false);
                setSelectedMessages(new Set());
              }}
              className="p-1 hover:bg-blue-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
            <span className="font-medium text-blue-900">
              {selectedMessages.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-blue-200 rounded-xl transition-colors text-blue-600">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-blue-200 rounded-xl transition-colors text-blue-600">
              <Reply className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-red-200 rounded-xl transition-colors text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }

    {/* Mobile Action Sheet for message (long press) */}
    {mobileActionSheet && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setMobileActionSheet(null)} />
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 p-4">
          {(() => {
            const msg = messages.find(m => m._id === mobileActionSheet.messageId);
            if (!msg) return null;
            const isOwn = msg.sender._id === currentUser?._id;
            return (
              <div className="space-y-3">
                {/* Quick reactions */}
                <div className="flex items-center justify-center gap-2">
                  {['👍','❤️','😂','😮','😢','😡'].map(em => (
                    <button
                      key={em}
                      onClick={() => { handleReact(msg, em); setMobileActionSheet(null); }}
                      className="px-3 py-2 text-xl hover:bg-gray-100 rounded-xl"
                    >{em}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { handleReply(msg); setMobileActionSheet(null); }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 text-sm font-medium"
                  >Reply</button>
                  <button
                    onClick={() => { handleCopyMessage(msg); setMobileActionSheet(null); }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 text-sm font-medium"
                  >Copy</button>
                  <button
                    onClick={() => { setShowEmojiPicker(msg._id); setMobileActionSheet(null); }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 text-sm font-medium"
                  >React</button>
                  {isOwn && (
                    <button
                      onClick={() => { handleEditStart(msg); setMobileActionSheet(null); }}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 text-sm font-medium"
                    >Edit</button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </>
    )}

    {/* Messages */ }
    <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-1 scroll-smooth ${isInputFocused ? 'pb-40 sm:pb-28' : 'pb-28'}`}>
      {/* Top loader for pagination */}
      {loadingMore && (
        <div className="flex justify-center items-center py-2 text-xs text-gray-500">
          Loading older messages…
        </div>
      )}
      {messagesWithDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Smile className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Start the conversation</h3>
          <p className="text-gray-500 max-w-sm leading-relaxed">
            Send a message to {chatUser.fullName.split(' ')[0]} to begin your chat journey together.
          </p>
        </div>
      ) : (
        messagesWithDates.map((item) => (
          item.type === 'date' ? (
            <div key={item.id} className="flex justify-center my-6">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  {formatDate(item.date)}
                </span>
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className={`flex ${item.isOwn ? "justify-end" : "justify-start"} group animate-in slide-in-from-${item.isOwn ? 'right' : 'left'} duration-300`}
            >
              <div className="flex items-end space-x-3 max-w-[90%] sm:max-w-[80%] lg:max-w-[70%]">
                {/* Avatar removed for incoming messages per request */}

                <div className="flex flex-col space-y-2">
                  {item.messages.map((msg: Message, msgIndex: number) => (
                    <div
                      key={msg._id}
                      ref={(el) => { messageNodeRefs.current[msg._id] = el; }}
                      className={`group/message relative ${selectedMessages.has(msg._id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                        }`}
                      onMouseEnter={() => setHoveredMessageId(msg._id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                      onContextMenu={(e) => handleMessageLongPress(msg._id, e)}
                      onTouchStart={(e) => {
                        const timer = setTimeout(() => handleMessageLongPress(msg._id, e), 500);
                        const cleanup = () => clearTimeout(timer);
                        e.currentTarget.addEventListener('touchend', cleanup, { once: true });
                        e.currentTarget.addEventListener('touchmove', cleanup, { once: true });
                      }}
                      onClick={() => selectionMode && handleMessageSelect(msg._id)}
                    >
                      <div
                        className={`px-3 py-2 shadow-md transition-all duration-200 ${item.isOwn
                            ? `bg-gradient-to-r from-blue-500 to-purple-600 text-white ${msgIndex === 0 ? 'rounded-2xl rounded-br-md' :
                              msgIndex === item.messages.length - 1 ? 'rounded-2xl rounded-tr-md' :
                                'rounded-l-2xl rounded-r-md'
                            }`
                            : `bg-white text-gray-900 border border-gray-200 ${msgIndex === 0 ? 'rounded-2xl rounded-bl-md' :
                              msgIndex === item.messages.length - 1 ? 'rounded-2xl rounded-tl-md' :
                                'rounded-r-2xl rounded-l-md'
                            }`
                          } hover:shadow-lg group-hover/message:scale-[1.02]`}
                      >
                        {/* Reply preview */}
                        {msg.replyTo && (
                          <div className={`mb-2 text-xs rounded-lg px-2 py-1 border-l-2 max-h-12 overflow-hidden ${item.isOwn
                              ? 'bg-white/10 text-white/90 border-white/40'
                              : 'bg-gray-50 text-gray-700 border-gray-300'
                            }`}>
                            <div className="font-semibold truncate mb-1">
                              {msg.replyTo.sender._id === currentUser?._id ? 'You' : msg.replyTo.sender.fullName.split(' ')[0]}
                            </div>
                            <div className="truncate opacity-75">{truncate(msg.replyTo.content, 50)}</div>
                          </div>
                        )}

                        {msg.messageType === 'audio' && msg.audioUrl ? (
                          <div className="flex items-center gap-2">
                            <audio controls preload="none" src={msg.audioUrl} className="w-64 max-w-full" />
                            {typeof msg.audioDuration === 'number' && (
                              <span className={`text-xs ${item.isOwn ? 'text-white/80' : 'text-gray-500'}`}>{Math.max(1, Math.round(msg.audioDuration))}s</span>
                            )}
                            {msg.status === 'sending' && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.isOwn ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>Sending…</span>
                            )}
                            {msg.status === 'failed' && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.isOwn ? 'bg-red-500/20 text-white' : 'bg-red-100 text-red-700'}`}>Failed</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words break-all">{renderHighlighted(msg.content, searchQuery)}</p>
                        )}

                        <div className={`flex items-center justify-between mt-2 text-gray-500`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{formatTime(msg.createdAt)}</span>
                            {msg.edited && (
                              <span className="text-xs opacity-70 bg-black/10 px-1.5 py-0.5 rounded">
                                edited
                              </span>
                            )}
                          </div>

                          {item.isOwn && (
                            <div className="flex items-center">
                              {msg.status === 'sending' ? (
                                <div className="flex items-center gap-1">
                                  <RotateCw className="w-3 h-3 animate-spin text-gray-400" />
                                  <span className="text-xs">Sending</span>
                                </div>
                              ) : msg.status === 'failed' ? (
                                <button
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded-full transition-colors"
                                  onClick={() => retrySend(msg._id, msg.content)}
                                  title="Tap to retry"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                  <span className="text-xs">Retry</span>
                                </button>
                              ) : (
                                <CheckCheck className={`w-4 h-4 ${msg.isRead ? 'text-green-500' : 'text-gray-400'}`} />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Reactions */}
                        {groupedReactions(msg).length > 0 && (
                          <div className={`mt-3 flex flex-wrap gap-1.5 ${item.isOwn ? 'justify-end' : 'justify-start'}`}>
                            {groupedReactions(msg).map(([emoji, count]) => (
                              <button
                                key={emoji as string}
                                onClick={() => handleReact(msg, emoji as string)}
                                className={`text-sm px-2.5 py-1 rounded-full transition-all hover:scale-110 ${item.isOwn
                                    ? 'bg-white/20 text-white hover:bg-white/30'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                              >
                                {emoji} {count}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Message Actions (Desktop Hover) */}
                      {hoveredMessageId === msg._id && !selectionMode && (
                        <div className={`absolute top-0 ${item.isOwn ? '-left-16' : '-right-16'} flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-all duration-200 bg-white shadow-lg rounded-full p-1 border border-gray-200`}>
                          <button
                            onClick={() => handleReply(msg)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => openThread(msg)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Open thread"
                          >
                            <span className="w-4 h-4 text-gray-600">#</span>
                          </button>
                          <button
                            onClick={() => setShowEmojiPicker(msg._id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Add reaction"
                          >
                            <Smile className="w-4 h-4 text-gray-600" />
                          </button>
                          {msg.sender._id === currentUser?._id && (
                            <button
                              onClick={() => handleEditStart(msg)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ))
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start animate-in slide-in-from-left duration-300">
          <div className="flex items-end space-x-3">
            <Link to={`/profile/${chatUser.username}`} aria-label={`View ${chatUser.fullName}'s profile`}>
              <img
                src={chatUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
                alt={chatUser.fullName}
                className="w-8 h-8 rounded-full object-cover shadow-md"
              />
            </Link>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-6 py-4 shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* Context Menu */ }
    {
      contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 min-w-[160px]"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 180),
              top: Math.min(contextMenu.y, window.innerHeight - 200)
            }}
          >
            <button
              onClick={() => {
                const msg = messages.find(m => m._id === contextMenu.messageId);
                if (msg) handleReply(msg);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button
              onClick={() => {
                const msg = messages.find(m => m._id === contextMenu.messageId);
                if (msg) handleCopyMessage(msg);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            {messages.find(m => m._id === contextMenu.messageId)?.sender._id === currentUser?._id && (
              <button
                onClick={() => {
                  const msg = messages.find(m => m._id === contextMenu.messageId);
                  if (msg) handleEditStart(msg);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </>
      )
    }

    {/* Emoji Picker */ }
    {
      showEmojiPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(null)} />
          <div className="fixed bottom-32 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 max-w-xs">
            <div className="space-y-3">
              {emojiCategories.map((category) => (
                <div key={category.name}>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">{category.name}</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          const msg = messages.find(m => m._id === showEmojiPicker);
                          if (msg) {
                            handleReact(msg, emoji);
                          } else if (showEmojiPicker === 'composer') {
                            setMessage(prev => prev + emoji);
                          }
                          setShowEmojiPicker(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    }

    {/* Input Area */ }
    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/80 relative sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-lg">
      {/* Reply Banner */}
      {replyToMessage && (
        <div className="px-3 sm:px-6 pt-2 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between bg-blue-50 border-l-4 border-blue-400 rounded-lg p-2">
            <div className="text-xs flex-1 min-w-0 max-h-12 overflow-y-auto">
              <div className="font-semibold text-blue-900 mb-0.5">
                Replying to {replyToMessage.sender._id === currentUser?._id ? 'yourself' : replyToMessage.sender.fullName.split(' ')[0]}
              </div>
              <div className="text-blue-700 truncate">{truncate(replyToMessage.content, 80)}</div>
            </div>
            <button
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-all duration-200 ml-2 flex-shrink-0"
              onClick={() => setReplyToMessage(null)}
              aria-label="Cancel reply"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Message Notice */}
      {showNewMessageNotice && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => { scrollToBottom(); setShowNewMessageNotice(false); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-all hover:scale-105"
          >
            <ChevronDown className="w-4 h-4" />
            New message
          </button>
        </div>
      )}

      {/* Attachment Popup */}
      {showAttachments && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowAttachments(false)}
          />
          <div className="absolute bottom-full left-6 mb-3 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-in zoom-in duration-200">
            <div className="grid grid-cols-3 gap-3 w-52">
              {[
                { icon: Camera, label: 'Camera', color: 'bg-blue-500 hover:bg-blue-600' },
                { icon: Image, label: 'Gallery', color: 'bg-green-500 hover:bg-green-600' },
                { icon: FileText, label: 'Document', color: 'bg-purple-500 hover:bg-purple-600' },
                { icon: MapPin, label: 'Location', color: 'bg-red-500 hover:bg-red-600' },
                { icon: Smile, label: 'Sticker', color: 'bg-orange-500 hover:bg-orange-600' },
              ].map((item) => (
                <button key={item.label} className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group">
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-hover:scale-110 shadow-md`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="px-6 py-4">
        <div className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAttachments(!showAttachments);
            }}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${showAttachments
                ? 'bg-blue-500 text-white transform rotate-45 scale-110 shadow-lg'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:scale-110'
              }`}
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Input Container */}
          <div className="flex-1 relative">
            <div className={`flex items-end bg-gray-100 rounded-2xl transition-all duration-300 ${isInputFocused ? 'bg-white border-2 border-blue-500 shadow-lg scale-[1.02]' : 'border-2 border-transparent'
              }`}>
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); emitTyping(); }}
                  onFocus={() => { setIsInputFocused(true); messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Message ${truncate((chatUser.fullName || chatUser.username).split(' ')[0], 16)}`}
                  className="chat-textarea w-full px-4 py-3 bg-transparent border-0 rounded-2xl focus:outline-none resize-none placeholder-gray-500 text-gray-900 max-h-28 sm:max-h-36 leading-relaxed"
                  rows={1}
                  style={{
                    minHeight: '48px',
                    height: 'auto',
                    overflowY: message.length > 100 ? 'auto' : 'hidden'
                  }}
                  disabled={!isOnline}
                />
              </div>

              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker('composer')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-200 flex-shrink-0 mr-2"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            {/* Character counter for long messages */}
            {message.length > 200 && (
              <div className="absolute -top-6 right-0 text-xs text-gray-500">
                {message.length}/1000
              </div>
            )}
          </div>

          {/* Send / Voice Area (WhatsApp-style) */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Recording pill */}
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="tabular-nums">{formatDuration(recordElapsed)}</span>
                <button onClick={cancelRecording} className="text-red-600 hover:text-red-800" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {message.trim() || editingMessageId ? (
              <button
                onClick={handleSendMessage}
                disabled={!isOnline && !editingMessageId}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {editingMessageId ? (
                  <Edit3 className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            ) : (
              <button
                onClick={() => (isRecording ? stopRecording() : startRecording())}
                className={`p-3 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:scale-110'}`}
                title={isRecording ? 'Stop recording' : 'Record voice note'}
              >
                {isRecording ? (
                  <Square className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-orange-600">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Messages will be sent when connection is restored.</span>
          </div>
        )}
      </div>
    </div>
    </div >
  );
}

export default Chat;