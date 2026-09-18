const { handleOptions, setCorsHeaders, sendJson } = require('../lib/http');

const LANG_CODE_MAP = {
  en: 'en',
  hi: 'hi',
  bn: 'bn',
  ta: 'ta',
  te: 'te',
  mr: 'mr',
  gu: 'gu',
  kn: 'kn',
  pa: 'pa'
};

function cleanTextForSpeech(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[DONE\]/g, '')
    .replace(/[\*\#\_\`\~\-\•]/g, ' ')
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function chunkText(text, maxLength = 180) {
  if (!text) return [];
  const rawSentences = text.match(/[^.!?।\n]+[.!?।\n]?/g) || [text];
  const chunks = [];

  let currentChunk = '';
  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + ' ' + trimmed).length <= maxLength) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (trimmed.length > maxLength) {
        const words = trimmed.split(' ');
        let subChunk = '';
        for (const word of words) {
          if ((subChunk + ' ' + word).length <= maxLength) {
            subChunk = subChunk ? `${subChunk} ${word}` : word;
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = word;
          }
        }
        if (subChunk) currentChunk = subChunk;
        else currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let text = parsedUrl.searchParams.get('text') || '';
  let lang = (parsedUrl.searchParams.get('lang') || 'bn').toLowerCase();

  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    if (body) {
      try {
        const json = JSON.parse(body);
        if (json.text) text = json.text;
        if (json.lang) lang = String(json.lang).toLowerCase();
      } catch (_) {}
    }
  }

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    return sendJson(res, 400, { success: false, error: 'No valid text provided for speech.' });
  }

  const targetLang = LANG_CODE_MAP[lang] || 'bn';
  const chunks = chunkText(clean, 180).slice(0, 10);

  try {
    const audioBuffers = await Promise.all(
      chunks.map(async (chunk) => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLang}&client=tw-ob`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (!response.ok) {
          throw new Error(`TTS upstream error: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    const combinedBuffer = Buffer.concat(audioBuffers);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': combinedBuffer.length,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(combinedBuffer);
  } catch (error) {
    console.error('TTS handler error:', error);
    return sendJson(res, 502, {
      success: false,
      error: 'Failed to generate high-quality speech audio.'
    });
  }
};
