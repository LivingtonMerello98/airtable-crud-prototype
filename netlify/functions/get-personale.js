import fetch from 'node-fetch';

export async function handler(event, context) {
  const API_URL = process.env.VITE_AIRTABLE_API_URL;
  const API_KEY = process.env.VITE_AIRTABLE_API_KEY;

  try {
    const res = await fetch(`${API_URL}?pageSize=100`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
