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
      return res.status(200).json({ ok: true });
    }

    const from = (msg.from && msg.from.first_name) || 'Unknown';

    // Forward text messages
    if (msg.text) {
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          text: '📩 من ' + from + ':\n' + msg.text,
        }),
      });
    }

    // Forward photos
    if (msg.photo) {
      const photo = msg.photo[msg.photo.length - 1];
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendPhoto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          photo: photo.file_id,
          caption: '📩 من ' + from + (msg.caption ? ':\n' + msg.caption : ''),
        }),
      });
    }

    // Forward documents
    if (msg.document) {
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          document: msg.document.file_id,
          caption: '📩 من ' + from + (msg.caption ? ':\n' + msg.caption : ''),
        }),
      });
    }

    // Forward voice
    if (msg.voice) {
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendVoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          voice: msg.voice.file_id,
        }),
      });
    }

    // Forward video
    if (msg.video) {
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          video: msg.video.file_id,
          caption: '📩 من ' + from + (msg.caption ? ':\n' + msg.caption : ''),
        }),
      });
    }

    // Forward sticker
    if (msg.sticker) {
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendSticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          sticker: msg.sticker.file_id,
        }),
      });
    }

    // Forward location
    if (msg.location) {
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendLocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          latitude: msg.location.latitude,
          longitude: msg.location.longitude,
        }),
      });
    }

    // Forward contact
    if (msg.contact) {
      await fetch('https://api.telegram.org/bot' + BOT2_TOKEN + '/sendContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BOT2_CHAT_ID,
          phone_number: msg.contact.phone_number,
          first_name: msg.contact.first_name,
        }),
      });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({ ok: true });
  }
}
