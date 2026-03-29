export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Use POST to send messages' });
  }

  const BOT1_TOKEN = process.env.BOT1_TOKEN;
  const BOT2_TOKEN = process.env.BOT2_TOKEN;
  const BOT2_CHAT_ID = process.env.BOT2_CHAT_ID;

  try {
    const { chat_id, text } = req.body;

    if (!chat_id || !text) {
      return res.status(400).json({ ok: false, error: 'chat_id and text required' });
    }

    // Send via Bot 1
    const r1 = await fetch('https://api.telegram.org/bot' + BOT1_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text }),
    });
    const d1 = await r1.json();
    console.log('Bot1 response:', JSON.stringify(d1));

    // Send SAME text via Bot 2
    const r2 = await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: BOT2_CHAT_ID, text }),
    });
    const d2 = await r2.json();
    console.log('Bot2 response:', JSON.stringify(d2));

    res.status(200).json({ ok: true, bot1: d1, bot2: d2 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
