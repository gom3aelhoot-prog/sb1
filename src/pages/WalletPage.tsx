import {useEffect,useState} from 'react';
import {Wallet,Plus,Gift,ArrowDownLeft,ArrowUpRight,ShieldCheck,ShoppingCart,Heart,RefreshCw} from 'lucide-react';
import {useI18n} from '@/lib/i18n';
import {useApp} from '@/i18n/AppContext';
import {useRouter,parseQuery} from '@/lib/router';
import {supabase} from '@/lib/supabase';
import {accountKey,ensureWallet} from '@/lib/commerce';

export default function WalletPage(){
 const {lang,dir}=useI18n();const {formatPrice}=useApp();const {path}=useRouter();const q=parseQuery(path);
 const [wallet,setWallet]=useState<any>(null);const [tx,setTx]=useState<any[]>([]);const [amount,setAmount]=useState('25');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [sessionKey,setSessionKey]=useState('');
 const key=accountKey();
 const load=async()=>{const {data:{session}}=await supabase.auth.getSession();if(session?.access_token)setSessionKey(session.access_token);if(session?.user?.id)localStorage.setItem('sb1_account_user_id',session.user.id);setWallet(await ensureWallet());const {data}=await supabase.from('sb1_wallet_transactions').select('*').eq('account_key',key).order('created_at',{ascending:false}).limit(30);setTx(data||[])};
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(q.topup==='success'&&q.session_id){setBusy(true);fetch('/api/wallet-confirm',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({session_id:q.session_id,session_key:sessionKey})}).then(r=>r.json()).then(x=>{if(x.ok)setMessage(lang==='ar'?'تم شحن المحفظة بنجاح.':'Wallet topped up successfully.');else setMessage(x.error||'Payment could not be verified.');return load()}).finally(()=>setBusy(false))}},[q.topup,q.session_id,sessionKey]);
 const topup=async()=>{const n=Number(amount);if(!n||n<=0)return;setBusy(true);try{const r=await fetch('/api/wallet-checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({amount:n,currency:(wallet?.currency_code||'USD').toLowerCase(),session_key:sessionKey})});const x=await r.json();if(!r.ok)throw new Error(x.error);location.href=x.url}catch(e){setMessage(e instanceof Error?e.message:'تعذر بدء الدفع')}finally{setBusy(false)}};
 return <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16"><div className="mx-auto max-w-6xl px-4">
 <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-800 to-cyan-700 p-7 md:p-10 text-white"><div className="flex flex-wrap items-center justify-between gap-6"><div><div className="flex items-center gap-3"><Wallet className="h-9 w-9"/><h1 className="text-3xl font-extrabold">{lang==='ar'?'محفظتي':lang==='ru'?'Мой кошелёк':lang==='de'?'Meine Wallet':'My Wallet'}</h1></div><p className="mt-2 text-white/75">رصيد واحد لخدمات SB1 والمشتريات والمكافآت.</p></div><div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur"><div className="text-sm text-white/70">الرصيد</div><div className="text-3xl font-black">{formatPrice(Number(wallet?.balance||0))}</div></div></div></div>
 {message&&<div className="mt-4 rounded-2xl border bg-green-50 p-4 text-green-800">{message}</div>}
 <div className="mt-6 grid gap-5 lg:grid-cols-3">
  <div className="rounded-2xl bg-white border p-6 lg:col-span-2"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">إضافة رصيد</h2><ShieldCheck className="text-teal-600"/></div><p className="mt-2 text-sm text-gray-500">يتم الدفع عبر بوابة الدفع، وبعد التحقق من العملية يضاف الرصيد للمحفظة.</p><div className="mt-5 flex flex-wrap gap-2">{[10,25,50,100].map(v=><button key={v} onClick={()=>setAmount(String(v))} className={'rounded-xl px-4 py-2 border font-bold '+(amount===String(v)?'bg-teal-600 text-white':'bg-white')}>{v} USD</button>)}</div><div className="mt-4 flex gap-2"><input type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} className="input-field max-w-xs"/><button disabled={busy} onClick={topup} className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white disabled:opacity-50"><Plus className="inline h-5 w-5 me-1"/>شحن المحفظة</button></div></div>
  <div className="rounded-2xl bg-white border p-6"><Gift className="h-8 w-8 text-amber-500"/><h2 className="mt-3 text-xl font-extrabold">المكافآت</h2><div className="mt-2 text-3xl font-black">{wallet?.rewards_points||0}</div><p className="text-sm text-gray-500">نقطة مرتبطة بنفس المحفظة.</p><a href="/referral" className="mt-4 inline-block font-bold text-teal-700">فتح نظام المكافآت</a></div>
 </div>
 <div className="mt-6 grid gap-5 lg:grid-cols-3">
  <a href="/cart" className="rounded-2xl bg-white border p-5 hover:shadow-md"><ShoppingCart className="text-teal-600"/><b className="mt-3 block">السلة</b><span className="text-sm text-gray-500">مشتريات الأدوية والأدوات والخدمات.</span></a>
  <a href="/favorites" className="rounded-2xl bg-white border p-5 hover:shadow-md"><Heart className="text-rose-500"/><b className="mt-3 block">المفضلة</b><span className="text-sm text-gray-500">حفظ المنتجات والخدمات والأطباء.</span></a>
  <a href="/delivery" className="rounded-2xl bg-white border p-5 hover:shadow-md"><RefreshCw className="text-indigo-500"/><b className="mt-3 block">الطلبات والتوصيل</b><span className="text-sm text-gray-500">متابعة حالة الطلبات.</span></a>
 </div>
 <section className="mt-6 rounded-2xl bg-white border p-6"><h2 className="text-xl font-extrabold">حركة المحفظة</h2><div className="mt-4 space-y-2">{tx.length?tx.map(x=><div key={x.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4"><div className="flex items-center gap-3">{Number(x.amount)>=0?<ArrowDownLeft className="text-green-600"/>:<ArrowUpRight className="text-red-600"/>}<div><b>{x.description||x.transaction_type}</b><div className="text-xs text-gray-500">{new Date(x.created_at).toLocaleString()}</div></div></div><strong>{Number(x.amount)>0?'+':''}{x.amount} {x.currency_code}</strong></div>):<p className="py-8 text-center text-gray-400">لا توجد حركات بعد.</p>}</div></section>
 </div></div>
}