const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegramPost(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  // Process callback_query (button click)
  if (body.callback_query) {
    const query = body.callback_query;
    const callbackId = query.id;
    const firstName = query.from?.first_name || "Desconhecido";
    const chatId = query.message?.chat?.id;
    const messageId = query.message?.message_id;
    const originalText = query.message?.text || "";
    const callbackData = query.data || "";

    // Only process our "validar_pedido" callbacks
    if (callbackData.startsWith("validar_pedido")) {
      const newText = `${originalText}\n\n---\n✅ Tomado a cargo por: ${firstName}`;

      // Edit the original message
      await telegramPost("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        parse_mode: "Markdown",
      });

      // Answer the callback to remove the loading spinner
      await telegramPost("answerCallbackQuery", {
        callback_query_id: callbackId,
        text: "Validado com sucesso!",
        show_alert: true,
      });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
