// HIPPOCAMPUS Web Memory v2.0.0 — bounded local search cache; opt-out aware.
(function (g) {
  'use strict';
  const DB_KEY = 'chaos_web_memory';
  const ENABLE_KEY = 'chaosMemoryEnabled';
  const MAX_TOPICS = 40;
  const MAX_RESULTS = 12;
  const EMPTY = () => ({ trends: [], globalKnowledge: {}, searches: [] });
  function enabled() { try { return localStorage.getItem(ENABLE_KEY) !== 'false'; } catch (_) { return false; } }
  function loadWebData() {
    if (!enabled()) return EMPTY();
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return EMPTY();
      const parsed = JSON.parse(raw);
      return { trends: Array.isArray(parsed.trends) ? parsed.trends.slice(-20) : [], globalKnowledge: parsed.globalKnowledge && typeof parsed.globalKnowledge === 'object' ? parsed.globalKnowledge : {}, searches: Array.isArray(parsed.searches) ? parsed.searches.slice(-MAX_TOPICS) : [] };
    } catch (_) { return EMPTY(); }
  }
  function persist(data) {
    if (!enabled()) return false;
    try { localStorage.setItem(DB_KEY, JSON.stringify(data)); return true; } catch (_) { return false; }
  }
  function save(topic, dataObj) {
    const cleanTopic = String(topic || '').trim().toLocaleLowerCase();
    if (!cleanTopic || !enabled()) return false;
    const db = loadWebData();
    const old = db.globalKnowledge[cleanTopic] || {};
    db.globalKnowledge[cleanTopic] = {
      title: String(dataObj && dataObj.title || old.title || topic).slice(0, 240),
      content: String(dataObj && (dataObj.content || dataObj.summary) || old.content || '').slice(0, 1400),
      url: String(dataObj && dataObj.url || old.url || '').slice(0, 2048),
      results: Array.isArray(dataObj && dataObj.results) ? dataObj.results.slice(0, MAX_RESULTS).map(x => ({ title: String(x.title || '').slice(0, 240), content: String(x.content || '').slice(0, 1000), url: String(x.url || '').slice(0, 2048), source: String(x.source || 'ويب').slice(0, 100), type: String(x.type || 'web') })) : (old.results || []),
      learnedAt: Date.now()
    };
    db.trends = db.trends.filter(x => x !== topic); db.trends.push(String(topic).slice(0, 300)); db.trends = db.trends.slice(-20);
    const keys = Object.keys(db.globalKnowledge);
    while (keys.length > MAX_TOPICS) delete db.globalKnowledge[keys.shift()];
    return persist(db);
  }
  function get(topic) {
    if (!enabled()) return null;
    const db = loadWebData(); return db.globalKnowledge[String(topic || '').trim().toLocaleLowerCase()] || null;
  }
  function saveSearch(query, results) {
    if (!enabled() || !String(query || '').trim()) return false;
    const db = loadWebData();
    const item = { query: String(query).slice(0, 300), at: Date.now(), results: (Array.isArray(results) ? results : []).slice(0, MAX_RESULTS).map(x => ({ title: String(x.title || '').slice(0, 240), content: String(x.content || '').slice(0, 1000), url: String(x.url || '').slice(0, 2048), source: String(x.source || 'ويب').slice(0, 100), type: String(x.type || 'web') })) };
    db.searches = db.searches.filter(x => String(x.query).toLocaleLowerCase() !== item.query.toLocaleLowerCase()); db.searches.push(item); db.searches = db.searches.slice(-MAX_TOPICS);
    return persist(db);
  }
  function search(query, limit) {
    if (!enabled()) return [];
    const db = loadWebData(); const q = String(query || '').trim().toLocaleLowerCase();
    const exact = db.globalKnowledge[q];
    if (exact && Array.isArray(exact.results) && exact.results.length) return exact.results.slice(0, limit || MAX_RESULTS).map(x => ({ ...x, cached: true }));
    const found = db.searches.slice().reverse().find(x => String(x.query).toLocaleLowerCase() === q);
    return found ? found.results.slice(0, limit || MAX_RESULTS).map(x => ({ ...x, cached: true })) : [];
  }
  function listSearches() { return loadWebData().searches.slice().reverse().map(x => ({ query: x.query, at: x.at, count: x.results.length })); }
  function purgeWebMemory() { try { localStorage.removeItem(DB_KEY); return true; } catch (_) { return false; } }
  g.ChaosWebMemory = { version: '2.0.0', loadWebData, save, get, search, saveSearch, listSearches, purgeWebMemory, enabled };
})(window);
