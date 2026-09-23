import { BookOpen, Camera, FileText, GraduationCap, Heart, MessageCircle, UserRound, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { lt } from '@/lib/featureText';

export default function ProfilePage() {
  const { lang } = useI18n();
  const { navigate } = useRouter();
  const role = 'student';
  const title = lt(lang,{ar:'الملف الشخصي',ru:'Профиль',en:'Profile',de:'Profil'});
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600" />
          <div className="px-6 pb-7">
            <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-teal-100 text-2xl font-extrabold text-teal-700 shadow-lg">GA</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-gray-800">{role === 'student' ? lt(lang,{ar:'طالب SB1',ru:'Студент SB1',en:'SB1 Student',de:'SB1 Student'}) : 'Specialist'}</h1><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{role === 'student' ? lt(lang,{ar:'طالب',ru:'Студент',en:'Student',de:'Student'}) : lt(lang,{ar:'أخصائي',ru:'Специалист',en:'Specialist',de:'Spezialist'})}</span></div>
                <p className="mt-1 text-sm text-gray-500">{lt(lang,{ar:'مهتم بالعلاج النفسي والعلوم السلوكية',ru:'Интересуется психотерапией и поведенческими науками',en:'Interested in psychotherapy and behavioral sciences',de:'Interesse an Psychotherapie und Verhaltenswissenschaften'})}</p>
              </div>
              <div className="flex gap-2"><button className="btn-secondary"><Camera className="w-4 h-4" /></button><button onClick={() => navigate('/community')} className="btn-primary"><Users className="w-4 h-4" />{lt(lang,{ar:'المجتمع',ru:'Сообщество',en:'Community',de:'Community'})}</button></div>
            </div>

            <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['42',lt(lang,{ar:'منشور',ru:'Публикации',en:'Posts',de:'Beiträge'})],['8',lt(lang,{ar:'دورات',ru:'Курсы',en:'Courses',de:'Kurse'})],['126',lt(lang,{ar:'متابع',ru:'Подписчики',en:'Followers',de:'Follower'})],['14',lt(lang,{ar:'مفضلة',ru:'Сохранено',en:'Saved',de:'Gespeichert'})]].map(([n,l]) => <div key={l} className="rounded-2xl bg-gray-50 p-4 text-center"><div className="text-2xl font-extrabold text-teal-700">{n}</div><div className="text-xs text-gray-500 mt-1">{l}</div></div>)}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border p-5"><GraduationCap className="w-6 h-6 text-teal-600" /><h3 className="mt-3 font-bold">{lt(lang,{ar:'التعلّم',ru:'Обучение',en:'Learning',de:'Lernen'})}</h3><p className="mt-1 text-sm text-gray-500">{lt(lang,{ar:'خطتي الدراسية والدورات الحالية',ru:'Учебный план и текущие курсы',en:'Study plan and current courses',de:'Studienplan und aktuelle Kurse'})}</p><button onClick={() => navigate('/academy')} className="mt-4 text-sm font-semibold text-teal-700">{lt(lang,{ar:'فتح الأكاديمية',ru:'Открыть академию',en:'Open academy',de:'Akademie öffnen'})} →</button></div>
              <div className="rounded-2xl border p-5"><BookOpen className="w-6 h-6 text-teal-600" /><h3 className="mt-3 font-bold">{lt(lang,{ar:'مكتبتي',ru:'Моя библиотека',en:'My library',de:'Meine Bibliothek'})}</h3><p className="mt-1 text-sm text-gray-500">{lt(lang,{ar:'الكتب والملفات المحفوظة',ru:'Сохранённые книги и файлы',en:'Saved books and files',de:'Gespeicherte Bücher und Dateien'})}</p><button onClick={() => navigate('/library')} className="mt-4 text-sm font-semibold text-teal-700">{lt(lang,{ar:'فتح المكتبة',ru:'Открыть библиотеку',en:'Open library',de:'Bibliothek öffnen'})} →</button></div>
              <div className="rounded-2xl border p-5"><MessageCircle className="w-6 h-6 text-teal-600" /><h3 className="mt-3 font-bold">{lt(lang,{ar:'مجتمعي',ru:'Моё сообщество',en:'My community',de:'Meine Community'})}</h3><p className="mt-1 text-sm text-gray-500">{lt(lang,{ar:'المجموعات والمحادثات والمشاركات',ru:'Группы, чаты и публикации',en:'Groups, chats and posts',de:'Gruppen, Chats und Beiträge'})}</p><button onClick={() => navigate('/community')} className="mt-4 text-sm font-semibold text-teal-700">{lt(lang,{ar:'فتح المجتمع',ru:'Открыть сообщество',en:'Open community',de:'Community öffnen'})} →</button></div>
            </div>

            <div className="mt-8 border-t pt-6 flex flex-wrap gap-3 text-sm text-gray-500"><span><Heart className="inline w-4 h-4 ml-1 text-rose-500" />{lt(lang,{ar:'34 إعجابًا هذا الشهر',ru:'34 отметки «Нравится» в этом месяце',en:'34 likes this month',de:'34 Likes diesen Monat'})}</span><span><FileText className="inline w-4 h-4 ml-1 text-teal-500" />{lt(lang,{ar:'6 ملفات مشتركة',ru:'6 общих файлов',en:'6 shared files',de:'6 geteilte Dateien'})}</span><span><UserRound className="inline w-4 h-4 ml-1" />{lt(lang,{ar:'حساب موثق',ru:'Подтверждённый профиль',en:'Verified profile',de:'Verifiziertes Profil'})}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
