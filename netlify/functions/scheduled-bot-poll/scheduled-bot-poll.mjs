export default async () => {
  const siteUrl = process.env.URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${siteUrl}/api/bot/poll`);
    const body = await res.text();
    console.log('Bot poll:', body);
    return { statusCode: res.status, body };
  } catch (err) {
    console.error('Bot poll failed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
