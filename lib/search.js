export const segments = {all:['shop','office','craft','amenity~"^(restaurant|cafe|bar|fast_food|dentist|clinic|pharmacy|veterinary|bank)$"'],restaurant:['amenity~"^(restaurant|cafe|bar|fast_food)$"'],beauty:['shop~"^(hairdresser|beauty)$"'],store:['shop'],health:['amenity~"^(dentist|clinic|pharmacy|veterinary)$"'],services:['craft','office']};
export function makeQuery(city, segment) {
  if (!/^\d{7}$/.test(city) || !segments[segment]) throw new Error('Selecione uma cidade e um segmento válidos.');
  const selectors = segments[segment].map(tag => `nwr(area.city)[${tag}][name][!website][!"contact:website"][!url][!"contact:url"];`).join('');
  return `[out:json][timeout:35][maxsize:33554432];(area["ref:IBGE"="${city}"]["boundary"="administrative"];area["IBGE:GEOCODIGO"="${city}"]["boundary"="administrative"];)->.city;(${selectors});out center tags 500;`;
}
export function normalize(elements) {
 const seen = new Set();
 return elements.filter(e => e.tags?.name && !['website','contact:website','url','contact:url'].some(k => e.tags[k]?.trim()) && e.tags['disused'] !== 'yes').map(e => {
  const t=e.tags, point=e.center || e;
  const phone=t['contact:phone'] || t.phone || t['contact:mobile'] || t.mobile || '';
  const email=t['contact:email'] || t.email || '';
  const address=[t['addr:street'],t['addr:housenumber'],t['addr:suburb'],t['addr:city']].filter(Boolean).join(', ');
  const digits=phone.split(';')[0].replace(/\D/g,'');
  const tel= /^(\+?[\d ()-]{8,25})$/.test(phone.split(';')[0].trim()) ? phone.split(';')[0].trim().replace(/[ ()-]/g,'') : '';
  return {id:`${e.type}/${e.id}`,name:t.name,category:t.shop || t.amenity || t.craft || t.office || 'empresa',phone,email,address,phoneLink:tel ? `tel:${tel}` : '',whatsapp: /^55\d{2}9\d{8}$/.test(digits) ? `https://wa.me/${digits}` : /^\d{2}9\d{8}$/.test(digits) ? `https://wa.me/55${digits}` : '',map:`https://www.openstreetmap.org/${e.type}/${e.id}`,lat:point.lat,lon:point.lon};
 }).filter(e=>{const key=e.name.toLocaleLowerCase('pt-BR')+'|'+(e.phone||e.address||e.id);if(seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=> Number(!!b.phone)-Number(!!a.phone)||a.name.localeCompare(b.name,'pt-BR'));
}
