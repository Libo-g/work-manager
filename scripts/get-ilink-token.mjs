// Get iLink Bot Token via QR code login
// Usage: node scripts/get-ilink-token.mjs

const BASE = 'https://ilinkai.weixin.qq.com';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  // Step 1: Get QR code
  const qrResp = await request('/ilink/bot/get_bot_qrcode?bot_type=3');
  console.log('📱 请用微信扫描以下二维码：\n');

  const qrcodeUrl = qrResp.qrcode_url || qrResp.url;
  if (qrcodeUrl) {
    console.log(qrcodeUrl);
  } else {
    // Try to generate a QR code URL that can be opened in browser
    const qrcode = qrResp.qrcode || qrResp.uuid;
    if (qrcode) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrcode)}`;
      console.log(`在浏览器打开: ${qrUrl}`);
    } else {
      console.log('Response:', JSON.stringify(qrResp, null, 2));
      console.log('\n请将上面的内容发给我，我帮你分析');
      return;
    }
  }

  // Step 2: Poll for scan
  const qrcode = qrResp.qrcode || qrResp.uuid;
  if (!qrcode) {
    console.log('\n⚠️ 无法获取扫码标识，请手动提取 token');
    return;
  }

  console.log('\n⏳ 等待扫码...');
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const status = await request(`/ilink/bot/get_qrcode_status?qrcode=${qrcode}`);
      if (status.status === 'confirmed') {
        console.log('\n✅ 扫码成功！');
        console.log(`\n   Token: ${status.token || status.bot_token}`);
        console.log('\n   复制上面的 Token，填入设置页的 iLink Bot Token');
        return;
      }
      if (status.status === 'expired') {
        console.log('\n❌ 二维码已过期，请重新运行');
        return;
      }
      if (i % 5 === 0) process.stdout.write('.');
    } catch {
      process.stdout.write('x');
    }
  }
  console.log('\n⏰ 超时，请重新运行');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
