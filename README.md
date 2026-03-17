# 📱 Bot Telegram – Validatore Numeri + Link WhatsApp

Bot leggero, **zero dipendenze da Chrome**, hosting gratuito su Railway o Render.

---

## 🚀 Deploy su Railway (GRATUITO)

### Passo 1 – Carica il codice su GitHub

1. Vai su [github.com](https://github.com) → **New repository**
2. Nome: `telegram-wa-bot` (o quello che vuoi), lascia tutto il resto di default
3. Clicca **Create repository**
4. Nella pagina del repo appena creato, clicca **"uploading an existing file"**
5. Trascina dentro i file `bot.js` e `package.json`
6. Clicca **Commit changes**

---

### Passo 2 – Crea account Railway

1. Vai su [railway.app](https://railway.app)
2. Clicca **Login** → **Login with GitHub**
3. Autorizza Railway ad accedere a GitHub

---

### Passo 3 – Crea il progetto

1. Dashboard Railway → **New Project**
2. Scegli **Deploy from GitHub repo**
3. Seleziona il repo `telegram-wa-bot`
4. Railway rileva automaticamente Node.js e parte

---

### Passo 4 – Imposta il token Telegram

1. Nel progetto Railway, clicca sul servizio creato
2. Vai su tab **Variables**
3. Clicca **New Variable**
4. Nome: `TELEGRAM_TOKEN`
5. Valore: il token che ti ha dato @BotFather (es. `123456789:ABCdef...`)
6. Clicca **Add**

Railway riavvia automaticamente il bot con il token.

---

### Passo 5 – Verifica che funzioni

1. Vai su tab **Logs** nel progetto Railway
2. Devi vedere: `🤖  Bot avviato correttamente.`
3. Apri Telegram, cerca il tuo bot e invia `/start`

✅ **Fatto!** Il bot gira 24/7 gratis.

---

## 🤖 Comandi del bot

| Comando / Input | Risposta |
|---|---|
| `/start` | Benvenuto + istruzioni |
| `/help` | Spiegazione dettagliata |
| `3331234567` | Valida assumendo +39 (Italia) |
| `+39 333 1234567` | Valida con prefisso esplicito |
| `+1 415 555 0100` | Riconosce USA |
| `+4915123456789` | Riconosce Germania |

### Esempio di risposta del bot:
```
🇮🇹 Numero verificato

🔢 Internazionale: +39 333 123 4567
🏠 Nazionale: 333 123 4567
🌍 Paese: Italia (IT)
📱 Mobile

Link WhatsApp:
https://wa.me/39333123456
```

---

## ⚙️ Configurazione

### Cambiare paese di default
Nel file `bot.js`, riga 17:
```js
const DEFAULT_REGION = 'IT'; // cambia con: 'US', 'DE', 'FR', ecc.
```

---

## 🔄 Aggiornare il bot

Per modificare il bot dopo il deploy:
1. Modifica `bot.js` su GitHub (tasto matita nel file)
2. Railway fa il redeploy automatico in ~30 secondi

---

## 📦 Dipendenze

Solo 2 pacchetti leggeri, niente Chrome:
- `node-telegram-bot-api` — interfaccia Telegram
- `google-libphonenumber` — validazione numeri (libreria ufficiale Google)
