export default {
  async fetch(request) {
    if (request.method === 'GET') return new Response('bot is running');
    
    const body = await request.json();
    const message = body.message;
    if (!message) return new Response('ok');
    
    const chatId = message.chat.id;
    const text = (message.text || '').trim();
    
    let reply = '';
    if (text === '/start') reply = 'Бот работает! Отправьте ID устройства.';
    else reply = 'Принято: ' + text;
    
    await fetch('https://api.telegram.org/bot8782768722:AAF3Z4YwYjx1CfAqnD8d0UwcJGnlppzKUZ8/sendMessage', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({chat_id: chatId, text: reply})
    });
    
    return new Response('ok');
  }
};
