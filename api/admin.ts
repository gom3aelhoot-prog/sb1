import moderate from '../src/server/moderate-content.js';
import owner from '../src/server/owner-provision-account.js';
import affiliate from '../src/server/affiliate-record-sale.js';
import pinterest from '../src/server/pinterest-callback.js';

export default async function handler(req:any,res:any){
 const route=String(req.query?.route||'');
 if(route==='moderate')return moderate(req,res);
 if(route==='owner')return owner(req,res);
 if(route==='affiliate')return affiliate(req,res);
 if(route==='pinterest')return pinterest(req,res);
 return res.status(404).json({error:'Admin API route not found'});
}