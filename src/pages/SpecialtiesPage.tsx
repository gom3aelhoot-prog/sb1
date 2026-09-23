import { useMemo, useState } from 'react';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { specialtyCatalog } from '@/lib/catalog';

export default function SpecialtiesPage() {
  const { lang, dir } = useI18n();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const specialties = specialtyCatalog(lang);
  const filtered = useMemo(() => specialties.filter(s => s.name.toLowerCase().includes(search.toLowerCase())), [specialties, search]);
  return <div className="min-h-screen bg-gray-50 pt-24 pb-16" dir={dir}>
    <div className="mx-auto max-w-4xl px-4">
      <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-8 text-white shadow-lg text-center">
        <h1 className="text-3xl font-extrabold">التخصصات الطبية</h1>
        <p className="mt-2 text-teal-50">اختر تخصصاً واحداً لفتح الأخصائيين والأسئلة والأجوبة والمحتوى المرتبط به.</p>
        <button onClick={() => setOpen(v=>!v)} className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 text-base font-bold text-teal-700 shadow-xl">
          اختار التخصص <ChevronDown className={open?'rotate-180':''}/>
        </button>
      </div>
      {open && <div className="mt-5 rounded-2xl bg-white border border-gray-100 shadow-xl p-5">
        <div className="relative mb-4"><Search className="absolute start-3 top-3.5 h-5 w-5 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن التخصص..." className="w-full rounded-xl border border-gray-200 py-3 ps-10 pe-4 outline-none focus:border-teal-500"/></div>
        <div className="max-h-[55vh] overflow-y-auto grid gap-2 sm:grid-cols-2">
          {filtered.map(s=><button key={s.slug} onClick={()=>navigate('/specialties/'+s.slug)} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-start hover:border-teal-300 hover:bg-teal-50">
            <span className="font-semibold text-gray-800">{s.name}</span><ArrowRight className="h-4 w-4 text-teal-600"/>
          </button>)}
        </div>
      </div>}
      {!open && <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm"><b className="text-2xl text-teal-600">{specialties.length}</b><p className="text-sm text-gray-500">تخصص متاح</p></div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm"><b className="text-2xl text-teal-600">5–25</b><p className="text-sm text-gray-500">أخصائي لكل تخصص ولغة</p></div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm"><b className="text-2xl text-teal-600">50</b><p className="text-sm text-gray-500">سؤال تجريبي لكل تخصص</p></div>
      </div>}
    </div>
  </div>;
}