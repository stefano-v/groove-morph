export class DrumEngine {
 constructor(onStep, onBar, onError) {
  this.onStep=onStep; this.onBar=onBar; this.onError=onError;
  this.bpm=124; this.playing=false; this.timers=new Set();
 }
 async start() {
  if(this.playing || this.starting) return;
  this.starting=true; const generation=(this.generation??0)+1; this.generation=generation;
  try {
   const AudioContext=globalThis.AudioContext || globalThis.webkitAudioContext;
   if(!AudioContext) throw new Error('Web Audio non disponibile in questo browser.');
   this.ctx??=new AudioContext({latencyHint:'interactive'});
   await this.ctx.resume();
   if(this.generation!==generation) return;
   if(this.ctx.state!=='running') throw new Error('Audio sospeso: riprova Play.');
   this.noise??=this.createNoise();
   this.bus=this.ctx.createGain(); this.bus.gain.value=.6;
   const limiter=this.ctx.createDynamicsCompressor();
   limiter.threshold.value=-12; limiter.knee.value=15; limiter.ratio.value=6;
   this.bus.connect(limiter); limiter.connect(this.ctx.destination);
   this.limiter=limiter;
   this.playing=true; this.step=0; this.bar=0; this.next=this.ctx.currentTime+.05;
   this.tick(); this.interval=setInterval(()=>this.tick(),25);
  } finally {this.starting=false;}
 }
 createNoise() {
  const b=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);
  const data=b.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
  return b;
 }
 tick() {
  try {
   // Do not burst missed hits if a browser tab was throttled.
   if(this.next<this.ctx.currentTime-.1) {this.next=this.ctx.currentTime+.04;this.step=0;}
   while(this.playing && this.next<this.ctx.currentTime+.1) {
    if(this.step===0) this.pattern=this.onBar(this.bar++);
    const s=this.step, t=this.next, pattern=this.pattern;
    for(let i=0;i<6;i++) if(pattern[i][s]>0) this.hit(i,t,pattern[i][s]);
    const id=setTimeout(()=>{this.timers.delete(id); if(this.playing)this.onStep(s);},Math.max(0,(t-this.ctx.currentTime)*1000));
    this.timers.add(id);
    this.next+=60/this.bpm/4; this.step=(this.step+1)%16;
   }
  } catch(error) {this.stop();this.onError(error);}
 }
 stop() {
  this.generation=(this.generation??0)+1; this.playing=false; clearInterval(this.interval);
  for(const id of this.timers) clearTimeout(id); this.timers.clear();
  if(this.bus) {
   const bus=this.bus, limiter=this.limiter, now=this.ctx.currentTime;
   bus.gain.cancelScheduledValues(now);bus.gain.setValueAtTime(bus.gain.value,now);
   bus.gain.linearRampToValueAtTime(0,now+.015);
   setTimeout(()=>{bus.disconnect();limiter.disconnect();},500);
   this.bus=null;
  }
 }
 tone(t,volume,start,end,duration,type='sine') {
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(start,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.003);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+duration+.01);
  o.onended=()=>{o.disconnect();g.disconnect();};
 }
 hiss(t,volume,duration,frequency,type='highpass') {
  const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();
  source.buffer=this.noise;filter.type=type;filter.frequency.value=frequency;
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.002);
  gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  source.connect(filter);filter.connect(gain);gain.connect(this.bus);
  source.start(t);source.stop(t+duration+.01);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }
 hit(i,t,v) {
  if(i===0) this.tone(t,v*.9,145,43,.35);
  if(i===1) {this.hiss(t,v*.48,.18,1600,'highpass');this.tone(t,v*.25,190,100,.12,'triangle');}
  if(i===2) this.hiss(t,v*.19,.045,7500);
  if(i===3) this.hiss(t,v*.23,.28,6500);
  if(i===4) {for(let n=0;n<3;n++)this.hiss(t+n*.012,v*.28,.06,1400,'bandpass');this.hiss(t+.036,v*.25,.14,1800,'bandpass');}
  if(i===5) this.tone(t,v*.55,210,80,.25);
 }
}
