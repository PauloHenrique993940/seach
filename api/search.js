import {makeQuery,normalize} from '../lib/search.js';
const cache=new Map(); const pending=new Map(); let lastRequest=0;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Método não permitido.'});
 const {city,segment='all'}=req.query;
 let query; try{query=makeQuery(city,segment);}catch(e){return res.status(400).json({error:e.message});}
 const key=city+':'+segment, saved=cache.get(key);
 if(saved && saved.expires>Date.now())return res.status(200).json(saved.data);
 if(!pending.has(key) && Date.now()-lastRequest<3000){res.setHeader('Retry-After','3');return res.status(429).json({error:'Aguarde alguns segundos antes de iniciar outra busca.'});}
 try{
  if(!pending.has(key)){
   lastRequest=Date.now();
   const job=(async()=>{
    const response=await fetch(process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'RadarEmpresas/1.0'},body:new URLSearchParams({data:query}),signal:AbortSignal.timeout(45000)});
    if(!response.ok)throw new Error('A fonte de dados está ocupada. Tente novamente em alguns minutos.');
    const payload=await response.json();
    if(payload.remark)throw new Error('A consulta não foi concluída pela fonte de dados. Tente um segmento mais específico.');
    if(!Array.isArray(payload.elements))throw new Error('A fonte de dados retornou uma resposta inválida.');
    const data={companies:normalize(payload.elements),source:'OpenStreetMap',fetchedAt:new Date().toISOString(),limited:payload.elements.length>=500,notice:'Sem site cadastrado no OpenStreetMap. Confirme a presença digital antes de entrar em contato.'};
    if(cache.size>=60)cache.delete(cache.keys().next().value);
    cache.set(key,{data,expires:Date.now()+15*60*1000});return data;
   })();pending.set(key,job);
  }
  return res.status(200).json(await pending.get(key));
 }catch(e){return res.status(503).json({error:e.name==='TimeoutError'?'A busca demorou mais que o esperado. Tente novamente em alguns minutos.':e.message});}
 finally{pending.delete(key);}
}
