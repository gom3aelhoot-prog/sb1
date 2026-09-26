self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={title:'SB1',body:'لديك إشعار جديد',url:'/'};
  try{data={...data,...(event.data?event.data.json():{})}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/favicon.ico',badge:'/favicon.ico',data:{url:data.url||'/'}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=event.notification.data?.url||'/';event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{for(const c of clients){if('focus' in c){c.navigate(url);return c.focus()}}if(self.clients.openWindow)return self.clients.openWindow(url)}));});
