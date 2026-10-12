let cached;
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Método não permitido.'});
 try{
  if(!cached){const r=await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const data=await r.json();cached=data.map(c=>({id:String(c.id),name:c.nome,state:c.microrregiao?.mesorregiao?.UF?.sigla || c['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla || ''}));}
  res.setHeader('Cache-Control','public, s-maxage=86400');return res.status(200).json(cached);
 }catch{return res.status(503).json({error:'Não foi possível carregar as cidades. As capitais continuam disponíveis.'});}
}
