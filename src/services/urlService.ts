import { supabase } from '../lib/supabase';

const BITLY_ACCESS_TOKEN = import.meta.env.VITE_BITLY_ACCESS_TOKEN;
const BITLY_API_URL = 'https://api-ssl.bitly.com/v4/shorten';

export const shortenUrl = async (longUrl: string): Promise<string> => {
  // If no Bitly token is configured, return the original URL
  if (!BITLY_ACCESS_TOKEN) {
    console.warn('Bitly access token not configured. Using original URL.');
    return longUrl;
  }

  try {
    const response = await fetch(BITLY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BITLY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        long_url: longUrl,
        domain: "bit.ly"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to shorten URL');
    }

    const data = await response.json();
    return data.link;
  } catch (error) {
    console.error('Error shortening URL:', error);
    // Return original URL if shortening fails
    return longUrl;
  }
};