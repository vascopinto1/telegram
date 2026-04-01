module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Servidor Ativo');
  }

  const { callback_query } = req.body;

  if (callback_query) {
    const chatId = callback_query.message.chat.id;
    const messageId = callback_query.message.message_id;
    const user = callback_query.from.first_name;
    const originalText = callback_query.message.text;
    const token = process.env.TELEGRAM_TOKEN;
    const api = `https://api.telegram.org/bot${token}`;

    // Edita a mensagem original no Telegram
    await fetch(`${api}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: `${originalText}\n\n✅ Tomado a cargo por: ${user}`,
      }),
    });

    // Remove o "relógio" do botão
    await fetch(`${api}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callback_query.id,
        text: 'Validado com sucesso!',
        show_alert: true,
      }),
    });
  }

  return res.status(200).send('OK');
};
