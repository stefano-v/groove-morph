export const instruments = ['Kick', 'Snare', 'Closed hat', 'Open hat', 'Clap', 'Tom'];
export const styles = ['House', 'Techno', 'Breakbeat', 'Electro'];
// Six instrument rows per style. Each character is a hit strength from 0 to 9.
export const banks = [
 ['9000900090009000','0000800000008000','4040404040404040','0070007000700070','0000600000006000','0000000000000030'],
 ['9000900090009000','0000700000007000','5050505050505050','0060006000600060','0000500000005000','0003000000030000'],
 ['9000008000900080','0000900000009000','7040504070405040','0000007000000070','0000400000004000','0000030000000050'],
 ['9000000090000600','0000800000008000','6040604060406040','0060000000600000','0000500000005000','0000006000000050']
].map(style => style.map(row => [...row].map(Number).map(n => n / 9)));
export const clamp = (n, lo=0, hi=1) => Math.max(lo, Math.min(hi,n));
export function blend(morph) {
 const position = clamp(morph)*3, a = Math.floor(position), b = Math.min(3,a+1);
 return {a,b,mix:position-a};
}
export function probability(morph, complexity, instrument, step) {
 const {a,b,mix} = blend(morph);
 const base = banks[a][instrument][step]*(1-mix) + banks[b][instrument][step]*mix;
 // Shared anchors survive low complexity; higher complexity adds ghost notes.
 const anchor = instrument === 0 && step%4 === 0 || instrument === 1 && step%8 === 4;
 const density = anchor ? 1 : .55 + clamp(complexity)*.6;
 const ghost = (instrument===2 || instrument===5) && step%2===1 ? clamp(complexity)**2*.32 : 0;
 return clamp(base*density + ghost);
}
function random(key) { let n = Math.imul(key ^ 0x9e3779b9, 0x85ebca6b); n ^= n>>>13; return (n>>>0)/4294967296; }
export function makePattern({morph,complexity,energy}, bar=0) {
 return instruments.map((_,i) => Array.from({length:16}, (_,s) => {
  const p = probability(morph,complexity,i,s);
  // Deterministic thresholds make frozen grooves reproducible.
  if (random(bar*997+i*37+s*13+11) >= p) return 0;
  return clamp((.45+p*.5)*(.55+clamp(energy)*.45));
 }));
}
