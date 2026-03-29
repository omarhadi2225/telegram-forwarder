function extractIncomingMessage(update = {}) {
  return (
    update.message ||
    update.channel_post ||
    update.edited_message ||
    update.edited_channel_post ||
    null
  );
}

export async function telegramRequest(botToken, method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    const description = data?.description || response.statusText || 'Unknown Telegram error';
    throw new Error(`Telegram ${method} failed: ${description}`);
  }

  return data;
}

function getSenderName(message) {
  return (
    message.from?.first_name ||
    message.from?.username ||
    message.chat?.title ||
    'Unknown'
  );
}

function getTargetChatId(message, explicitTargetChatId) {
  return explicitTargetChatId ?? message.chat?.id ?? process.env.BOT2_CHAT_ID ?? null;
}

function formatSenderLine(message) {
  return `من ${getSenderName(message)}`;
}

function formatCaption(message) {
  const senderLine = formatSenderLine(message);
  return message.caption ? `${senderLine}:\n${message.caption}` : senderLine;
}

async function sendContextMessage(botToken, chatId, text) {
  return telegramRequest(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
  });
}

export async function processIncomingForBot2(update, options = {}) {
  const botToken = process.env.BOT2_TOKEN;

  if (!botToken) {
    throw new Error('Missing BOT2_TOKEN');
  }

  const message = extractIncomingMessage(update);

  if (!message) {
    return { ok: true, skipped: 'unsupported_update' };
  }

  const targetChatId = getTargetChatId(message, options.targetChatId);

  if (!targetChatId) {
    throw new Error('Missing target chat id. Set BOT2_CHAT_ID or ensure the incoming update has chat.id.');
  }

  const deliveries = [];
  const senderLine = formatSenderLine(message);

  if (message.text) {
    deliveries.push(
      await sendContextMessage(botToken, targetChatId, `${senderLine}:\n${message.text}`)
    );
  } else if (message.photo) {
    const photo = message.photo[message.photo.length - 1];
    deliveries.push(
      await telegramRequest(botToken, 'sendPhoto', {
        chat_id: targetChatId,
        photo: photo.file_id,
        caption: formatCaption(message),
      })
    );
  } else if (message.document) {
    deliveries.push(
      await telegramRequest(botToken, 'sendDocument', {
        chat_id: targetChatId,
        document: message.document.file_id,
        caption: formatCaption(message),
      })
    );
  } else if (message.video) {
    deliveries.push(
      await telegramRequest(botToken, 'sendVideo', {
        chat_id: targetChatId,
        video: message.video.file_id,
        caption: formatCaption(message),
      })
    );
  } else if (message.audio) {
    deliveries.push(
      await telegramRequest(botToken, 'sendAudio', {
        chat_id: targetChatId,
        audio: message.audio.file_id,
        caption: formatCaption(message),
      })
    );
  } else if (message.animation) {
    deliveries.push(
      await telegramRequest(botToken, 'sendAnimation', {
        chat_id: targetChatId,
        animation: message.animation.file_id,
        caption: formatCaption(message),
      })
    );
  } else if (message.voice) {
    deliveries.push(await sendContextMessage(botToken, targetChatId, senderLine));
    deliveries.push(
      await telegramRequest(botToken, 'sendVoice', {
        chat_id: targetChatId,
        voice: message.voice.file_id,
      })
    );
    if (message.caption) {
      deliveries.push(await sendContextMessage(botToken, targetChatId, message.caption));
    }
  } else if (message.video_note) {
    deliveries.push(await sendContextMessage(botToken, targetChatId, senderLine));
    deliveries.push(
      await telegramRequest(botToken, 'sendVideoNote', {
        chat_id: targetChatId,
        video_note: message.video_note.file_id,
      })
    );
  } else if (message.sticker) {
    deliveries.push(await sendContextMessage(botToken, targetChatId, senderLine));
    deliveries.push(
      await telegramRequest(botToken, 'sendSticker', {
        chat_id: targetChatId,
        sticker: message.sticker.file_id,
      })
    );
  } else if (message.location) {
    deliveries.push(await sendContextMessage(botToken, targetChatId, senderLine));
    deliveries.push(
      await telegramRequest(botToken, 'sendLocation', {
        chat_id: targetChatId,
        latitude: message.location.latitude,
        longitude: message.location.longitude,
      })
    );
  } else if (message.contact) {
    deliveries.push(await sendContextMessage(botToken, targetChatId, senderLine));
    deliveries.push(
      await telegramRequest(botToken, 'sendContact', {
        chat_id: targetChatId,
        phone_number: message.contact.phone_number,
        first_name: message.contact.first_name,
        last_name: message.contact.last_name,
      })
    );
  } else {
    return { ok: true, skipped: 'unsupported_message_type', targetChatId };
  }

  return {
    ok: true,
    targetChatId,
    deliveries: deliveries.length,
    messageId: message.message_id ?? null,
  };
}
