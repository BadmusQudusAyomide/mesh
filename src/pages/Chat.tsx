import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextHelpers";
import { apiService } from "../lib/api";
import socketIOClient from "socket.io-client";
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
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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
  // optional reply link (populated)
  replyTo?: {
    _id: string;
    content: string;
    sender: { _id: string; username: string; fullName: string; avatar: string };
  } | null;
  // reactions array from backend
  reactions?: { user: string; emoji: string; createdAt: string }[];
  edited?: boolean;
  editedAt?: string;
  // client-only status for optimistic updates
  status?: 'sending' | 'failed' | 'sent';
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
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof socketIOClient> | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingEmitRef = useRef<number>(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageNotice, setShowNewMessageNotice] = useState(false);
  const isAtBottomRef = useRef<boolean>(true);
  const didInitialScrollRef = useRef<boolean>(false);
  const lastUserScrollAtRef = useRef<number>(0);
  // Keep latest IDs to avoid effect re-binding
  const chatUserIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Upsert helper to avoid duplicates
  const upsertMessage = (incoming: Message) => {
    setMessages((prev) => {
      // replace if exists, otherwise append
      const next = prev.some((m) => m._id === incoming._id)
        ? prev.map((m) => (m._id === incoming._id ? incoming : m))
        : [...prev, incoming];
      // de-duplicate by _id in case race conditions created duplicates
      const map = new Map<string, Message>();
      for (const m of next as Message[]) map.set(m._id, m);
      return Array.from(map.values()) as Message[];
    });
  };

  // Emit typing events (throttled)
  const emitTyping = () => {
    if (!socketRef.current || !chatUser || !currentUser) return;
    const now = Date.now();
    if (now - lastTypingEmitRef.current < 500) return; // throttle
    lastTypingEmitRef.current = now;
    socketRef.current.emit('typing', { senderId: currentUser._id, recipientId: chatUser._id });
  };

  // Retry sending a failed optimistic message
  const retrySend = async (tempId: string, content: string) => {
    if (!chatUser) return;
    try {
      // set back to sending
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'sending' as const } : m));
      const res = await apiService.sendMessage(chatUser._id, content);
      const confirmed = res.message as Message;
      setMessages(prev => prev.map(m => m._id === tempId ? { ...confirmed, status: 'sent' as const } : m));
      scrollToBottom();
    } catch (e) {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' as const } : m));
    }
  };

  // Keep refs in sync
  useEffect(() => {
    chatUserIdRef.current = chatUser?._id ?? null;
  }, [chatUser]);
  useEffect(() => {
    currentUserIdRef.current = currentUser?._id ?? null;
  }, [currentUser]);

  // Initialize socket once per session user
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
      // If this event represents a message I sent, we already handle via API response.
      if (sentMessage.sender._id === me) return;
      upsertMessage(sentMessage);
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

    // Live updates: message edited
    const handleEdited = (msg: Message) => {
      setMessages(prev => prev.map(m => (m._id === msg._id ? { ...m, ...msg } : m)));
    };
    socket.on('messageEdited', handleEdited);

    // Live updates: reactions
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

  // Fetch chat user and initial messages when username changes
  useEffect(() => {
    const run = async () => {
      if (!username) return;
      try {
        setIsLoading(true);
        const userProfile = await apiService.getUserProfile(username);
        setChatUser(userProfile.user);
        const messagesResponse = await apiService.getMessages(userProfile.user._id);
        setMessages(messagesResponse.messages);
        // One-time smooth scroll on entering chat after messages render
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


  // Track scroll position to know if user is at bottom
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      setIsAtBottom(nearBottom);
      lastUserScrollAtRef.current = Date.now();
      if (nearBottom) setShowNewMessageNotice(false);
    };
    el.addEventListener('scroll', onScroll);
    // Init state
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // keep ref in sync
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!chatUser || !currentUser) return;
    const trimmed = message.trim();
    if (!trimmed && !editingMessageId) return;

    try {
      const messageContent = trimmed;

      // Editing existing message
      if (editingMessageId) {
        const res = await apiService.editMessage(editingMessageId, messageContent);
        const updated = res.message as Message;
        setMessages(prev => prev.map(m => (m._id === updated._id ? { ...m, ...updated } : m)));
        setEditingMessageId(null);
        setMessage("");
        return;
      }

      setMessage("");

      // Optimistic message
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

      // Send to server
      const res = await apiService.sendMessage(chatUser._id, messageContent, 'text', replyToMessage?._id);
      const confirmed = res.message as Message;
      setMessages((prev) => {
        const replaced = prev.map((m) => (m._id === tempId ? { ...confirmed, status: 'sent' } : m));
        // de-duplicate by _id to guard against a socket add that arrived first
        const map = new Map<string, Message>();
        for (const m of replaced as Message[]) map.set(m._id, m);
        return Array.from(map.values()) as Message[];
      });
      setReplyToMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark last optimistic as failed
      setMessages((prev) => prev.map((m) => (m._id.endsWith('-tmp') ? { ...m, status: 'failed' as const } : m)));
      setMessage(message); // Restore input on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }, [message]);

  // Close attachments when clicking outside
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

  const truncate = (text: string, n = 80) => (text.length > n ? text.slice(0, n - 1) + '…' : text);

  const groupedReactions = (msg: Message) => {
    const map = new Map<string, number>();
    (msg.reactions || []).forEach(r => map.set(r.emoji, (map.get(r.emoji) || 0) + 1));
    return Array.from(map.entries());
  };

  const handleReact = async (msg: Message, emoji: string) => {
    try {
      await apiService.reactToMessage(msg._id, emoji);
      // Optimistic-ish: toggle local while socket confirms
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
    setSelectedMessageId(null);
  };

  const handleEditStart = (msg: Message) => {
    if (msg.sender._id !== currentUser?._id) return;
    setEditingMessageId(msg._id);
    setMessage(msg.content);
    setSelectedMessageId(null);
  };

  const formatLastSeen = (lastActive: string, isOnline: boolean) => {
    if (isOnline) return "Active now";
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <button 
            onClick={() => navigate('/inbox')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] h-[100dvh] bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4 min-w-0">
          <button 
            onClick={() => navigate('/inbox')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
          <Link to={`/profile/${chatUser.username}`} className="relative group" aria-label={`View ${chatUser.fullName}'s profile`}>
            <img
              src={chatUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
              alt={chatUser.fullName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md group-hover:brightness-95 transition"
            />
            {chatUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </Link>
          <div className="min-w-0">
            <Link
              to={`/profile/${chatUser.username}`}
              className="font-semibold text-gray-900 text-lg truncate max-w-[60vw] sm:max-w-[40vw] hover:underline"
              title={chatUser.fullName}
            >
              {(chatUser.fullName || chatUser.username).split(' ')[0]}
            </Link>
            <p className="text-sm text-gray-500 truncate max-w-[60vw] sm:max-w-[40vw]">{formatLastSeen(chatUser.lastActive, chatUser.isOnline)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
            <Phone className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
            <Video className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
            <MoreVertical className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-28">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Smile className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-500 max-w-sm">Send a message to {chatUser.fullName} to begin your chat.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.sender._id === currentUser?._id ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                {msg.sender._id !== currentUser?._id && (
                  <Link to={`/profile/${msg.sender.username}`} className="flex-shrink-0" aria-label={`View ${msg.sender.fullName}'s profile`}>
                    <img
                      src={msg.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.username}`}
                      alt={msg.sender.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </Link>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.sender._id === currentUser?._id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                  }`}
                  onClick={() => setSelectedMessageId(prev => (prev === msg._id ? null : msg._id))}
                >
                  {/* Reply preview inside bubble */}
                  {msg.replyTo && (
                    <div className={`mb-2 text-xs rounded-xl px-3 py-2 ${msg.sender._id === currentUser?._id ? 'bg-white/15 text-white/90' : 'bg-gray-100 text-gray-700'}`}>
                      <div className="font-semibold truncate">Replying to {msg.replyTo.sender.fullName.split(' ')[0]}</div>
                      <div className="truncate">{truncate(msg.replyTo.content, 80)}</div>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div
                    className={`flex items-center justify-end mt-2 space-x-1 ${
                      msg.sender._id === currentUser?._id ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    <span className="text-xs">{formatTime(msg.createdAt)}</span>
                    {msg.edited && <span className="text-[10px] opacity-70 ml-1">(edited)</span>}
                    {msg.sender._id === currentUser?._id && (
                      msg.status === 'sending' ? (
                        <RotateCw className="w-3 h-3 animate-spin text-blue-200" />
                      ) : msg.status === 'failed' ? (
                        <button
                          className="flex items-center gap-1 text-red-200 hover:text-red-100"
                          onClick={() => retrySend(msg._id, msg.content)}
                          title="Tap to retry"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-[10px]">Retry</span>
                        </button>
                      ) : (
                        <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-blue-200' : 'text-blue-300'}`} />
                      )
                    )}
                  </div>

                  {/* Reactions summary */}
                  {groupedReactions(msg).length > 0 && (
                    <div className={`mt-2 flex flex-wrap gap-1 ${msg.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                      {groupedReactions(msg).map(([emoji, count]) => (
                        <span key={emoji as string} className={`text-xs px-2 py-0.5 rounded-full ${msg.sender._id === currentUser?._id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>{emoji} {count}</span>
                      ))}
                    </div>
                  )}

                  {/* Inline message actions */}
                  {selectedMessageId === msg._id && (
                    <div className={`mt-2 flex items-center gap-2 ${msg.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                      <button className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => handleReply(msg)}>Reply</button>
                      <div className="flex items-center gap-1">
                        {['👍','❤️','😂','😮','😢'].map(em => (
                          <button key={em} className="px-1" onClick={() => handleReact(msg, em)} aria-label={`React ${em}`}>{em}</button>
                        ))}
                      </div>
                      {msg.sender._id === currentUser?._id && (
                        <button className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => handleEditStart(msg)}>Edit</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <Link to={`/profile/${chatUser.username}`} aria-label={`View ${chatUser.fullName}'s profile`}>
                <img
                  src={chatUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
                  alt={chatUser.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
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

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 relative sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)]">
        {/* Replying banner */}
        {replyToMessage && (
          <div className="px-4 pt-3">
            <div className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-xl p-2">
              <div className="text-sm">
                <div className="font-semibold text-gray-700">Replying to {replyToMessage.sender.fullName.split(' ')[0]}</div>
                <div className="text-gray-500 truncate max-w-[70vw]">{truncate(replyToMessage.content, 100)}</div>
              </div>
              <button className="p-1 text-gray-500 hover:text-gray-700" onClick={() => setReplyToMessage(null)} aria-label="Cancel reply">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {/* New message notice when not at bottom */}
        {showNewMessageNotice && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <button
              onClick={() => { scrollToBottom(); setShowNewMessageNotice(false); }}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full shadow-md hover:bg-blue-700"
            >
              New message • Tap to view
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
            <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50">
              <div className="grid grid-cols-3 gap-2 w-48">
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-600 transition-colors">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Camera</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-600 transition-colors">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Gallery</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-600 transition-colors">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Document</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-red-600 transition-colors">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Location</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-600 transition-colors">
                    <Smile className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Sticker</span>
                </button>
              </div>
            </div>
          </>
        )}
        
        <div className="px-4 py-3">
          <div className="flex items-end space-x-2">
            {/* Attachment Button - Hidden when typing on mobile */}
            {(!message.trim() || !isInputFocused) && (
              <button 
                onClick={() => setShowAttachments(!showAttachments)}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${
                  showAttachments 
                    ? 'bg-blue-500 text-white transform rotate-45' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {showAttachments ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            )}
            
            {/* Input Container */}
            <div className="flex-1 relative">
              <div className={`flex items-end bg-gray-100 rounded-2xl transition-all duration-200 ${
                isInputFocused ? 'bg-white border border-gray-300 shadow-sm' : ''
              }`}>
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); emitTyping(); }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${(chatUser.fullName || chatUser.username).split(' ')[0]}...`}
                    className="w-full px-4 py-3 bg-transparent border-0 rounded-2xl focus:outline-none resize-none placeholder-gray-500 text-gray-900 max-h-32"
                    rows={1}
                    style={{
                      minHeight: '44px',
                      height: 'auto',
                      overflowY: message.length > 100 ? 'auto' : 'hidden'
                    }}
                  />
                </div>
                
                {/* Emoji Button - Only show when not typing or on desktop */}
                {(!message.trim() || window.innerWidth >= 768) && (
                  <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0">
                    <Smile className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Voice/Send Button */}
            <div className="flex-shrink-0">
              {message.trim() || editingMessageId ? (
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingMessageId ? <span className="text-sm font-semibold px-1">Save</span> : <Send className="w-5 h-5" />}
                </button>
              ) : (
                <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
