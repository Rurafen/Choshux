export default {
  async fetch(request, env, ctx) {
    let quote = "";
    let isError = false;
    let errorMessage = "";

    try {
      if (!env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY が設定されていません。Cloudflareの環境変数を確認してください。");
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

      const prompt = "今日を生きる人に寄り添い、背中をそっと押してくれるような、心に響く短い名言（日本語）を1つ生成してください。挨拶や前置き、解説、「」などの記号は含めず、名言の言葉のみを1〜2行で端的に出力してください。";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 120,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const detail = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(`Gemini API エラー: ${detail}`);
      }

      const data = await res.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!generatedText) {
        throw new Error("名言の生成結果が空でした。もう一度お試しください。");
      }

      quote = generatedText;
    } catch (err) {
      isError = true;
      errorMessage = err.message || "予期しないエラーが発生しました。";
    }

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>今日の名言 | Daily Quote</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    :root {
      --bg-color: #0c0d12;
      --card-bg: rgba(22, 24, 34, 0.65);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-border-glow: rgba(147, 197, 253, 0.15);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #6366f1;
      --accent-gradient: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
      --error-color: #f87171;
    }
    body {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--bg-color);
      color: var(--text-main);
      font-family: 'Shippori Mincho', serif;
      overflow-x: hidden;
      position: relative;
      padding: 24px;
    }
    /* 背景のグラデーションオーブ */
    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.35;
      pointer-events: none;
      z-index: 0;
      animation: pulse 8s ease-in-out infinite alternate;
    }
    .orb-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #4f46e5, transparent 70%);
      top: 15%;
      left: 15%;
    }
    .orb-2 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, #9333ea, transparent 70%);
      bottom: 15%;
      right: 15%;
      animation-delay: -4s;
    }
    @keyframes pulse {
      0% { transform: scale(1) translate(0, 0); opacity: 0.25; }
      100% { transform: scale(1.15) translate(20px, 20px); opacity: 0.45; }
    }
    /* メインカード */
    .card {
      position: relative;
      z-index: 1;
      max-width: 680px;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px var(--card-border-glow);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 48px 40px;
      text-align: center;
      animation: fadeIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(24px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 6px 14px;
      border-radius: 9999px;
      margin-bottom: 28px;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 8px #34d399;
    }
    .quote-icon {
      font-size: 2.5rem;
      line-height: 1;
      opacity: 0.25;
      margin-bottom: 16px;
      user-select: none;
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .quote-text {
      font-size: 1.65rem;
      line-height: 1.8;
      font-weight: 500;
      letter-spacing: 0.05em;
      color: #f9fafb;
      margin: 0 auto 36px;
      word-break: keep-all;
      overflow-wrap: break-word;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }
    .error-container {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 28px;
      color: var(--error-color);
      font-size: 0.95rem;
      line-height: 1.6;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .error-title {
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-top: 10px;
    }
    .btn {
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 26px;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: var(--accent-gradient);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
      opacity: 0.95;
    }
    .btn:active {
      transform: translateY(0);
    }
    .footer {
      margin-top: 36px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="glow-orb orb-1"></div>
  <div class="glow-orb orb-2"></div>

  <main class="card">
    <div class="badge">
      <span class="badge-dot"></span>
      Generated by Gemini 1.5 Flash
    </div>

    <div class="quote-icon">“</div>

    ${
      isError
        ? `<div class="error-container">
             <div class="error-title">⚠️ 取得エラー</div>
             <div>${escapeHtml(errorMessage)}</div>
           </div>`
        : `<h1 class="quote-text">${escapeHtml(quote)}</h1>`
    }

    <div class="actions">
      <button class="btn" onclick="location.reload()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        新しい言葉を受け取る
      </button>
    </div>

    <div class="footer">
      Powered by Cloudflare Workers & Gemini API
    </div>
  </main>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    });
  },
};

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}