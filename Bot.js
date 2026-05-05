// Скопируй весь этот текст и вставь в GitHub
const SECRET_KEY = 'ScorpTim3r_Secret!2026';
const ADMIN_USER_ID = 772852915;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'GET') return new Response('bot is running');
  
  const body = await request.json();
  const message = body.message;
  if (!message) return new Response('ok');
  
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  
  let response = 'Неизвестная команда';
  
  if (text === '/start') {
    response = '🎯 scorpTIMER - активация\n\nОтправьте мне ID вашего устройства из приложения.\nПосле оплаты вы получите код активации.';
  } else if (text.length >= 10) {
    response = '📱 ID устройства принят.\n\nДля получения кода активации переведите 500₽ и напишите "Оплатил"';
  }
  
  await fetch(`https://api.telegram.org/bot8782768722:AAF3Z4YwYjx1CfAqnD8d0UwcJGnlppzKUZ8/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: response })
  });
  
  return new Response('ok');
}
