export type ManagedRole='owner'|'specialist'|'institution'|'client'|'service'|'delivery_worker';
export type PermissionKey='dashboard'|'prices'|'sessions'|'delete_specialist_videos'|'close_accounts'|'manage_content'|'manage_courses'|'manage_videos'|'manage_services'|'view_private_content'|'view_sessions'|'manage_users';
export type ManagedPage={id:string;parentId?:string;role:ManagedRole;name:string;username:string;avatar?:string;language:string;country:string;isClone:boolean;linked:boolean;expiresAt?:string;status:'active'|'expired'|'revoked';permissions:Record<PermissionKey,boolean>};
const KEY='sb1_managed_pages_v3';
const permissions=(o:Partial<Record<PermissionKey,boolean>>={}):Record<PermissionKey,boolean>=>({dashboard:false,prices:false,sessions:false,delete_specialist_videos:false,close_accounts:false,manage_content:false,manage_courses:false,manage_videos:false,manage_services:false,view_private_content:false,view_sessions:false,manage_users:false,...o});
export const defaultManagedPages=():ManagedPage[]=>[
{id:'owner',role:'owner',name:'مالك SB1',username:'owner',language:'ar',country:'',isClone:false,linked:false,status:'active',permissions:permissions({dashboard:true,prices:true,sessions:true,delete_specialist_videos:true,close_accounts:true,manage_content:true,manage_courses:true,manage_videos:true,manage_services:true,view_private_content:true,view_sessions:true,manage_users:true})},
{id:'doctor-james',role:'specialist',name:'دكتور جمال نادي',username:'dr-james',language:'ar',country:'',isClone:false,linked:false,status:'active',permissions:permissions({manage_content:true,manage_courses:true,manage_videos:true,manage_services:true,view_sessions:true})},
{id:'gnl',role:'institution',name:'مؤسسة GNL',username:'gnl',language:'ar',country:'',isClone:false,linked:false,status:'active',permissions:permissions({manage_content:true,manage_services:true,view_sessions:true})},
{id:'jimmy',role:'client',name:'جيمي جيمي',username:'jimmy',language:'ar',country:'',isClone:false,linked:false,status:'active',permissions:permissions({view_sessions:true})},
{id:'gnls',role:'service',name:'GNLS',username:'gnls',language:'ar',country:'',isClone:false,linked:false,status:'active',permissions:permissions({manage_services:true})},
{id:'jamico',role:'delivery_worker',name:'جميكو',username:'jamico',language:'ar',country:'',isClone:false,linked:false,status:'active',permissions:permissions({})},
];
export function loadManagedPages(){if(typeof window==='undefined')return defaultManagedPages();try{const x=JSON.parse(localStorage.getItem(KEY)||'');if(Array.isArray(x)&&x.length)return x}catch{}const d=defaultManagedPages();localStorage.setItem(KEY,JSON.stringify(d));return d}
export function saveManagedPages(p:ManagedPage[]){localStorage.setItem(KEY,JSON.stringify(p));window.dispatchEvent(new Event('sb1-managed-pages'))}
export function cloneManagedPage(parent:ManagedPage,name:string):ManagedPage{const id='page-'+Date.now().toString(36);return {...parent,id,parentId:parent.id,name,username:name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+id.slice(-4),isClone:true,linked:true,avatar:undefined,permissions:{...parent.permissions},expiresAt:undefined,status:'active'}}
export const roleLabel=(r:ManagedRole)=>({owner:'المالك',specialist:'أخصائي',institution:'مؤسسة',client:'مستخدم',service:'خدمات أخرى',delivery_worker:'عامل توصيل'}[r]);
