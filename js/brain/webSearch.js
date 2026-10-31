/* CHAOS SYSTEM Web Search v2.0.0
 * Multi-source public-web search for VoidOS. Uses Wikipedia APIs and DuckDuckGo Instant Answer.
 * A browser-only client cannot reliably crawl arbitrary sites or bypass CORS; search links remain available as fallbacks.
 */
(function (g) {
  'use strict';
  const MAX_RESULTS = 12;
  const TIMEOUT_MS = 8500;
  const cache = new Map();

  function normalize(value) {
    return String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  }
  function cleanHtml(value) {
    const node = document.createElement('div');
    node.innerHTML = String(value || '');
    return (node.textContent || node.innerText || '').replace(/\s+/g, ' ').trim();
  }
  function safeUrl(value) {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }
  async function fetchJson(url) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
    try {
      const response = await fetch(url, { signal: controller ? controller.signal : undefined, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response.json();
    } finally { if (timer) clearTimeout(timer); }
  }
  function addResult(results, seen, item) {
    const url = safeUrl(item.url);
    const title = String(item.title || '').trim();
    const content = String(item.content || '').trim();
    if (!url || !title || (!content && !item.allowEmpty)) return;
    const key = url.replace(/#.*$/, '');
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ title: title.slice(0, 240), content: content.slice(0, 1400), url, source: item.source || new URL(url).hostname, type: item.type || 'web' });
  }
  async function searchWikipedia(query, results, seen, limit) {
    const url = 'https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(query) + '&srlimit=' + Math.min(limit, 10) + '&format=json&origin=*';
    const data = await fetchJson(url);
    const rows = data && data.query && Array.isArray(data.query.search) ? data.query.search : [];
    rows.forEach(row => addResult(results, seen, {
      title: row.title,
      content: cleanHtml(row.snippet || ''),
      url: 'https://ar.wikipedia.org/wiki/' + encodeURIComponent(String(row.title || '').replace(/ /g, '_')),
      source: 'ويكيبيديا العربية', type: 'encyclopedia'
    }));
  }
  async function searchDuckDuckGo(query, results, seen) {
    const url = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1&skip_disambig=1';
    const data = await fetchJson(url);
    if (data.AbstractText) addResult(results, seen, { title: data.Heading || query, content: data.AbstractText, url: data.AbstractURL || 'https://duckduckgo.com/?q=' + encodeURIComponent(query), source: data.AbstractSource || 'DuckDuckGo Instant Answer', type: 'instant-answer' });
    if (data.Answer) addResult(results, seen, { title: data.Heading || 'إجابة مباشرة', content: data.Answer, url: data.AnswerURL || 'https://duckduckgo.com/?q=' + encodeURIComponent(query), source: 'DuckDuckGo', type: 'answer' });
    const walk = items => (items || []).forEach(item => {
      if (item.Topics) walk(item.Topics);
      else if (item.FirstURL && item.Text) addResult(results, seen, { title: item.Text.split(' - ')[0] || item.Text, content: item.Text, url: item.FirstURL, source: 'DuckDuckGo', type: 'related' });
    });
    walk(data.RelatedTopics);
  }
  function fromMemory(query, limit) {
    try {
      if (g.ChaosWebMemory && typeof g.ChaosWebMemory.search === 'function') return g.ChaosWebMemory.search(query, limit);
      const cached = g.ChaosWebMemory && g.ChaosWebMemory.get && g.ChaosWebMemory.get(query);
      if (cached) return [{ title: cached.title || query, content: cached.content || '', url: cached.url || 'https://duckduckgo.com/?q=' + encodeURIComponent(query), source: 'ذاكرة CHAOS SYSTEM', type: 'memory', cached: true }];
    } catch (_) {}
    return [];
  }
  async function searchDetailed(query, options) {
    const q = String(query || '').trim();
    if (!q) return { query: q, results: [], sources: [], cached: false, message: 'أدخل كلمات البحث أولًا.' };
    if (q.length > 300) throw new Error('عبارة البحث أطول من الحد المسموح.');
    const limit = Math.max(1, Math.min(Number(options && options.limit) || MAX_RESULTS, MAX_RESULTS));
    const key = normalize(q);
    if (cache.has(key) && !(options && options.forceRefresh)) return { ...cache.get(key), cached: true };
    const memory = fromMemory(q, limit);
    if (memory.length && !(options && options.forceRefresh)) {
      const normalizedMemory = memory.map(item => ({ ...item, url: safeUrl(item.url) || 'https://duckduckgo.com/?q=' + encodeURIComponent(q), source: item.source || 'ذاكرة CHAOS SYSTEM', cached: true }));
      if (normalizedMemory.length >= 3) return { query: q, results: normalizedMemory.slice(0, limit), sources: [...new Set(normalizedMemory.map(x => x.source))], cached: true, message: 'استُخدمت ذاكرة البحث المحلية.' };
    }
    const results = [], seen = new Set(), sourceStates = [];
    if (memory.length && !(options && options.forceRefresh)) memory.forEach(item => addResult(results, seen, { ...item, source: item.source || 'ذاكرة CHAOS SYSTEM', type: item.type || 'memory' }));
    const jobs = [
      ['ويكيبيديا العربية', () => searchWikipedia(q, results, seen, limit)],
      ['DuckDuckGo Instant Answer', () => searchDuckDuckGo(q, results, seen)]
    ];
    await Promise.all(jobs.map(async ([name, run]) => {
      try { await run(); sourceStates.push({ name, ok: true }); }
      catch (error) { sourceStates.push({ name, ok: false, error: String(error && error.message || error) }); }
    }));
    const deduped = results.slice(0, limit);
    const result = { query: q, results: deduped, sources: [...new Set(deduped.map(x => x.source))], sourceStates, cached: false,
      fallbackUrl: 'https://duckduckgo.com/?q=' + encodeURIComponent(q),
      message: deduped.length ? 'اكتمل البحث من المصادر المتاحة.' : 'لم تُرجع واجهات البحث نتائج. يمكنك فتح بحث الويب الكامل خارجيًا.' };
    if (deduped.length && g.ChaosWebMemory && typeof g.ChaosWebMemory.saveSearch === 'function') {
      try { g.ChaosWebMemory.saveSearch(q, deduped); } catch (_) {}
    }
    if (deduped.length && g.ChaosWebMemory && typeof g.ChaosWebMemory.save === 'function') {
      try { g.ChaosWebMemory.save(q, { title: deduped[0].title, content: deduped[0].content, url: deduped[0].url, results: deduped }); } catch (_) {}
    }
    cache.set(key, result);
    if (cache.size > 30) cache.delete(cache.keys().next().value);
    return result;
  }
  async function searchWeb(query, options) {
    const result = await searchDetailed(query, options);
    if (!result.results.length) return null;
    const first = result.results[0];
    return { source: result.cached ? 'WEB_MEMORY_CACHE' : 'WEB_MULTI_SOURCE', title: first.title, content: first.content, url: first.url, results: result.results, sources: result.sources, cached: result.cached };
  }
  function formatSearchResponse(result, query) {
    if (!result) return 'لم تُرجع مصادر البحث نتائج موثوقة عن «' + String(query || '') + '». جرّب بحثًا خارجيًا أو صياغة مختلفة؛ لم يتم اختلاق نتائج.';
    const list = (result.results || [result]).slice(0, 5).map((item, i) => `${i + 1}. ${item.title}\n${item.content || ''}\n${item.url || ''}`).join('\n\n');
    return `[CHAOS WEB SEARCH${result.cached ? ' // MEMORY' : ' // LIVE SOURCES'}]\nاستعلام: ${query}\nالمصادر: ${(result.sources || [result.source || 'ويب']).join('، ')}\n\n${list}`;
  }
  g.ChaosWebSearch = { version: '2.0.0', searchWeb, searchDetailed, formatSearchResponse, clearRuntimeCache: () => cache.clear() };
})(window);
