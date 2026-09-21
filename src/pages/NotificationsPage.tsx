import { useI18n } from '@/lib/i18n';
import { Bell, CheckCircle2, MessageCircle, PlayCircle, Trophy } from 'lucide-react';
import { pt } from '@/lib/portalText';

export default function NotificationsPage(){
 const {lang}=useI18n();
 const items=[
  {icon:PlayCircle,title:pt(lang,{ar:'درس جديد متاح',ru:'Доступен новый урок',en:'New lesson available',de:'Neue Lektion verfügbar'}),desc:pt(lang,{ar:'تمت إضافة درس جديد إلى كورسك الحالي.',ru:'В ваш текущий курс добавлен новый урок.',en:'A new lesson was added to your current course.',de:'Eine neue Lektion wurde zu Ihrem Kurs hinzugefügt.'})},
  {icon:MessageCircle,title:pt(lang,{ar:'رسالة جديدة',ru:'Новое сообщение',en:'New message',de:'Neue Nachricht'}),desc:pt(lang,{ar:'لديك رسالة جديدة من أحد أعضاء المجتمع.',ru:'У вас новое сообщение от участника сообщества.',en:'You have a new community message.',de:'Sie haben eine neue Community-Nachricht.'})},
  {icon:Trophy,title:pt(lang,{ar:'إنجاز جديد',ru:'Новое достижение',en:'New achievement',de:'Neue Auszeichnung'}),desc:pt(lang,{ar:'لقد أكملت 10 دروس تعليمية.',ru:'Вы завершили 10 уроков.',en:'You completed 10 lessons.',de:'Sie haben 10 Lektionen abgeschlossen.'})},
  {icon:CheckCircle2,title:pt(lang,{ar:'تم اعتماد التسجيل',ru:'Регистрация подтверждена',en:'Registration confirmed',de:'Anmeldung bestätigt'}),desc:pt(lang,{ar:'تم تحديث حالة حسابك بنجاح.',ru:'Статус вашего аккаунта успешно обновлён.',en:'Your account status was updated successfully.',de:'Ihr Kontostatus wurde erfolgreich aktualisiert.'})},
 ];
 return <section className="min-h-screen bg-gray-50 py-12"><div className="mx-auto max-w-4xl px-4"><div className="mb-8 flex items-center gap-3"><div className="rounded-2xl bg-primary-50 p-3 text-primary-600"><Bell/></div><div><h1 className="text-3xl font-extrabold text-gray-900">{pt(lang,{ar:'الإشعارات',ru:'Уведомления',en:'Notifications',de:'Benachrichtigungen'})}</h1><p className="text-sm text-gray-500">{pt(lang,{ar:'آخر المستجدات المتعلقة بحسابك وتعلمك',ru:'Последние обновления по аккаунту и обучению',en:'Recent account and learning updates',de:'Neuigkeiten zu Konto und Lernen'})}</p></div></div><div className="space-y-3">{items.map(({icon:Icon,title,desc},i)=><div key={i} className="card flex gap-4 p-5"><div className="rounded-xl bg-gray-50 p-3 text-primary-600"><Icon className="h-5 w-5"/></div><div className="flex-1"><div className="font-bold text-gray-800">{title}</div><p className="mt-1 text-sm text-gray-500">{desc}</p></div><span className="h-2.5 w-2.5 rounded-full bg-primary-500"/></div>)}</div></div></section>
}
