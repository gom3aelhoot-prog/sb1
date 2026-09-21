import { Mail, Phone, MapPin, Globe2 } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { lt } from '@/lib/featureText';

export default function Footer(){
 const {navigate}=useRouter(); const {t,lang}=useI18n();
 const links=[
   {label:t('nav.home'),path:'/'},{label:t('nav.doctors'),path:'/doctors'},{label:t('nav.questions'),path:'/questions'},
   {label:t('nav.articles'),path:'/articles'},{label:lt(lang,{ar:'المجتمع',ru:'Сообщество',en:'Community',de:'Community'}),path:'/community'},
   {label:lt(lang,{ar:'أكاديمية SB1',ru:'Академия SB1',en:'SB1 Academy',de:'SB1 Akademie'}),path:'/academy'},
   {label:t('nav.library'),path:'/library'},{label:t('nav.chat'),path:'/chat'},
 ];
 return <footer className="bg-gray-950 text-gray-300 mt-20"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div className="grid grid-cols-1 md:grid-cols-4 gap-8"><div className="md:col-span-2"><div className="flex items-center gap-3 mb-4"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg"><Globe2 className="w-6 h-6 text-white"/></div><div><div className="text-xl font-extrabold text-white">SB1</div><div className="text-xs text-teal-400">Smart Bridge One</div></div></div><p className="text-gray-400 leading-relaxed max-w-md">{lt(lang,{ar:'منصة تعليمية ومجتمعية تجمع التعلم المهني والمناقشات والمكتبة والاختبارات والمساعدين الأذكياء.',ru:'Образовательная и профессиональная платформа с курсами, сообществом, библиотекой, тестами и умными помощниками.',en:'A professional learning and community platform with courses, discussions, library, exams and smart assistants.',de:'Eine Lern- und Community-Plattform mit Kursen, Diskussionen, Bibliothek, Prüfungen und Smart-Assistenten.'})}</p></div><div><h3 className="text-white font-bold mb-4">{lt(lang,{ar:'روابط سريعة',ru:'Быстрые ссылки',en:'Quick Links',de:'Schnelllinks'})}</h3><ul className="space-y-2">{links.map(l=><li key={l.path}><button onClick={()=>navigate(l.path)} className="text-gray-400 hover:text-teal-400 text-sm">{l.label}</button></li>)}</ul></div><div><h3 className="text-white font-bold mb-4">{lt(lang,{ar:'تواصل معنا',ru:'Контакты',en:'Contact',de:'Kontakt'})}</h3><ul className="space-y-3 text-sm"><li className="flex items-center gap-2"><Mail className="w-4 h-4 text-teal-400"/><span>gamytvgamytv@gmail.com</span></li><li className="flex items-center gap-2"><Phone className="w-4 h-4 text-teal-400"/><span>+963 11 123 4567</span></li><li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-400"/><span>{lt(lang,{ar:'سوريا',ru:'Сирия',en:'Syria',de:'Syrien'})}</span></li></ul></div></div><div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">© 2026 SB1. {lt(lang,{ar:'جميع الحقوق محفوظة.',ru:'Все права защищены.',en:'All rights reserved.',de:'Alle Rechte vorbehalten.'})}</div></div></footer>;
}
