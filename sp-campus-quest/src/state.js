/** Pure game rules. No DOM, rendering, network, or storage dependencies. */
export const SAVE_KEY = 'sp-campus-quest.v1';
export const ROLES = {
  maker: { name: 'The Maker', description: 'Build possibilities. Earn 20 bonus XP per quest.', color: '#ee765a' },
  explorer: { name: 'The Explorer', description: 'Go a little further. Sprint uses 35% less energy.', color: '#558eaa' },
  connector: { name: 'The Connector', description: 'Bring people together. Snacks cost 2 instead of 3 tokens.', color: '#a087bf' },
};
export const QUESTS = [
  { id: 'welcome', title: 'A new beginning', who: 'Maya', place: 'Dover MRT', text: 'Meet Maya at the station and join the festival crew.', xp: 60, tokens: 3 },
  { id: 'library', title: 'Between the lines', who: 'Jun', place: 'Library & FabLab', text: 'Help Jun organise the festival archive. Solve the pattern puzzle.', xp: 100, tokens: 4 },
  { id: 'food', title: 'A little local flavour', who: 'Auntie Lin', place: 'Food Court 5', text: 'Find the missing delivery crate near the food court, then talk to Auntie Lin.', xp: 80, tokens: 4 },
  { id: 'green', title: 'Leave it greener', who: 'Farah', place: 'Eco garden', text: 'Collect all 6 recyclables around campus, then visit Farah.', xp: 120, tokens: 5 },
  { id: 'maker', title: 'A spark of an idea', who: 'Dev', place: 'Innovation lab', text: 'Help Dev reconnect the festival lights. Solve the circuit sequence.', xp: 120, tokens: 5 },
  { id: 'sport', title: 'Find your stride', who: 'Kai', place: 'Sports Arena', text: 'Meet Kai and finish the 5-checkpoint campus relay in 55 seconds.', xp: 120, tokens: 5 },
  { id: 'memory', title: 'Small moments, big stories', who: 'Izzie', place: 'Spectrum', text: 'Find all 12 memory sparks, then bring your stories to Izzie.', xp: 150, tokens: 6 },
  { id: 'festival', title: 'Made of us', who: 'Maya', place: 'Festival plaza', text: 'Complete the other 7 quests, then meet Maya at the plaza to open the festival.', xp: 200, tokens: 10 },
];
export const SPARKS = [[-5,21],[17,17],[30,20],[42,-5],[20,-24],[4,-30],[-16,-27],[-33,-20],[-34,3],[-20,19],[7,7],[-7,-12]];
export const RECYCLE = [[-18,17],[24,17],[34,-17],[-4,-23],[-30,-12],[12,-3]];
export const RELAY = [[27,5],[29,-12],[12,-18],[4,-5],[20,5]];
export function freshState(role = 'explorer', name = 'Freshie', color = '#558eaa') {
  return { version: 1, name: name.trim().slice(0, 20) || 'Freshie', role: Object.hasOwn(ROLES, role) ? role : 'explorer', color,
    x: 0, z: 27, xp: 0, tokens: 0, energy: 100, snacks: 2, completed: [], sparks: [], recycle: [], discovered: ['dover'],
    crate: false, relayWon: false, tracked: 'welcome', time: 0, settings: { sound: false, motion: true, quality: 'high' } };
}
export function level(state) { return Math.floor(state.xp / 160) + 1; }
export function questAvailable(state, id) { return id === 'welcome' || (state.completed.includes('welcome') && (id !== 'festival' || state.completed.length >= 7)); }
export function finishQuest(state, id) {
  const q = QUESTS.find(q => q.id === id);
  if (!q || !questAvailable(state, id) || state.completed.includes(id)) return false;
  if (id === 'food' && !state.crate || id === 'green' && state.recycle.length < 6 || id === 'memory' && state.sparks.length < 12 || id === 'sport' && !state.relayWon) return false;
  state.completed.push(id); state.xp += q.xp + (state.role === 'maker' ? 20 : 0); state.tokens += q.tokens;
  state.energy = 100; state.tracked = QUESTS.find(q => !state.completed.includes(q.id) && questAvailable(state, q.id))?.id || 'festival';
  return true;
}
export function collect(state, kind, id) {
  const limit = kind === 'sparks' ? SPARKS.length : kind === 'recycle' ? RECYCLE.length : 0;
  if (!Number.isInteger(id) || id < 0 || id >= limit || state[kind].includes(id)) return false;
  state[kind].push(id); state.xp += kind === 'sparks' ? 10 : 5; return true;
}
export function buySnack(state) {
  const cost = state.role === 'connector' ? 2 : 3;
  if (state.tokens < cost || state.snacks >= 9) return false;
  state.tokens -= cost; state.snacks++; return true;
}
export function eatSnack(state) {
  if (!state.snacks || state.energy >= 100) return false;
  state.snacks--; state.energy = Math.min(100, state.energy + 50); return true;
}
export function canMove(x, z, obstacles) {
  return Number.isFinite(x) && Number.isFinite(z) && Math.abs(x) < 44 && z > -38 && z < 35 && !obstacles.some(o => Math.abs(x - o.x) < o.w / 2 + .5 && Math.abs(z - o.z) < o.d / 2 + .5);
}
/** Validate every persisted field; never trust JSON from localStorage/imports. */
export function restore(raw) {
  try {
    const s = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!s || s.version !== 1 || !Object.hasOwn(ROLES, s.role) || !Number.isFinite(s.x) || !Number.isFinite(s.z)) return null;
    const n = freshState(s.role, typeof s.name === 'string' ? s.name : 'Freshie', /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : ROLES[s.role].color);
    n.x = Math.max(-43, Math.min(43, s.x)); n.z = Math.max(-37, Math.min(34, s.z));
    for (const [key, max] of [['xp',100000],['tokens',100000],['energy',100],['snacks',9],['time',1e9]]) n[key] = Number.isFinite(s[key]) ? Math.max(0, Math.min(max, key === 'time' || key === 'energy' ? s[key] : Math.floor(s[key]))) : n[key];
    for (const [key, max] of [['sparks',12],['recycle',6]]) n[key] = [...new Set(Array.isArray(s[key]) ? s[key].filter(i => Number.isInteger(i) && i >= 0 && i < max) : [])];
    n.completed = [...new Set(Array.isArray(s.completed) ? s.completed.filter(id => QUESTS.some(q => q.id === id)) : [])];
    if (!n.completed.includes('welcome')) n.completed = [];
    if (n.completed.includes('festival') && n.completed.length !== 8) n.completed = n.completed.filter(id => id !== 'festival');
    n.discovered = [...new Set(['dover', ...(Array.isArray(s.discovered) ? s.discovered.filter(id => ['library','food','garden','lab','sports','spectrum','plaza'].includes(id)) : [])])];
    n.crate = s.crate === true; n.relayWon = s.relayWon === true;
    if (QUESTS.some(q => q.id === s.tracked)) n.tracked = s.tracked;
    if (s.settings && typeof s.settings === 'object') n.settings = { sound: s.settings.sound === true, motion: s.settings.motion !== false, quality: s.settings.quality === 'low' ? 'low' : 'high' };
    return n;
  } catch { return null; }
}
