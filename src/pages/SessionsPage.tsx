import { useEffect, useState } from 'react';
import { MessageSquare, Video, ArrowLeft, Send, AlertCircle, Shield, Clock, Calendar, Bell, Check } from 'lucide-react';
import { useRouter, parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Specialty, type TextSession, type ChatMessage, type SessionSchedule } from '@/lib/supabase';
import { demoDoctors, demoSpecialties } from '@/lib/demoData';

export default function SessionsPage() {
  const { path, navigate } = useRouter();
  const { t, specialtyName, lang } = useI18n();
  const query = parseQuery(path);
  const [mode, setMode] = useState<'menu' | 'free' | 'video'>('menu');

  // Free session state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [patientName, setPatientName] = useState('');
  const [session, setSession] = useState<TextSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [aiWarning, setAiWarning] = useState('');

  // Video session state
  const [videoDoctor, setVideoDoctor] = useState('');
  const [videoDate, setVideoDate] = useState('');
  const [videoName, setVideoName] = useState('');
  const [videoEmail, setVideoEmail] = useState('');
  const [videoPrice, setVideoPrice] = useState(25);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [doctorSchedule, setDoctorSchedule] = useState<SessionSchedule[]>([]);
  const [preferredTimes, setPreferredTimes] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: docs }, { data: specs }, { data: settings }] = await Promise.all([
          supabase.from('doctors').select('*, specialty(*)').order('rating', { ascending: false }),
          supabase.from('specialties').select('*').order('name'),
          supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        ]);
        setDoctors((docs && docs.length ? docs : demoDoctors) as Doctor[]);
        setSpecialties((specs && specs.length ? specs : demoSpecialties) as Specialty[]);
        if (settings) setVideoPrice(Number(settings.video_session_price) || 25);
      } catch {
        setDoctors(demoDoctors);
        setSpecialties(demoSpecialties);
      }
      if (query.doctor) setVideoDoctor(query.doctor);
    })();
  }, [query.doctor]);

  // Load messages for active session
  useEffect(() => {
    if (!session) return;
    const loadMessages = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('session_id', session.id).order('created_at', { ascending: true });
      setMessages(data || []);
    };
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [session]);

  const checkViolation = (text: string): string | null => {
    const contactPatterns = /(\+?\d{7,}|www\.|http|@[a-zA-Z0-9]+\.[a-zA-Z]{2,}|facebook|whatsapp|telegram|viber|skype|instagram|snapchat)/i;
    const religionPatterns = /(الله|إله|دين|محمد|يسوع|مسيح|سياسة|رئيس|حزب|انتخاب|سياسي|god|jesus|politics|election)/i;
    if (contactPatterns.test(text)) return 'محتوى مخالف: يمنع تبادل وسائل التواصل أو أرقام الهواتف';
    if (religionPatterns.test(text)) return 'محتوى مخالف: يمنع النقاش في الدين أو السياسة';
    return null;
  };

  const handleCreateSession = async () => {
    if (!patientName.trim() || !selectedSpecialty) return;
    setCreating(true);
    const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
    if (!spec) { setCreating(false); return; }
    const { data } = await supabase.from('text_sessions').insert({
      doctor_id: selectedDoctor || null,
      patient_name: patientName.trim(),
      specialty_id: spec.id,
      status: 'active',
      message_count: 0,
      max_messages: 5,
    }).select('*, doctor(*), specialty(*)').single();
    if (data) setSession(data);
    setCreating(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !session) return;
    const violation = checkViolation(messageInput);
    if (violation) {
      setAiWarning(violation);
      setTimeout(() => setAiWarning(''), 4000);
      await supabase.from('ai_violations').insert({
        source_type: 'text_session',
        source_id: session.id,
        user_name: patientName,
        content_snippet: messageInput.substring(0, 200),
        violation_type: violation.includes('تواصل') ? 'contact_sharing' : 'religion_politics',
        severity: 'high',
        status: 'pending',
        ai_response: violation,
      });
      return;
    }

    const newCount = (session.message_count || 0) + 1;
    await supabase.from('chat_messages').insert({
      session_id: session.id,
      sender_type: 'patient',
      sender_name: patientName,
      body: messageInput.trim(),
    });
    await supabase.from('text_sessions').update({ message_count: newCount }).eq('id', session.id);
    setSession({ ...session, message_count: newCount });
    setMessageInput('');

    // Simulated doctor auto-reply
    if (newCount < (session.max_messages || 5)) {
      setTimeout(async () => {
        const replies = [
          'شكراً لسؤالك. هل يمكنك توضيح الأعراض أكثر؟',
          'بناءً على ما ذكرته، أنصحك بمراجعة طبيب مختص للفحص المباشر.',
          'هل تعاني من أعراض أخرى مرافقة؟',
          'من المهم متابعة حالتك. هل هناك تاريخ عائلي لهذا المرض؟',
          'أنصحك بتجنب المنبهات والحفاظ على نظام غذائي صحي.',
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        await supabase.from('chat_messages').insert({
          session_id: session.id,
          sender_type: 'doctor',
          sender_name: session.doctor?.name || 'الطبيب',
          body: reply,
        });
      }, 1500);
    }

    if (newCount >= (session.max_messages || 5)) {
      await supabase.from('text_sessions').update({ status: 'ended' }).eq('id', session.id);
      setSession({ ...session, status: 'ended' });
    }
  };

  // Load doctor schedule when selected
  useEffect(() => {
    if (!videoDoctor) { setDoctorSchedule([]); return; }
    supabase.from('session_schedule').select('*').eq('doctor_id', videoDoctor).eq('is_booked', false).order('available_from', { ascending: true }).then(({ data }) => {
      setDoctorSchedule(data || []);
    });
  }, [videoDoctor]);

  const handleRequestSession = async () => {
    if (!videoDoctor || !videoName.trim() || !videoEmail.trim()) return;
    setBooking(true);
    await supabase.from('session_schedule').insert({
      doctor_id: videoDoctor,
      client_name: videoName.trim(),
      client_email: videoEmail.trim(),
      client_preferred_times: preferredTimes.trim() || null,
      status: 'requested',
      is_booked: false,
    });
    setBooking(false);
    setRequestSent(true);
    setTimeout(() => { setMode('menu'); setRequestSent(false); setPreferredTimes(''); }, 3500);
  };

  const handleBookSlot = async (slot: SessionSchedule) => {
    setBooking(true);
    await supabase.from('session_schedule').update({
      is_booked: true,
      client_name: videoName.trim(),
      client_email: videoEmail.trim(),
      status: 'booked',
    }).eq('id', slot.id);
    await supabase.from('video_sessions').insert({
      doctor_id: videoDoctor,
      patient_name: videoName.trim(),
      patient_email: videoEmail.trim(),
      scheduled_at: slot.available_from,
      duration_minutes: 30,
      price: videoPrice,
      status: 'confirmed',
      is_recorded: true,
    });
    setBooking(false);
    setBooked(true);
    setTimeout(() => { setMode('menu'); setBooked(false); }, 3000);
  };

  const handleBookVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoDoctor || !videoDate || !videoName.trim() || !videoEmail.trim()) return;
    setBooking(true);
    const { data } = await supabase.from('video_sessions').insert({
      doctor_id: videoDoctor,
      patient_name: videoName.trim(),
      patient_email: videoEmail.trim(),
      scheduled_at: new Date(videoDate).toISOString(),
      duration_minutes: 30,
      price: videoPrice,
      status: 'pending',
      is_recorded: true,
    }).select('*, doctor(*)').single();
    if (data) {
      await supabase.from('payments').insert({
        payer_email: videoEmail.trim(),
        payer_name: videoName.trim(),
        amount: videoPrice,
        currency: 'USD',
        payment_type: 'video_session',
        reference_id: data.id,
        status: 'pending',
      });
    }
    setBooking(false);
    setBooked(true);
    setTimeout(() => { setMode('menu'); setBooked(false); }, 3000);
  };

  if (mode === 'menu') {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('sessions.title')}</h1>
            <p className="text-gray-500">{t('sessions.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free text session */}
            <div className="card card-hover p-8 text-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t('sessions.free_text')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('sessions.free_text_desc')}</p>
              <span className="badge bg-green-100 text-green-700 mb-4">{t('common.free')}</span>
              <div>
                <button onClick={() => setMode('free')} className="btn-primary w-full flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t('sessions.start_free')}
                </button>
              </div>
            </div>

            {/* Paid video session */}
            <div className="card card-hover p-8 text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-500 to-transparent opacity-5 w-32 h-32 rounded-full" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t('sessions.video_paid')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('sessions.video_paid_desc')}</p>
              <span className="badge bg-teal-100 text-teal-700 mb-4">${videoPrice}</span>
              <div>
                <button onClick={() => setMode('video')} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Video className="w-5 h-5" />
                  {t('sessions.book_video')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'free') {
    if (!session) {
      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMode('menu')} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> {t('common.back')}
            </button>
            <div className="card p-7">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t('sessions.free_title')}</h2>
              <p className="text-gray-500 text-sm mb-6">{t('sessions.free_desc')}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.patient_name')}</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="input-field" placeholder={t('ask.name_placeholder')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.specialty')}</label>
                  <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="input-field cursor-pointer">
                    <option value="">{t('ask.select_specialty')}</option>
                    {specialties.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.select_doctor')}</label>
                  <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="input-field cursor-pointer">
                    <option value="">{t('common.all')}</option>
                    {doctors.filter(d => !selectedSpecialty || d.specialty?.slug === selectedSpecialty).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-2 text-sm text-amber-700">
                  <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{t('sessions.free_disclaimer')}</span>
                </div>
                <button onClick={handleCreateSession} disabled={creating || !patientName.trim() || !selectedSpecialty} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {creating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common.loading')}</> : t('sessions.start_free')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const messagesLeft = (session.max_messages || 5) - (session.message_count || 0);

    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Chat header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{session.doctor?.name || 'طبيب متاح'}</h3>
                <p className="text-xs text-teal-100">{specialtyName(session.specialty) || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${session.status === 'active' ? 'bg-green-400 text-white' : 'bg-gray-400 text-white'}`}>
                  {session.status === 'active' ? `${messagesLeft} ${t('sessions.messages_left')}` : t('sessions.session_ended')}
                </span>
                {session.status === 'active' && (
                  <button onClick={async () => { await supabase.from('text_sessions').update({ status: 'ended' }).eq('id', session.id); setSession({ ...session, status: 'ended' }); }} className="text-white/80 hover:text-white text-sm">
                    {t('sessions.end_session')}
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'patient' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender_type === 'patient' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_type === 'patient' ? 'text-teal-100' : 'text-gray-400'}`}>{msg.sender_name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Warning */}
            {aiWarning && (
              <div className="bg-red-50 border-t border-red-100 px-4 py-2 flex items-center gap-2 text-sm text-red-600 animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {aiWarning}
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100">
              {session.status === 'active' && messagesLeft > 0 ? (
                <div className="flex gap-2">
                  <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={t('sessions.type_message')} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm" />
                  <button onClick={handleSendMessage} className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">{t('sessions.session_ended')}</p>
                  <button onClick={() => { setMode('menu'); setSession(null); setMessages([]); }} className="btn-secondary mt-3 text-sm">{t('common.back')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Video booking mode
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => setMode('menu')} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </button>
        {booked ? (
          <div className="card p-10 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('sessions.booked')}</h3>
            <p className="text-gray-500">سيصلك رابط الجلسة على بريدك الإلكتروني قبل الموعد</p>
          </div>
        ) : (
          <div className="card p-7">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('sessions.video_title')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('sessions.video_desc')}</p>
            <form onSubmit={handleBookVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.select_doctor')}</label>
                <select value={videoDoctor} onChange={(e) => setVideoDoctor(e.target.value)} className="input-field cursor-pointer" required>
                  <option value="">اختر طبيباً...</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} - {specialtyName(d.specialty)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.select_date')}</label>
                <input type="datetime-local" value={videoDate} onChange={(e) => setVideoDate(e.target.value)} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.patient_name')}</label>
                  <input type="text" value={videoName} onChange={(e) => setVideoName(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.patient_email')}</label>
                  <input type="email" value={videoEmail} onChange={(e) => setVideoEmail(e.target.value)} className="input-field" required />
                </div>
              </div>
              <div className="bg-teal-50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-gray-600 font-medium">{t('sessions.price')}</span>
                <span className="text-2xl font-bold text-teal-600">${videoPrice}</span>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-2 text-sm text-amber-700">
                <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{t('sessions.recording_notice')}</span>
              </div>
              <button type="submit" disabled={booking} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {booking ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('sessions.booking')}</> : <><Video className="w-5 h-5" />{t('sessions.book')}</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
