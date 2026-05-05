const SECRET_KEY = 'ScorpTim3r_Secret!2026';
const ADMIN_USER_ID = 772852915;
const PAYMENT_DETAILS = 'Сбербанк: 4276XXXXXXX\nПолучатель: Иван Иванович';

let pending = {};

async function generateCode(deviceId) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(SECRET_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(deviceId));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('').substring(0, 16).toUpperCase();
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot8782768722:AAF3Z4YwYjx1CfAqnD8d0UwcJGnlppzKUZ8/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

export default {
  async fetch(request) {
    if (request.method === 'GET') return new Response('bot is running');

    const body = await request.json();
    const message = body.message;
    if (!message) return new Response('ok');

    const chatId = message.chat.id;
    const text = (message.text || '').trim();

    if (text === '/start') {
      await sendMessage(chatId, '🎯 scorpTIMER - активация\n\nОтправьте мне ID вашего устройства из приложения.\nПосле оплаты вы получите код активации.');
    } else if (text.startsWith('/approve') && chatId === ADMIN_USER_ID) {
      const userId = parseInt(text.split(' ')[1]);
      if (pending[userId]) {
        const code = await generateCode(pending[userId]);
        await sendMessage(userId, '✅ Ваш код активации: ' + code + '\n\nВведите его в приложении для полного доступа.');
        delete pending[userId];
        await sendMessage(chatId, '✅ Код отправлен пользователю ' + userId);
      } else {
        await sendMessage(chatId, '❌ Нет ожидающей заявки от этого пользователя.');
      }
    } else if (text === '/pending' && chatId === ADMIN_USER_ID) {
      const ids = Object.keys(pending);
      if (ids.length === 0) {
        await sendMessage(chatId, 'Нет ожидающих заявок.');
      } else {
        let msg = 'Ожидающие подтверждения:\n';
        ids.forEach(id => { msg += '- ' + id + ': ' + pending[id] + '\n'; });
        await sendMessage(chatId, msg);
      }
    } else if (text.toLowerCase() === 'оплатил') {
      if (pending[chatId]) {
        await sendMessage(chatId, '✅ Подтверждение отправлено администратору. Ожидайте код.');
        await sendMessage(ADMIN_USER_ID, '🔔 Пользователь (ID ' + chatId + ') заявил об оплате.\nID устройства: ' + pending[chatId] + '\nДля выдачи кода: /approve ' + chatId);
      } else {
        await sendMessage(chatId, '❌ Сначала отправьте мне ID вашего устройства.');
      }
    } else if (text.length >= 10) {
      pending[chatId] = text;
      await sendMessage(chatId, '📱 ID устройства принят.\n\nДля получения кода активации переведите 500₽ на:\n' + PAYMENT_DETAILS + '\n\nПосле оплаты напишите мне: Оплатил');
    } else {
      await sendMessage(chatId, '❌ Не похоже на ID устройства. Попробуйте ещё раз или нажмите /start.');
    }

    return new Response('ok');
  }
};
