import { processIncomingForBot2, telegramRequest } from '../lib/bot2Processor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Use POST to send messages' });
  }

  const BOT1_TOKEN = process.env.BOT1_TOKEN;

  try {
    const { chat_id, text } = req.body;

    if (!chat_id || !text) {
      return res.status(400).json({ ok: false, error: 'chat_id and text required' });
    }

    if (!BOT1_TOKEN) {
      throw new Error('Missing BOT1_TOKEN');
    }

    const d1 = await telegramRequest(BOT1_TOKEN, 'sendMessage', { chat_id, text });
    const d2 = await processIncomingForBot2({
      message: {
        text,
        chat: { id: chat_id },
        from: { first_name: 'Bot 1 API' },
      },
    });

    res.status(200).json({ ok: true, bot1: d1, bot2: d2 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
