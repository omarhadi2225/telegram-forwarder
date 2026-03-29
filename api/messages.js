export default async function handler(req, res) {
  const API_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    const offset = req.query.offset || 0;
    const response = await fetch(
      'https://api.telegram.org/bot' + API_TOKEN + '/getUpdates?offset=' + offset + '&timeout=0&allowed_updates=["message"]'
    );
    const data = await response.json();

    if (data.ok) {
      const messages = data.result
        .filter(u => u.message && String(u.message.chat.id) === CHAT_ID)
        .map(u => ({
          id: u.update_id,
          text: u.message.text || '',
          from: u.message.from.first_name || 'Unknown',
          date: u.message.date,
          type: u.message.photo ? 'photo' : u.message.document ? 'document' : 'text'
        }));
      res.status(200).json({ ok: true, messages });
    } else {
      res.status(500).json({ ok: false, error: data.description });
    }
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
