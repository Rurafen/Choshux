export default {
    async fetch(request, env, ctx) {
        const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Choshux Opening</title>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; background-color: #202124; color: #ffffff; margin: 0;}
          h1 { font-size: 3rem; }
        </style>
      </head>
      <body>
        <div>
          <h1>Welcome to Choshux!</h1>
          <p>Vibeコーディングの世界へようこそ🚀 自動デプロイテスト</p>
        </div>
      </body>
      </html>
    `;
        return new Response(html, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        });
    },
};