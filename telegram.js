// Adiciona esta linha se estiveres a usar Node.js puro na Vercel
// Se o erro persistir, confirma se o teu 'package.json' tem o 'node-fetch'
const fetch = require('node-fetch'); 

module.exports = async (req, res) => {
  // 1. IMPORTANTE: Verificar se recebemos dados do Telegram
  if (!req.body || req.method !== 'POST') {
    return res.status(200).send('Servidor Ativo e pronto para POST');
  }

  const { callback_query } = req.body;

  if (callback_query) {
    const token = process.env.TELEGRAM_TOKEN;
    const api = `https://api.telegram.org/bot${token}`;
    
    const chatId = callback_query.message.chat.id;
    const messageId = callback_query.message.message_id;
    const user = callback_query.from.first_name;
    const originalText = callback_query.message.text;

    try {
      // PRIMEIRO: Para o "relógio" no Telegram (dá feedback imediato ao user)
      await fetch(`${api}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callback_query.id,
          text: 'Validado com sucesso!',
          show_alert: false // Mudei para false para ser apenas um aviso discreto
        }),
      });

      // SEGUNDO: Atualiza o texto da mensagem
      await fetch(`${api}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n✅ Tomado a cargo por: ${user}`,
          // Importante: remover o botão após o clique para ninguém clicar 2 vezes
          reply_markup: { inline_keyboard: [] } 
        }),
      });

    } catch (error) {
      console.error('Erro ao processar clique:', error);
    }
  }

  // Responde sempre 200 OK para o Telegram não tentar reenviar a mesma mensagem
  return res.status(200).send('OK');
};
