export default async function handler(req, res) {
  const BOT1_TOKEN = process.env.BOT1_TOKEN;
  const VERCEL_URL = process.env.VERCEL_URL;

  try {
    const webhookUrl = 'https://' + VERCEL_URL + '/api/webhook';
    const response = await fetch(
      'https://api.telegram.org/bot' + BOT1_TOKEN + '/setWebhook?url=' + webhookUrl
    );
    const data = await response.json();
    res.status(200).json({ ok: true, webhook: webhookUrl, result: data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
