import checkout from '../src/server/create-checkout.js';
import wallet from '../src/server/wallet-checkout.js';
export default async function handler(req:any,res:any){
 const route=String(req.query?.route||'create');
 if(route==='wallet')return wallet(req,res);
 if(route==='confirm'){req.query={...(req.query||{}),action:'confirm'};return wallet(req,res);}
 return checkout(req,res);
}