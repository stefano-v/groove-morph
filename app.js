import {instruments,styles,blend,clamp,makePattern} from './patterns.js';
import {DrumEngine} from './audio.js';
const $=id=>document.getElementById(id);
let params={morph:.5,complexity:.55,energy:.65}, current=makePattern(params);
let held=null, wantsFreeze=false, appliedFreeze=false;
const sequence=$('sequence'), cells=[];
instruments.forEach((name,i)=>{
 const label=document.createElement('span');label.className='track';label.textContent=name;sequence.append(label);
 cells[i]=Array.from({length:16},()=>{
  const cell=document.createElement('span');cell.className='step';sequence.append(cell);return cell;
 });
});
function draw(pattern) {
 pattern.forEach((row,i)=>row.forEach((v,s)=>{cells[i][s].classList.toggle('hit',v>0);cells[i][s].style.setProperty('--velocity',v);}));
}
function cursor(step) {cells.forEach(row=>row.forEach((cell,s)=>cell.classList.toggle('playhead',s===step)));}
function fail(error) {$('status').textContent=error.message || 'Errore audio: riprova Play.';transport(false);cursor(-1);}
const engine=new DrumEngine(cursor, bar=>{
 if(wantsFreeze && !appliedFreeze) held=current.map(row=>[...row]);
 if(!wantsFreeze) held=null;
 appliedFreeze=wantsFreeze;
 current=held || makePattern(params,bar);
 draw(current);$('bar-label').textContent='Battuta '+(bar+1);
 $('status').textContent=appliedFreeze?'Groove congelato':'In riproduzione';
 freezeNote();
 return current;
},fail);
function transport(playing) {$('play').disabled=playing;$('stop').disabled=!playing;}
function freezeNote() {
 $('freeze').setAttribute('aria-pressed',String(wantsFreeze));
 $('freeze').textContent=wantsFreeze?'◆ Freeze attivo':'◇ Freeze';
 $('freeze-note').textContent=wantsFreeze
  ? (appliedFreeze?'Pattern bloccato. I cursori preparano il groove da liberare.':'Freeze alla prossima battuta.')
  : (appliedFreeze?'Il nuovo groove entra alla prossima battuta.':'Blocca il pattern alla prossima battuta. I cursori preparano il groove successivo.');
}
async function play() {
 transport(true);$('status').textContent='Attivazione audio…';
 try {await engine.start();if(!engine.playing)transport(false);}catch(error){fail(error);}
}
function stop() {engine.stop();transport(false);cursor(-1);$('status').textContent='Fermato';$('bar-label').textContent='In attesa';}
$('play').addEventListener('click',play);$('stop').addEventListener('click',stop);
$('freeze').addEventListener('click',()=>{
 wantsFreeze=!wantsFreeze;
 if(!engine.playing) {appliedFreeze=wantsFreeze;held=wantsFreeze?current.map(row=>[...row]):null; if(!held){current=makePattern(params);draw(current);}}
 freezeNote();
});
function update() {
 $('puck').style.left=(params.morph*100)+'%';$('puck').style.top=((1-params.complexity)*100)+'%';
 for(const key of ['morph','complexity','energy']) {$(key).value=Math.round(params[key]*100);$(key+'-value').textContent=Math.round(params[key]*100)+'%';}
 const {a,b,mix}=blend(params.morph);
 $('style-name').textContent=mix<.01?styles[a]:styles[a]+' → '+styles[b];
 if(!engine.playing&&!held){current=makePattern(params);draw(current);}
}
for(const key of ['morph','complexity','energy']) $(key).addEventListener('input',e=>{params[key]=Number(e.target.value)/100;update();});
$('bpm').addEventListener('change',e=>{
 const value=Number(e.target.value);engine.bpm=Number.isFinite(value)&&value>0?Math.round(clamp(value,60,200)):124;e.target.value=engine.bpm;
});
const pad=$('pad');
function move(e) {
 const rect=pad.getBoundingClientRect();params.morph=clamp((e.clientX-rect.left)/rect.width);
 params.complexity=clamp(1-(e.clientY-rect.top)/rect.height);update();
}
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);move(e);});
pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))move(e);});
document.addEventListener('keydown',e=>{
 if(e.repeat || /INPUT|TEXTAREA|BUTTON|SELECT/.test(e.target.tagName)||e.target.isContentEditable) return;
 if(e.code==='Space'){e.preventDefault();engine.playing?stop():play();}
 if(e.key.toLowerCase()==='f') $('freeze').click();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(engine.playing||engine.starting)){stop();$('status').textContent='In pausa: scheda non visibile';}});
window.addEventListener('pagehide',stop);
update();freezeNote();
