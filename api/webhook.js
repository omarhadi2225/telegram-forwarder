import { processIncomingForBot2 } from '../lib/bot2Processor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Webhook is active' });
  }

  try {
    const result = await processIncomingForBot2(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
