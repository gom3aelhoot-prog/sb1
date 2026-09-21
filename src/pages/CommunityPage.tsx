import { useState } from 'react';
import { MessageCircle, Paperclip, Heart, Share2, Users, Search, Send, Image, FileText, Plus, UserRound } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { lt } from '@/lib/featureText';

const posts = [
  { id: 1, name: 'Анна Петрова', role: 'student', avatar: 'АП', specialty: 'CBT', time: '12 мин', text: 'Кто изучает КПТ и хочет обмениваться конспектами и практическими заданиями?', likes: 18, comments: 6 },
  { id: 2, name: 'Dr. Omar Hassan', role: 'specialist', avatar: 'OH', specialty: 'Neuropsychology', time: '1 ч', text: 'Поделился новой схемой оценки исполнительных функций для учебного обсуждения.', likes: 42, comments: 11 },
];

export default function CommunityPage() {
  const { lang } = useI18n();
  const { navigate } = useRouter();
  const [composer, setComposer] = useState('');

  const title = lt(lang, { ar: 'المجتمع العلمي', ru: 'Научное сообщество', en: 'Academic Community', de: 'Akademische Community' });
  const subtitle = lt(lang, { ar: 'تبادل الخبرات والملفات والنقاشات بين الطلاب والأخصائيين', ru: 'Обмен опытом, файлами и обсуждениями между студентами и специалистами', en: 'Exchange experience, files and discussions between students and specialists', de: 'Erfahrung, Dateien und Diskussionen zwischen Studierenden und Spezialisten teilen' });
  const publish = lt(lang, { ar: 'نشر', ru: 'Опубликовать', en: 'Publish', de: 'Veröffentlichen' });
  const rooms = lt(lang, { ar: 'غرف الأقسام', ru: 'Чаты направлений', en: 'Department Rooms', de: 'Fach-Chats' });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
                <Users className="w-4 h-4" />
                {title}
              </span>
              <h1 className="mt-4 text-3xl md:text-4xl font-extrabold">{title}</h1>
              <p className="mt-2 max-w-2xl text-teal-50">{subtitle}</p>
            </div>
            <button onClick={() => navigate('/chat')} className="rounded-xl bg-white px-5 py-3 font-bold text-teal-700 hover:bg-teal-50">
              <MessageCircle className="inline w-4 h-4 ml-2" />{rooms}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <main className="space-y-5">
            <div className="card p-5">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">SB</div>
                <div className="flex-1">
                  <textarea value={composer} onChange={(e) => setComposer(e.target.value)} placeholder={lt(lang, { ar: 'شارك خبرة أو سؤالًا أو ملفًا مع المجتمع...', ru: 'Поделитесь опытом, вопросом или файлом...', en: 'Share an experience, question or file...', de: 'Teile eine Erfahrung, Frage oder Datei...' })} className="w-full resize-none rounded-2xl border border-gray-200 p-4 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50" rows={3} />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"><Paperclip className="inline w-4 h-4 ml-1" />{lt(lang,{ar:'ملف',ru:'Файл',en:'File',de:'Datei'})}</button>
                      <button className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"><Image className="inline w-4 h-4 ml-1" />{lt(lang,{ar:'صورة',ru:'Фото',en:'Photo',de:'Foto'})}</button>
                    </div>
                    <button onClick={() => setComposer('')} disabled={!composer.trim()} className="rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white disabled:opacity-40 hover:bg-teal-700"><Send className="inline w-4 h-4 ml-1" />{publish}</button>
                  </div>
                </div>
              </div>
            </div>

            {posts.map((post) => (
              <article key={post.id} className="card p-5">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center font-bold text-teal-700">{post.avatar}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => navigate('/profile')} className="font-bold text-gray-800 hover:text-teal-700">{post.name}</button>
                      <span className="rounded-full bg-teal-50 px-2 py-1 text-[11px] text-teal-700">{post.role === 'student' ? lt(lang,{ar:'طالب',ru:'Студент',en:'Student',de:'Student'}) : lt(lang,{ar:'أخصائي',ru:'Специалист',en:'Specialist',de:'Spezialist'})}</span>
                      <span className="text-xs text-gray-400">{post.specialty} · {post.time}</span>
                    </div>
                    <p className="mt-3 text-gray-700 leading-relaxed">{post.text}</p>
                    <div className="mt-4 flex items-center gap-5 border-t pt-3 text-sm text-gray-500">
                      <button className="hover:text-rose-600"><Heart className="inline w-4 h-4 ml-1" />{post.likes}</button>
                      <button className="hover:text-teal-600"><MessageCircle className="inline w-4 h-4 ml-1" />{post.comments}</button>
                      <button className="hover:text-teal-600"><Share2 className="inline w-4 h-4 ml-1" />{lt(lang,{ar:'مشاركة',ru:'Поделиться',en:'Share',de:'Teilen'})}</button>
                      <button className="mr-auto rounded-lg bg-gray-50 px-3 py-1.5 hover:bg-gray-100"><FileText className="inline w-4 h-4 ml-1" />PDF</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </main>

          <aside className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-gray-800">{rooms}</h2><Plus className="w-5 h-5 text-teal-600" /></div>
              <div className="space-y-2">
                {['ABA / АВА', 'Нейропсихология', 'КПТ / CBT', 'Семейная психология', 'Арт-терапия', 'Аутизм'].map((room) => <button key={room} onClick={() => navigate('/chat')} className="w-full rounded-xl bg-gray-50 px-3 py-3 text-left text-sm text-gray-700 hover:bg-teal-50">{room}<span className="float-right text-xs text-gray-400">›</span></button>)}
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3"><UserRound className="w-5 h-5 text-teal-600" /><h2 className="font-bold text-gray-800">{lt(lang,{ar:'أدوات المجتمع',ru:'Инструменты сообщества',en:'Community Tools',de:'Community-Tools'})}</h2></div>
              <div className="mt-4 space-y-2">
                <button onClick={() => navigate('/library')} className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50">{lt(lang,{ar:'مشاركة كتاب/مرجع',ru:'Поделиться книгой',en:'Share a book/reference',de:'Buch/Quelle teilen'})}</button>
                <button onClick={() => navigate('/tests')} className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50">{lt(lang,{ar:'إنشاء اختبار تدريبي',ru:'Создать тренировочный тест',en:'Create practice test',de:'Übungstest erstellen'})}</button>
                <button onClick={() => navigate('/academy')} className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50">{lt(lang,{ar:'استكشف الأكاديمية',ru:'Открыть академию',en:'Open academy',de:'Akademie öffnen'})}</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
