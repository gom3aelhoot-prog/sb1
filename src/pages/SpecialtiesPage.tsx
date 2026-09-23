import { useMemo, useState } from 'react';
import { Brain, Search, HeartPulse, Puzzle, Palette, Music, Users, Activity } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { lt } from '@/lib/featureText';

const specialtyData=[
 {icon:Activity,ar:'تحليل السلوك التطبيقي ABA',ru:'Прикладной анализ поведения ABA',en:'Applied Behavior Analysis ABA',de:'Angewandte Verhaltensanalyse ABA'},
 {icon:Brain,ar:'علم النفس العصبي',ru:'Нейропсихология',en:'Neuropsychology',de:'Neuropsychologie'},
 {icon:HeartPulse,ar:'علم النفس السريري',ru:'Клиническая психология',en:'Clinical Psychology',de:'Klinische Psychologie'},
 {icon:Users,ar:'علم نفس الأسرة',ru:'Семейная психология',en:'Family Psychology',de:'Familienpsychologie'},
 {icon:Brain,ar:'التحليل النفسي',ru:'Психоанализ',en:'Psychoanalysis',de:'Psychoanalyse'},
 {icon:Puzzle,ar:'الجشتالت',ru:'Гештальт-терапия',en:'Gestalt Therapy',de:'Gestalttherapie'},
 {icon:HeartPulse,ar:'العلاج النفسي',ru:'Психотерапия',en:'Psychotherapy',de:'Psychotherapie'},
 {icon:Brain,ar:'العلاج السلوكي المعرفي CBT',ru:'КПТ',en:'CBT',de:'KVT'},
 {icon:Palette,ar:'العلاج بالفن',ru:'Арт-терапия',en:'Art Therapy',de:'Kunsttherapie'},
 {icon:Music,ar:'العلاج بالدراما',ru:'Драматерапия',en:'Drama Therapy',de:'Dramatherapie'},
 {icon:Users,ar:'الكوتشنج',ru:'Коучинг',en:'Coaching',de:'Coaching'},
 {icon:Puzzle,ar:'منهج شامل لعلاج التوحد',ru:'Комплексная программа аутизма',en:'Comprehensive Autism Program',de:'Komplexprogramm Autismus'},
 {icon:Activity,ar:'التكامل الحسي',ru:'Сенсорная интеграция',en:'Sensory Integration',de:'Sensorische Integration'},
 {icon:Brain,ar:'التنويم المغناطيسي',ru:'Гипнотерапия',en:'Hypnotherapy',de:'Hypnotherapie'},
 {icon:HeartPulse,ar:'العلاج الموجه للجسم',ru:'Телесно-ориентированная терапия',en:'Body-Oriented Therapy',de:'Körperorientierte Therapie'},
];
export default function SpecialtiesPage(){const{lang}=useI18n();const{navigate}=useRouter();const[q,setQ]=useState('');const list=useMemo(()=>specialtyData.filter(s=>lt(lang,s).toLowerCase().includes(q.toLowerCase())),[lang,q]);return <div className="min-h-screen pt-24 pb-16 bg-gray-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center"><h1 className="text-3xl font-extrabold text-gray-800">{lt(lang,{ar:'تخصصات SB1',ru:'Направления SB1',en:'SB1 Specialties',de:'SB1 Fachgebiete'})}</h1><p className="mt-2 text-gray-500">{lt(lang,{ar:'كتالوج التخصصات التي يمكن ربطها بالكورسات والمكتبات والاختبارات والغرف.',ru:'Каталог направлений для курсов, библиотек, тестов и чатов.',en:'A catalog for courses, libraries, exams and chats.',de:'Katalog für Kurse, Bibliotheken, Prüfungen und Chats.'})}</p></div><div className="mt-7 relative max-w-2xl mx-auto"><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/><input value={q} onChange={e=>setQ(e.target.value)} className="w-full rounded-2xl border bg-white py-4 pr-12 pl-4 outline-none focus:border-teal-400" placeholder={lt(lang,{ar:'ابحث عن تخصص...',ru:'Поиск направления...',en:'Search specialty...',de:'Fachgebiet suchen...'})}/></div><div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{list.map(s=><button key={s.en} onClick={()=>navigate('/courses')} className="card p-5 text-center hover:shadow-lg transition"><s.icon className="mx-auto w-8 h-8 text-teal-600"/><div className="mt-3 text-sm font-semibold text-gray-700">{lt(lang,s)}</div></button>)}</div></div></div>}
