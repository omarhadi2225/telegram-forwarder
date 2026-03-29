export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Webhook is active' });
  }

  const BOT2_TOKEN = process.env.BOT2_TOKEN;
  const BOT2_CHAT_ID = process.env.BOT2_CHAT_ID;

  try {
    const update = req.body;
    const msg = update.message || update.channel_post || update.edited_message;

    if (!msg) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    const from = (msg.from && msg.from.first_name) || 'Unknown';
    const text = msg.text || msg.caption || '';

    if (!text) {
      return res.status(200).json({ ok: true, skipped: 'no_text' });
    }

    const forwardText = 'من ' + from + ':\n' + text;

    const r = await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: BOT2_CHAT_ID, text: forwardText }),
    });
    const data = await r.json();
    console.log('Webhook forward result:', JSON.stringify(data));

    if (!data.ok) {
      console.error('Bot2 send FAILED:', data.description);
    }

    res.status(200).json({ ok: true, forwarded: data });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
}
