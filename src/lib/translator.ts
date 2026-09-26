const corrections: Array<[RegExp,string]> = [
  [/\bteh\b/gi,'the'],[/\brecieve\b/gi,'receive'],[/\bseperate\b/gi,'separate'],[/\bdefinately\b/gi,'definitely'],[/\boccured\b/gi,'occurred'],[/\badress\b/gi,'address'],
  [/\bthier\b/gi,'their'],[/\bwich\b/gi,'which'],[/\bbecouse\b/gi,'because'],[/\bmedecine\b/gi,'medicine']
];
export function correctText(text:string,lang:string){let out=text.trim().replace(/[ \t]+/g,' ');if(lang==='en') for(const [re,v] of corrections) out=out.replace(re,v);return out;}
export async function translateText(text:string,from:string,to:string){const clean=correctText(text,from);if(!clean||from===to)return clean;try{const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(clean)+'&langpair='+encodeURIComponent(from+'|'+to);const r=await fetch(url);const j=await r.json();return j?.responseData?.translatedText||clean;}catch{return clean;}}
