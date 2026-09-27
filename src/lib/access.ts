export type SB1Role='guest'|'client'|'specialist'|'institution'|'delivery_worker'|'property_owner'|'moderator'|'owner';
export function getRole():SB1Role{
 if(typeof window==='undefined') return 'guest';
 const actual=(localStorage.getItem('sb1_account_role')||'guest') as SB1Role;
 const preview=localStorage.getItem('sb1_preview_role');
 if(actual==='owner'&&preview) return preview as SB1Role;
 return actual;
}
export function setPreviewRole(role:SB1Role|null){if(role)localStorage.setItem('sb1_preview_role',role);else localStorage.removeItem('sb1_preview_role');window.dispatchEvent(new Event('sb1-role-change'))}
export function can(role:SB1Role, allowed:SB1Role[]){return role==='owner'||allowed.includes(role)}
export function roleLabel(role:SB1Role,lang='ar'){
 const m:any={guest:{ar:'زائر',en:'Guest'},client:{ar:'عميل',en:'Client'},specialist:{ar:'أخصائي',en:'Specialist'},institution:{ar:'مؤسسة',en:'Institution'},delivery_worker:{ar:'عامل توصيل',en:'Delivery worker'},property_owner:{ar:'صاحب منشأة',en:'Property owner'},moderator:{ar:'مشرف',en:'Moderator'},owner:{ar:'مالك',en:'Owner'}};
 return m[role]?.[lang]||m[role]?.en||role;
}
export const PRIVATE_ROUTES:{prefix:string;roles:SB1Role[]}[]=[
 {prefix:'/dashboard',roles:['client']},{prefix:'/client/dashboard',roles:['client']},{prefix:'/institution/dashboard',roles:['institution']},{prefix:'/delivery/dashboard',roles:['delivery_worker']},{prefix:'/property',roles:['property_owner']},{prefix:'/specialist/studio',roles:['specialist']},{prefix:'/specialist/packages',roles:['specialist']},{prefix:'/specialist-sessions',roles:['specialist']},{prefix:'/specialist-appointments',roles:['specialist']},{prefix:'/specialist/content',roles:['specialist']},{prefix:'/specialist/dashboard',roles:['specialist']},
 {prefix:'/delivery',roles:['delivery_worker','institution']},{prefix:'/facility-registration',roles:['institution']},{prefix:'/property',roles:['property_owner']},
 {prefix:'/admin',roles:['moderator','owner']},{prefix:'/admin-dashboard',roles:['moderator','owner']},{prefix:'/owner',roles:['owner']},{prefix:'/admin/',roles:['moderator','owner']},
];
export function routeAllowed(path:string,role:SB1Role){const x=PRIVATE_ROUTES.find(r=>path===r.prefix||path.startsWith(r.prefix+'/'));return !x||can(role,x.roles)}
