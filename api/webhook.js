api/webhook.jsexport default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Webhook is active' });
  }

  const BOT2_TOKEN = process.env.BOT2_TOKEN;
  const BOT2_CHAT_ID = process.env.BOT2_CHAT_ID;

  try {
    const update = req.body;

    if (update.message && update.message.text) {
      const from = update.message.from.first_name || 'Unknown';
      const text = update.message.text;
      const forwardText = '📩 من ' + from + ':\n' + text;

      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          text: forwardText,
        }),
      });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({ ok: true });
  }
}
