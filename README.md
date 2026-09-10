# Chatbot — free Groq + Gemini

A free, ChatGPT-style chat app built on the [Vercel chatbot template](https://github.com/vercel/chatbot). Primary model: **Llama 3.3 70B** via [Groq](https://groq.com). Optional failover: **Gemini 2.0 Flash** via Google AI Studio.

No paid OpenAI subscription required.

---

## English — quick start

### 1. Get a free Groq API key

1. Create an account at [console.groq.com](https://console.groq.com).
2. Open **API Keys** and create a key.
3. Copy the key — you will add it as `GROQ_API_KEY` (server-only).

### 2. Optional: Gemini Flash failover

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Create an API key.
3. Add it as `GOOGLE_GENERATIVE_AI_API_KEY`.

When Groq is unavailable, the app automatically retries with Gemini Flash (if this key is set). You can also pick **Gemini 2.0 Flash** in the model selector.

### 3. Run locally

```bash
cp .env.example .env.local
# Edit .env.local — at minimum set AUTH_SECRET and GROQ_API_KEY

pnpm install
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy on Vercel (Hobby — free)

1. Push this repo to GitHub ([rondpunt/chatbot](https://github.com/rondpunt/chatbot)).
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variables in **Project → Settings → Environment Variables**:

| Variable | Required | Notes |
|----------|----------|-------|
| `AUTH_SECRET` | Yes | Random 32+ char secret |
| `GROQ_API_KEY` | Yes | From Groq console |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini failover |
| `POSTGRES_URL` | Yes | Neon Postgres (free tier on Vercel Marketplace) |
| `BLOB_READ_WRITE_TOKEN` | No | File uploads only |
| `REDIS_URL` | No | Shared IP rate limits across instances + resumable streams |

4. Deploy. Vercel runs `pnpm build` (includes DB migrate).

**Security:** `GROQ_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY` are used only in server-side API routes. Never prefix them with `NEXT_PUBLIC_`.

**Rate limiting:** In production, every chat request is IP rate-limited (10/hour). Without `REDIS_URL`, a **per-instance in-memory sliding window** still applies and returns **429** when exceeded — it never fails open. Add `REDIS_URL` when you run multiple instances so limits are shared via Redis.

---

## Nederlands — snelle start

### 1. Gratis Groq API-sleutel

1. Maak een account op [console.groq.com](https://console.groq.com).
2. Ga naar **API Keys** en maak een sleutel aan.
3. Kopieer de sleutel — die wordt `GROQ_API_KEY` (alleen op de server).

### 2. Optioneel: Gemini Flash als fallback

1. Ga naar [Google AI Studio](https://aistudio.google.com/apikey).
2. Maak een API-sleutel aan.
3. Zet die in `GOOGLE_GENERATIVE_AI_API_KEY`.

Als Groq even niet beschikbaar is, probeert de app automatisch **Gemini Flash** (als deze sleutel staat). Je kunt Gemini ook handmatig kiezen in de modelkiezer.

### 3. Lokaal draaien

```bash
cp .env.example .env.local
# Vul minimaal AUTH_SECRET en GROQ_API_KEY in

pnpm install
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deployen op Vercel (Hobby — gratis)

1. Push naar GitHub ([rondpunt/chatbot](https://github.com/rondpunt/chatbot)).
2. Importeer het project op [Vercel](https://vercel.com/new).
3. Voeg omgevingsvariabelen toe onder **Project → Settings → Environment Variables** (zie tabel hierboven).
4. Deploy.

**Beveiliging:** API-sleutels horen **niet** in de browser. Gebruik geen `NEXT_PUBLIC_` prefix voor `GROQ_API_KEY` of Google-keys.

**Rate limiting:** In productie geldt een IP-limiet (10/uur). Zonder `REDIS_URL` blijft een **in-memory sliding window per instance** actief met **429** bij overschrijding — nooit fail-open. Gebruik `REDIS_URL` bij meerdere instances voor gedeelde limieten via Redis.

---

## Models

| Model | Provider | Role |
|-------|----------|------|
| Llama 3.3 70B | Groq | Default chat |
| Llama 3.1 8B Instant | Groq | Chat titles |
| Gemini 2.0 Flash | Google | Failover + manual selection |

Configured in `lib/ai/models.ts` and `lib/ai/providers.ts`.

---

## Stack

- [Next.js](https://nextjs.org) App Router
- [AI SDK](https://ai-sdk.dev) with `@ai-sdk/groq` and `@ai-sdk/google`
- [Auth.js](https://authjs.dev) for login
- [Neon Postgres](https://neon.tech) for chat history (via Vercel)

## License

See [LICENSE](LICENSE).
