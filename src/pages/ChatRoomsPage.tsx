import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter, parseQuery, getPathOnly } from '@/lib/router';
import { supabase, type SpecialtyChatRoom, type ChatRoomMessage, type Specialty } from '@/lib/supabase';
import { localizedField } from '@/lib/localizedContent';

export default function ChatRoomsPage() {
  const { t, specialtyName, lang, dir } = useI18n();
  const { path, navigate } = useRouter();
  const query = parseQuery(path);
  const route = getPathOnly(path);
  const activeRoomId = route.startsWith('/chat/') ? route.split('/')[2] : query.room;
  const [rooms, setRooms] = useState<(SpecialtyChatRoom & { specialty?: Specialty })[]>([]);
  const [messages, setMessages] = useState<ChatRoomMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(() => localStorage.getItem('chat_name') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('specialty_chat_rooms').select('*, specialty(*)').order('created_at').then(({ data }) => {
      setRooms(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeRoomId) {
      supabase.from('chat_room_messages').select('*').eq('room_id', activeRoomId).order('created_at').limit(50).then(({ data }) => setMessages(data || []));
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeRoomId) return;
    if (!userName) { setShowNamePrompt(true); return; }
    const msg = input.trim();
    setInput('');
    await supabase.from('chat_room_messages').insert({ room_id: activeRoomId, sender_name: userName, sender_type: 'user', body: msg });
    setMessages((prev) => [...prev, { id: Date.now().toString(), room_id: activeRoomId, sender_name: userName, sender_type: 'user', body: msg, is_flagged: false, created_at: new Date().toISOString() }]);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center pt-24 pb-16" dir={dir}><div className="animate-pulse text-gray-400">{t('common.loading')}</div></div>;

  if (activeRoomId) {
    const room = rooms.find((r) => r.id === activeRoomId);
    const roomName = localizedField(room as unknown as Record<string, unknown> | undefined, 'name', lang, room?.name || t('chat.title'));
    return (
      <div className="flex min-h-screen flex-col pt-20 pb-4" style={{ height: 'calc(100vh - 5rem)' }} dir={dir}>
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4">
          <div className="card mb-3 flex items-center justify-between p-4">
            <div>
              <h2 className="font-bold text-gray-800">{roomName}</h2>
              <p className="text-xs text-gray-400">{room?.specialty ? specialtyName(room.specialty) : ''}</p>
            </div>
            <button onClick={() => navigate('/chat')} className="text-sm text-teal-600 hover:text-teal-700">{t('common.back')}</button>
          </div>
          <div ref={scrollRef} className="card flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && <p className="py-8 text-center text-sm text-gray-400">{t('chat.placeholder')}</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_name === userName ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender_name === userName ? 'bg-teal-600 text-white' : 'border border-gray-100 bg-white text-gray-700'}`}>
                  {msg.sender_name !== userName && <p className="mb-0.5 text-xs font-semibold text-teal-600">{msg.sender_name}</p>}
                  <p className="text-sm">{msg.body}</p>
                  <p className={`mt-1 text-[10px] ${msg.sender_name === userName ? 'text-teal-100' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString(lang)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card mt-3 flex gap-2 p-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('chat.placeholder')} className="input-field flex-1" />
            <button onClick={handleSend} className="rounded-xl bg-teal-600 p-2.5 text-white hover:bg-teal-700"><Send className="h-5 w-5" /></button>
          </div>
          {showNamePrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNamePrompt(false)}>
              <div className="w-full max-w-sm rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-3 font-bold text-gray-800">{t('register.name')}</h3>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="input-field mb-3" />
                <button onClick={() => { localStorage.setItem('chat_name', userName); setShowNamePrompt(false); }} className="btn-primary w-full">{t('chat.send')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 rounded-3xl border border-gray-100 bg-gradient-to-br from-teal-50 via-white to-white p-7 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">{t('chat.title')}</h1>
          <p className="text-gray-500">{t('chat.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rooms.map((room) => {
            const name = localizedField(room as unknown as Record<string, unknown>, 'name', lang, room.name);
            const description = localizedField(room as unknown as Record<string, unknown>, 'description', lang, room.description || '');
            return (
              <button key={room.id} onClick={() => navigate(`/chat/${room.id}`)} className="card p-5 text-start transition hover:shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100"><MessageSquare className="h-6 w-6 text-teal-600" /></div>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Users className="h-3.5 w-3.5" />{room.member_count} {t('chat.members')}</span>
                </div>
                <h3 className="font-bold text-gray-800">{name}</h3>
                <p className="text-sm text-gray-500">{room.specialty ? specialtyName(room.specialty) : ''}</p>
                {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
              </button>
            );
          })}
          {rooms.length === 0 && <p className="col-span-2 py-8 text-center text-gray-400">{t('chat.subtitle')}</p>}
        </div>
      </div>
    </div>
  );
}
