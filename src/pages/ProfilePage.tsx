import { useState } from 'react';
import { BookOpen, Camera, FileText, GraduationCap, Heart, MessageCircle, UserRound, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { lt } from '@/lib/featureText';
import { getSaved } from '@/lib/socialVault';
import { getRole, roleLabel } from '@/lib/access';

export default function ProfilePage() {
  const { lang } = useI18n();
  const { navigate } = useRouter();
  const role = getRole()==='guest' ? 'client' : getRole();
  const [photo,setPhoto]=useState(()=>localStorage.getItem('sb1_generic_profile_photo')||'');
  const [cover,setCover]=useState(()=>localStorage.getItem('sb1_generic_profile_cover')||'');
  const savedImages=getSaved().filter(x=>x.kind==='image'&&x.url).map(x=>x.url as string);
  const pick=(kind:'photo'|'cover',file?:File)=>{if(!file)return;const u=URL.createObjectURL(file);if(kind==='photo'){setPhoto(u);localStorage.setItem('sb1_generic_profile_photo',u)}else{setCover(u);localStorage.setItem('sb1_generic_profile_cover',u)}};
  const title = lt(lang,{ar:'صفحتي',ru:'Моя страница',en:'My Page',de:'Meine Seite'});
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card overflow-hidden">
          <div className="relative h-40 overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600">{cover&&<img src={cover} alt="" className="h-full w-full object-cover"/>}<label className="absolute bottom-3 left-3 cursor-pointer rounded-lg bg-black/60 px-3 py-2 text-xs font-bold text-white">تغيير الغلاف<input type="file" accept="image/*" className="hidden" onChange={e=>pick('cover',e.target.files?.[0])}/></label>{savedImages[0]&&<button onClick={()=>{setCover(savedImages[0]);localStorage.setItem('sb1_generic_profile_cover',savedImages[0])}} className="absolute bottom-3 left-28 rounded-lg bg-black/60 px-3 py-2 text-xs font-bold text-white">من المفضلة</button>}</div>
          <div className="px-6 pb-7">
            <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-teal-100 text-2xl font-extrabold text-teal-700 shadow-lg">{photo?<img src={photo} alt="" className="h-full w-full object-cover"/>:'GA'}<label className="absolute inset-x-1 bottom-1 cursor-pointer rounded-lg bg-black/55 px-1 py-1 text-center text-[9px] font-bold text-white">تغيير<input type="file" accept="image/*" className="hidden" onChange={e=>pick('photo',e.target.files?.[0])}/></label></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-gray-800">{role === 'client' ? lt(lang,{ar:'عميل SB1',ru:'Клиент SB1',en:'SB1 Client',de:'SB1 Client'}) : roleLabel(role,lang)}</h1><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{roleLabel(role,lang)}</span></div>
                <p className="mt-1 text-sm text-gray-500">{lt(lang,{ar:'ملفي الشخصي ومتابعاتي ومحتواي المحفوظ',ru:'Профиль, подписки и сохранённый контент',en:'My profile, follows and saved content',de:'Profil, Abonnements und gespeicherte Inhalte'})}</p>
              </div>
              <div className="flex gap-2"><button className="btn-secondary"><Camera className="w-4 h-4" /></button><button onClick={() => navigate('/community')} className="btn-primary"><Users className="w-4 h-4" />{lt(lang,{ar:'المجتمع',ru:'Сообщество',en:'Community',de:'Community'})}</button></div>
            </div>

            <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['42',lt(lang,{ar:'منشور',ru:'Публикации',en:'Posts',de:'Beiträge'})],['8',lt(lang,{ar:'دورات',ru:'Курсы',en:'Courses',de:'Kurse'})],['126',lt(lang,{ar:'متابع',ru:'Подписчики',en:'Followers',de:'Follower'})],['14',lt(lang,{ar:'مفضلة',ru:'Сохранено',en:'Saved',de:'Gespeichert'})]].map(([n,l]) => <div key={l} className="rounded-2xl bg-gray-50 p-4 text-center"><div className="text-2xl font-extrabold text-teal-700">{n}</div><div className="text-xs text-gray-500 mt-1">{l}</div></div>)}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border p-5"><GraduationCap className="w-6 h-6 text-teal-600" /><h3 className="mt-3 font-bold">{lt(lang,{ar:'لوحتي',ru:'Моя страница',en:'My Dashboard',de:'Meine Seite'})}</h3><p className="mt-1 text-sm text-gray-500">{lt(lang,{ar:'المحفوظات والإعجابات والمتابعات',ru:'Сохранённое, лайки и подписки',en:'Saved items, likes and follows',de:'Gespeicherte Inhalte, Likes und Abonnements'})}</p><button onClick={() => navigate('/client/dashboard')} className="mt-4 text-sm font-semibold text-teal-700">{lt(lang,{ar:'فتح لوحة العميل',ru:'Открыть панель клиента',en:'Open client dashboard',de:'Kundenbereich öffnen'})} →</button></div>
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
