# NewsAPI.org Setup Guide

The Situation Monitor now uses **NewsAPI.org** for high-quality, reliable breaking news from major global sources.

## Why NewsAPI.org?

- ✅ **150,000+ news sources** worldwide
- ✅ **Real-time breaking news** from Reuters, Bloomberg, BBC, CNN, WSJ, NYT, etc.
- ✅ **Free tier**: 100 requests/day (perfect for development)
- ✅ **High reliability**: Trusted by Walmart, Samsung, Shopify
- ✅ **Better quality** than GDELT (no spam, no regional noise)

## Getting Your Free API Key

1. **Go to NewsAPI.org**
   - Visit: https://newsapi.org/register

2. **Sign Up**
   - Enter your email and choose a password
   - Select "Individual/Hobby" for the free tier

3. **Get Your API Key**
   - After registration, you'll see your API key immediately
   - It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

4. **Add to Your .env File**
   ```bash
   # Copy .env.example to .env if you haven't already
   cp .env.example .env
   
   # Edit .env and add your key:
   VITE_NEWS_API_KEY=your_actual_api_key_here
   ```

5. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## Free Tier Limits

- **100 requests per day**
- **Covers 7 categories** (politics, tech, finance, gov, ai, intel)
- **~14 requests per refresh** (one per category + breaking news)
- **~7 full refreshes per day** with the free tier

## Tips

- Set auto-refresh to **1 hour** to stay within limits
- Use **manual refresh** mode if you're testing frequently
- **Real-time streaming** uses additional requests (2 min intervals)
- Upgrade to paid tier ($449/mo) for production use with unlimited requests

## Troubleshooting

**"No news available"**
- Check that your API key is in the `.env` file
- Restart the dev server after adding the key
- Check browser console for error messages

**"HTTP 426" or "API key required"**
- Your API key is invalid or missing
- Make sure the key is correctly copied (no extra spaces)

**"HTTP 429" or rate limit errors**
- You've exceeded 100 requests/day
- Wait until tomorrow or upgrade to paid tier
- Switch to manual refresh mode

## Alternative: Keep Using GDELT (Free, No Key Required)

If you don't want to sign up for NewsAPI, you can revert to GDELT:
- GDELT is completely free with no API key
- But it has lower quality and more noise
- See git history to revert the news.ts changes
