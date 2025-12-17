import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getRooms, getChatMessages, reportEntity } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';

export default function ChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const topSentinelRef = useRef(null);
  const observer = useRef(null);

  useEffect(() => {
    fetchRooms();

    const newSocket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message) => {
      setMessages((prev) => {
        if (message.clientSideId) {
          const existingIdx = prev.findIndex(m => m.clientSideId === message.clientSideId);
          if (existingIdx !== -1) {
            const newArr = [...prev];
            newArr[existingIdx] = message;
            return newArr;
          }
        }
        if (prev.some(m => m._id === message._id)) return prev;

        if (activeRoom && message.room === activeRoom._id) {
          return [...prev, message];
        }
        return prev;
      });

      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (isNearBottom) {
          setTimeout(scrollToBottom, 50);
        }
      }
    });

    socket.on('room_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('error_message', (err) => {
      if (err.clientSideId) {
        setMessages(prev => prev.map(m =>
          m.clientSideId === err.clientSideId
            ? { ...m, status: 'error' }
            : m
        ));
      }
      alert(err.message);
    });

    return () => {
      socket.off('receive_message');
      socket.off('room_users');
      socket.off('error_message');
    };
  }, [socket, activeRoom]);

  useEffect(() => {
    if (socket && activeRoom) {
      socket.emit('join_room', activeRoom._id);
      setMessages([]);
      setHasMore(true);
      loadMessages(activeRoom._id, null);
    }
  }, [activeRoom, socket]);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading && messages.length > 0) {
      const oldestMessage = messages[0];
      if (oldestMessage._id && !oldestMessage.clientSideId) {
        loadMessages(activeRoom._id, oldestMessage.createdAt);
      }
    }
  }, [hasMore, loading, messages, activeRoom]);

  useEffect(() => {
    const option = {
      root: messagesContainerRef.current,
      rootMargin: '20px',
      threshold: 0,
    };
    observer.current = new IntersectionObserver(handleObserver, option);
    if (topSentinelRef.current) observer.current.observe(topSentinelRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [handleObserver]);

  const fetchRooms = async () => {
    try {
      const { data } = await getRooms();
      setRooms(data);
      if (data.length > 0) setActiveRoom(data[0]);
    } catch (error) {
      console.error('Failed to load rooms');
    }
  };

  const loadMessages = async (roomId, before) => {
    setLoading(true);
    const container = messagesContainerRef.current;
    const oldHeight = container ? container.scrollHeight : 0;

    try {
      const { data } = await getChatMessages(roomId, before);

      if (data.length < 50) setHasMore(false);

      setMessages(prev => before ? [...data, ...prev] : data);

      if (before && container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - oldHeight;
        });
      } else {
        setTimeout(scrollToBottom, 50);
      }
    } catch (error) {
      console.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeRoom) return;

    const clientSideId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg = {
      _id: clientSideId,
      clientSideId,
      content: newMessage,
      authorId: {
        _id: user._id,
        nickname: user.nickname,
        avatarId: user.avatarId,
        avatarUrl: user.avatarUrl,
      },
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    scrollToBottom();

    socket.emit('send_message', {
      room: activeRoom._id,
      content: optimisticMsg.content,
      clientSideId,
    });
  };

  const handleReport = async (msgId) => {
    const reason = prompt('Reason for reporting this message:');
    if (reason) {
      try {
        await reportEntity('ChatMessage', msgId, reason);
        alert('Message reported. Thank you for keeping the community safe.');
      } catch (err) {
        alert('Failed to report message.');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-shell">
      <div className="chat-sidebar">
        <Card style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Topics</h3>
            <p style={{ margin: '0.4rem 0 0', color: 'var(--textMuted)', fontSize: '0.85rem' }}>
              Drop into a room and share.
            </p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rooms.map(room => (
              <button
                key={room._id}
                onClick={() => setActiveRoom(room)}
                className="room-button"
                data-active={activeRoom?._id === room._id}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>{room.icon}</span>
                  <span style={{ fontWeight: 600 }}>{room.name}</span>
                </div>
                <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--textMuted)' }}>
                  {room.topic}
                </div>
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Online peers</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--textMuted)' }}>{onlineUsers.length}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.75rem' }}>
              {onlineUsers.slice(0, 12).map((u, i) => (
                <Avatar key={i} user={u} size={28} />
              ))}
              {onlineUsers.length > 12 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--textMuted)' }}>+{onlineUsers.length - 12}</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="chat-panel">
        <div className="chat-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
              {activeRoom ? `${activeRoom.icon} ${activeRoom.name}` : 'Select a room'}
            </h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--textMuted)', fontSize: '0.85rem' }}>
              {activeRoom?.description || activeRoom?.topic}
            </p>
          </div>
        </div>

        <div ref={messagesContainerRef} className="chat-messages">
          <div ref={topSentinelRef} style={{ height: '10px' }} />
          {loading && <div style={{ textAlign: 'center', color: 'var(--textMuted)', fontSize: '0.8rem' }}>Loading more...</div>}

          {messages.map((msg) => {
            const isMe = msg.authorId._id === user._id;
            const isOptimistic = msg.status === 'sending';
            const isError = msg.status === 'error';

            return (
              <div key={msg._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '4px',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    fontSize: '0.75rem',
                    color: 'var(--textMuted)',
                  }}
                >
                  <Avatar user={msg.authorId} size={22} />
                  <span>{msg.authorId.nickname || 'Anonymous'}</span>
                </div>

                <div
                  className={`message-bubble ${isMe ? 'is-me' : ''} ${isError ? 'is-error' : ''}`}
                  style={{ opacity: isOptimistic ? 0.7 : 1 }}
                >
                  {msg.content}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  {isMe && isOptimistic && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--textMuted)' }}>Sending...</span>
                  )}
                  {isMe && isError && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--red)' }}>Failed to send</span>
                  )}

                  {!isMe && !isOptimistic && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReport(msg._id)}
                      style={{ fontSize: '0.7rem' }}
                    >
                      Report
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-input-row">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            maxLength={500}
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
