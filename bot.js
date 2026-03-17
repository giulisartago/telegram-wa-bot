'use strict';

/**
 * ╔══════════════════════════════════════════════════════════╗
 *  Telegram Bot – Validatore Numeri + Link WhatsApp
 *  Hosting gratuito: Railway / Render / Fly.io
 *  Nessun Chrome, nessuna sessione WhatsApp necessaria
 * ╚══════════════════════════════════════════════════════════╝
 *
 *  VARIABILI D'AMBIENTE (impostale sulla piattaforma di hosting):
 *    TELEGRAM_TOKEN  →  token del bot da @BotFather
 *
 *  AVVIO LOCALE:
 *    TELEGRAM_TOKEN=xxx node bot.js
 */

const TelegramBot = require('node-telegram-bot-api');
const { PhoneNumberUtil, PhoneNumberFormat, PhoneNumberType } = require('google-libphonenumber');

// ── Configurazione ───────────────────────────────────────────
const TOKEN          = process.env.TELEGRAM_TOKEN || '';
const DEFAULT_REGION = 'IT'; // prefisso assunto se il numero non ha il +

if (!TOKEN) {
  console.error('❌  TELEGRAM_TOKEN non impostato! Imposta la variabile d\'ambiente.');
  process.exit(1);
}

const phoneUtil = PhoneNumberUtil.getInstance();
const bot       = new TelegramBot(TOKEN, { polling: true });

console.log('🤖  Bot avviato correttamente.');

// ════════════════════════════════════════════════════════════
//  PARSING E VALIDAZIONE NUMERO
// ════════════════════════════════════════════════════════════
function parseNumber(raw) {
  const input = raw.trim();
  let parsed;

  try {
    if (input.startsWith('+')) {
      parsed = phoneUtil.parse(input);
    } else {
      parsed = phoneUtil.parse(input, DEFAULT_REGION);
    }
  } catch {
    return null;
  }

  if (!phoneUtil.isValidNumber(parsed)) return null;

  const e164       = phoneUtil.format(parsed, PhoneNumberFormat.E164);          // +393331234567
  const intl       = phoneUtil.format(parsed, PhoneNumberFormat.INTERNATIONAL); // +39 333 123 4567
  const national   = phoneUtil.format(parsed, PhoneNumberFormat.NATIONAL);      // 333 123 4567
  const regionCode = phoneUtil.getRegionCodeForNumber(parsed);                   // IT, US …
  const numType    = phoneUtil.getNumberType(parsed);                            // MOBILE, FIXED_LINE …

  return { e164, intl, national, regionCode, numType };
}

// ════════════════════════════════════════════════════════════
//  HELPER: tipo numero → etichetta leggibile
// ════════════════════════════════════════════════════════════
function typeLabel(numType) {
  const map = {
    [PhoneNumberType.MOBILE]:             '📱 Mobile',
    [PhoneNumberType.FIXED_LINE]:         '☎️  Fisso',
    [PhoneNumberType.FIXED_LINE_OR_MOBILE]: '📱 Mobile o Fisso',
    [PhoneNumberType.TOLL_FREE]:          '🆓 Numero verde',
    [PhoneNumberType.PREMIUM_RATE]:       '💰 Premium rate',
    [PhoneNumberType.VOIP]:               '🌐 VoIP',
    [PhoneNumberType.PERSONAL_NUMBER]:    '👤 Personale',
    [PhoneNumberType.PAGER]:              '📟 Pager',
    [PhoneNumberType.UAN]:                '🏢 UAN',
    [PhoneNumberType.UNKNOWN]:            '❓ Sconosciuto',
  };
  return map[numType] ?? '❓ Sconosciuto';
}

// ════════════════════════════════════════════════════════════
//  HELPER: codice paese → emoji bandiera
// ════════════════════════════════════════════════════════════
function regionToFlag(code) {
  if (!code || code.length !== 2) return '🌐';
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

// ════════════════════════════════════════════════════════════
//  HELPER: nome paese dal codice ISO
// ════════════════════════════════════════════════════════════
function countryName(code) {
  try {
    return new Intl.DisplayNames(['it'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

// ════════════════════════════════════════════════════════════
//  HELPER: escape MarkdownV2
// ════════════════════════════════════════════════════════════
function esc(text) {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

// ════════════════════════════════════════════════════════════
//  HANDLER /start
// ════════════════════════════════════════════════════════════
bot.onText(/\/start/, (msg) => {
  const name = msg.from?.first_name || 'amico';
  bot.sendMessage(msg.chat.id,
    `👋 Ciao *${esc(name)}*\\!\n\n` +
    `Inviami un numero di cellulare e ti dirò:\n\n` +
    `✅ Se il formato è corretto\n` +
    `🌍 A quale paese appartiene\n` +
    `📱 Se è mobile o fisso\n` +
    `🔗 Il link diretto WhatsApp\n\n` +
    `*Esempi:*\n` +
    `• \`3331234567\` → assume prefisso italiano\n` +
    `• \`\\+39 333 1234567\`\n` +
    `• \`\\+1 415 555 0100\` → USA\n` +
    `• \`\\+4915123456789\` → Germania\n\n` +
    `Usa /help per maggiori info\\.`,
    { parse_mode: 'MarkdownV2' }
  );
});

// ════════════════════════════════════════════════════════════
//  HANDLER /help
// ════════════════════════════════════════════════════════════
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `ℹ️ *Come funziona*\n\n` +
    `Invia qualsiasi numero di telefono, con o senza prefisso internazionale\\.\n\n` +
    `Se ometti il prefisso \\(es\\. \`3331234567\`\\) il bot assume *\\.it* \\(\\+39\\)\\.\n\n` +
    `Il bot restituisce:\n` +
    `• Formato internazionale normalizzato\n` +
    `• Paese e tipo \\(mobile/fisso\\)\n` +
    `• Link cliccabile \`wa\\.me\` per aprire direttamente la chat WhatsApp\n\n` +
    `⚠️ Il link WhatsApp *non garantisce* che il numero sia registrato su WA — serve solo ad aprire la chat velocemente\\.`,
    { parse_mode: 'MarkdownV2' }
  );
});

// ════════════════════════════════════════════════════════════
//  HANDLER messaggi generici (numero di telefono)
// ════════════════════════════════════════════════════════════
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const input  = msg.text.trim();

  const data = parseNumber(input);

  if (!data) {
    bot.sendMessage(chatId,
      `❌ *Numero non valido*\n\n` +
      `\`${esc(input)}\` non sembra un numero di telefono riconoscibile\\.\n\n` +
      `Prova con il prefisso: \`\\+39 333 1234567\``,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  const { e164, intl, national, regionCode, numType } = data;
  const flag    = regionToFlag(regionCode);
  const country = countryName(regionCode);
  const type    = typeLabel(numType);
  const waLink  = `https://wa.me/${e164.replace('+', '')}`;

  // Costruiamo la risposta
  const reply =
    `${flag} *Numero verificato*\n\n` +
    `🔢 *Internazionale:* \`${esc(intl)}\`\n` +
    `🏠 *Nazionale:* \`${esc(national)}\`\n` +
    `🌍 *Paese:* ${esc(country)} \\(${esc(regionCode)}\\)\n` +
    `${type}\n\n` +
    `*Link WhatsApp:*\n` +
    `[Apri chat su WhatsApp](${waLink})\n` +
    `\`${esc(waLink)}\`\n\n` +
    `_Tocca il link per verificare direttamente se il numero è su WhatsApp_`;

  bot.sendMessage(chatId, reply, {
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true,
  });
});

// ════════════════════════════════════════════════════════════
//  Errori globali
// ════════════════════════════════════════════════════════════
bot.on('polling_error', (err) => console.error('Polling error:', err.message));
process.on('unhandledRejection', (r) => console.error('UnhandledRejection:', r));
