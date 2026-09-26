export type SessionOption={durationMinutes:number;price:number;enabled:boolean};
export type DoctorSessionConfig={doctorId:string;options:SessionOption[];updatedAt:string};
const KEY='sb1_doctor_session_configs';
const defaults:SessionOption[]=[{durationMinutes:30,price:25,enabled:true},{durationMinutes:45,price:35,enabled:true},{durationMinutes:60,price:45,enabled:true}];
export function getDefaultSessionOptions(){return defaults.map(x=>({...x}));}
export function getDoctorSessionConfig(doctorId:string):DoctorSessionConfig{try{const all=JSON.parse(localStorage.getItem(KEY)||'{}');const x=all[doctorId];if(x?.options)return x}catch{}return {doctorId,options:getDefaultSessionOptions(),updatedAt:new Date().toISOString()};}
export function saveDoctorSessionConfig(config:DoctorSessionConfig){const all=JSON.parse(localStorage.getItem(KEY)||'{}');all[config.doctorId]={...config,options:config.options.filter(x=>x.durationMinutes>=15&&x.durationMinutes<=180&&x.price>=0).slice(0,6)};localStorage.setItem(KEY,JSON.stringify(all));window.dispatchEvent(new Event('sb1-session-config-change'));return all[config.doctorId];}
export function getSessionOptions(doctorId:string){return getDoctorSessionConfig(doctorId).options.filter(x=>x.enabled).sort((a,b)=>a.durationMinutes-b.durationMinutes);}
export function sessionPrice(doctorId:string,duration:number){return getSessionOptions(doctorId).find(x=>x.durationMinutes===duration)?.price??0;}
export function formatDuration(minutes:number,lang='ar'){if(lang==='ar')return minutes%60===0?minutes/60+' ساعة':minutes+' دقيقة';return minutes%60===0?minutes/60+' hour'+(minutes>60?'s':''):minutes+' minutes';}
