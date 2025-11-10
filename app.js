// ======== CONFIG ========
const BACKEND_URL = "https://TU-BACKEND-REPLIT-URL"; // luego reemplaza

// ======== Event Bus (PUB/SUB demo) ========
window.bus = (() => {
  const topics = {};
  return {
    publish(topic, data){
      (topics[topic] || []).forEach(fn => fn(data));
    },
    subscribe(topic, fn){
      topics[topic] = topics[topic] || [];
      topics[topic].push(fn);
    }
  };
})();

// ======== Modelo 0–5 con pesos ========
const form = document.querySelector('#score-form');
const out = document.querySelector('#score-out');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const vals = [1,2,3,4,5].map(i => Number(document.querySelector('#c'+i).value || 0));
  const pes = [1,2,3,4,5].map(i => Number(document.querySelector('#p'+i).value || 0));
  const sumP = pes.reduce((a,b)=>a+b,0);
  const score = sumP === 0 ? 0 : vals.reduce((acc,v,i)=>acc + v*pes[i], 0)/sumP;
  out.textContent = `Puntaje ponderado: ${score.toFixed(2)} / 5.00`;
  bus.publish('score:calculated', {score});
});

// ======== PUB/SUB demo ========
const pubLog = document.querySelector('#pubsub-log');
document.querySelector('#btn-publish')?.addEventListener('click', ()=>{
  bus.publish('demo:event', { ts: new Date().toISOString() });
});
bus.subscribe('demo:event', data => {
  pubLog.innerHTML = `<p>Evento recibido: ${data.ts}</p>` + pubLog.innerHTML;
});

// ======== API: listar y crear ========
const list = document.querySelector('#items');
document.querySelector('#btn-load')?.addEventListener('click', async ()=>{
  list.innerHTML = '<li>Cargando...</li>';
  try{
    const r = await fetch(`${BACKEND_URL}/api/items`);
    const data = await r.json();
    list.innerHTML = '';
    data.forEach(it => {
      const li = document.createElement('li');
      li.textContent = `${it.id}: ${it.name}`;
      list.appendChild(li);
    });
  }catch(err){
    list.innerHTML = `<li>Error: ${err.message}</li>`;
  }
});

document.querySelector('#create-form')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.querySelector('#new-name').value.trim();
  if(!name) return;
  try{
    const r = await fetch(`${BACKEND_URL}/api/items`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name })
    });
    if(!r.ok) throw new Error('No se pudo crear');
    document.querySelector('#btn-load').click();
    document.querySelector('#new-name').value = '';
  }catch(err){
    alert(err.message);
  }
});
