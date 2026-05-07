// ============================================================
// MOTOR DE BÚSQUEDA 100% GRATUITO - Sin APIs, sin registro
// Wikipedia + DuckDuckGo + Scraping directo
// ============================================================

// Wikipedia (gratis, sin límites)
async function searchWikipedia(query) {
  try {
    const res = await fetch(
      `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    const data = await res.json();
    if (!data.query?.search?.length) return null;
    
    const title = data.query.search[0].title;
    const pageRes = await fetch(
      `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json&origin=*`
    );
    const pageData = await pageRes.json();
    const pages = pageData.query?.pages || {};
    const extract = Object.values(pages)[0]?.extract;
    
    return extract ? { source: 'Wikipedia', content: extract.substring(0, 600), title } : null;
  } catch (e) { return null; }
}

// DuckDuckGo Instant Answers (gratis, sin API key)
async function searchDuckDuckGo(query) {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&origin=*`
    );
    const data = await res.json();
    
    if (data.AbstractText) {
      return { source: 'DuckDuckGo', content: data.AbstractText, title: data.Heading };
    }
    if (data.RelatedTopics?.length > 0) {
      return { source: 'DuckDuckGo', content: data.RelatedTopics[0].Text, title: data.RelatedTopics[0].FirstURL };
    }
    return null;
  } catch (e) { return null; }
}

// Scraping gratuito con AllOrigins (no necesita backend)
async function scrapeWebsite(url) {
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    const text = doc.body?.textContent?.substring(0, 500) || '';
    return { source: url, content: text, title: doc.title };
  } catch (e) { return null; }
}

// ============================================================
// BÚSQUEDA INTELIGENTE (prueba todo gratis)
// ============================================================
export async function smartSearch(query) {
  // 1. Wikipedia (la más confiable)
  const wiki = await searchWikipedia(query);
  if (wiki) return wiki;
  
  // 2. DuckDuckGo
  const ddg = await searchDuckDuckGo(query);
  if (ddg) return ddg;
  
  // 3. No encontró nada
  return { source: 'local', content: null };
}

// Buscar y scrapear una URL específica
export async function learnFromUrl(url) {
  return await scrapeWebsite(url);
}