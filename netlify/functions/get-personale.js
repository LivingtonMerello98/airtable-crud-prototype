export async function handler(event, context) {
  const API_URL = process.env.VITE_AIRTABLE_API_URL;
  const API_KEY = process.env.VITE_AIRTABLE_API_KEY;

  console.log('get-personale called');

  if (!API_URL || !API_KEY) {
    console.error('Missing Airtable environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Airtable environment variables' })
    };
  }

  try {
    const res = await fetch(`${API_URL}?pageSize=100`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Airtable fetch failed: ${res.status} ${res.statusText}`, text);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Airtable fetch failed: ${res.statusText}`, details: text })
      };
    }

    const data = await res.json();

    if (!data.records) {
      console.warn('No records found', data);
      return { statusCode: 200, body: JSON.stringify({ records: [] }) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.error('Serverless function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
