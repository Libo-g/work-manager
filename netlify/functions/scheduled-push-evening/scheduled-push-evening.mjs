export default async () => {
  const siteUrl = process.env.URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${siteUrl}/api/cron/push?type=evening`);
    const body = await res.text();
    console.log('Evening push:', body);
    return { statusCode: res.status, body };
  } catch (err) {
    console.error('Evening push failed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
