const SECRET_KEY = 'ScorpTim3r_Secret!2026';
const ADMIN_USER_ID = 772852915;
const PAYMENT_DETAILS = 'Сбербанк: 4276XXXXXXX\nПолучатель: Иван Иванович';
let pending = {};
async function generateCode(id) {
  const e = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', e.encode(SECRET_KEY), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', k, e.encode(id));
  return Array.from(new Uint8Array(s)).map(b=>b.toString(16).padStart(2,'0')).join('').substring(0,16).toUpperCase();
}
async function sendMsg(c,t) {
  await fetch('https://api.telegram.org/bot8782768722:AAF3Z4YwYjx1CfAqnD8d0UwcJGnlppzKUZ8/sendMessage', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({chat_id:c,text:t})
  });
}
export default {
  async fetch(r) {
    if (r.method==='GET') return new Response('bot is running');
    const b = await r.json(); const m = b.message; if (!m) return new Response('ok');
    const c = m.chat.id; const t = (m.text||'').trim();
    if (t==='/start') await sendMsg(c,'🎯 scorpTIMER - активация\n\nОтправьте ID устройства.');
    else if (t.startsWith('/approve')&&c===ADMIN_USER_ID) {
      const u = parseInt(t.split(' ')[1]);
      if(pending[u]){ const code=await generateCode(pending[u]); await sendMsg(u,'✅ Код: '+code); delete pending[u]; await sendMsg(c,'✅ Отправлен'); }
      else await sendMsg(c,'❌ Нет заявки');
    }
    else if (t==='/pending'&&c===ADMIN_USER_ID) {
      const ids=Object.keys(pending);
      if(ids.length===0) await sendMsg(c,'Нет заявок');
      else { let msg='Ожидают:\n'; ids.forEach(i=>msg+=i+': '+pending[i]+'\n'); await sendMsg(c,msg); }
    }
    else if (t.toLowerCase()==='оплатил') {
      if(pending[c]){ await sendMsg(c,'✅ Ждите код'); await sendMsg(ADMIN_USER_ID,'🔔 Оплата от '+c+'\nID: '+pending[c]+'\n/approve '+c); }
      else await sendMsg(c,'❌ Сначала отправьте ID');
    }
    else if (t.length>=10) { pending[c]=t; await sendMsg(c,'📱 ID принят. 500₽ на:\n'+PAYMENT_DETAILS+'\nНапишите "Оплатил"'); }
    return new Response('ok');
  }
};
