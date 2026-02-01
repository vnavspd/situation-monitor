/**
 * News API - Fetch news from NewsAPI.org
 */

import type { NewsItem, NewsCategory } from '$lib/types';
import { containsAlertKeyword, detectRegion, detectTopics } from '$lib/config/keywords';
import { API_DELAYS, logger } from '$lib/config/api';
import { browser } from '$app/environment';

const NEWS_API_KEY = browser ? import.meta.env.VITE_NEWS_API_KEY || '' : '';
const NEWS_API_BASE = 'https://newsapi.org/v2';

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * NewsAPI.org article interface
 */
interface NewsAPIArticle {
	source: {
		id: string | null;
		name: string;
	};
	author: string | null;
	title: string;
	description: string | null;
	url: string;
	urlToImage: string | null;
	publishedAt: string;
	content: string | null;
}

interface NewsAPIResponse {
	status: string;
	totalResults: number;
	articles: NewsAPIArticle[];
}

/**
 * Transform NewsAPI article to NewsItem
 */
function transformNewsAPIArticle(
	article: NewsAPIArticle,
	category: NewsCategory
): NewsItem {
	const title = article.title || '';
	const description = article.description || '';
	const text = `${title} ${description}`;
	const alert = containsAlertKeyword(text);
	const publishedDate = new Date(article.publishedAt);

	return {
		id: `newsapi-${category}-${article.url}`,
		title,
		description,
		link: article.url,
		pubDate: article.publishedAt,
		timestamp: publishedDate.getTime(),
		source: article.source.name,
		category,
		image: article.urlToImage || undefined,
		isAlert: !!alert,
		alertKeyword: alert?.keyword || undefined,
		region: detectRegion(text) ?? undefined,
		topics: detectTopics(text)
	};
}

/**
 * Fetch news for a specific category using NewsAPI.org
 */
export async function fetchCategoryNews(category: NewsCategory): Promise<NewsItem[]> {
	if (!NEWS_API_KEY) {
		logger.warn('News API', 'No API key configured. Get one at https://newsapi.org/register');
		return [];
	}

	// Map categories to NewsAPI.org queries
	const categoryQueries: Record<NewsCategory, string> = {
		politics: 'geopolitics OR sanctions OR "international relations" OR summit OR diplomacy',
		tech: 'technology OR cybersecurity OR semiconductor OR "tech regulation"',
		finance: '"stock market" OR "interest rates" OR inflation OR recession OR "central bank"',
		gov: '"federal reserve" OR "white house" OR treasury OR congress OR regulation',
		ai: '"artificial intelligence" OR "machine learning" OR ChatGPT OR OpenAI',
		intel: 'military OR defense OR intelligence OR conflict OR terrorism OR espionage'
	};

	try {
		const query = categoryQueries[category];
		// Use /everything endpoint for broader search with quality sources
		const url = new URL(`${NEWS_API_BASE}/everything`);
		url.searchParams.set('q', query);
		url.searchParams.set('language', 'en');
		url.searchParams.set('sortBy', 'publishedAt');
		url.searchParams.set('pageSize', '20');
		url.searchParams.set('apiKey', NEWS_API_KEY);
		// Filter to reputable sources
		url.searchParams.set(
			'domains',
			'reuters.com,bloomberg.com,bbc.com,bbc.co.uk,cnn.com,cnbc.com,apnews.com,theguardian.com,wsj.com,nytimes.com,ft.com,politico.com,axios.com,washingtonpost.com'
		);

		logger.log('News API', `Fetching ${category} from NewsAPI.org`);

		const response = await fetch(url.toString());
		if (!response.ok) {
			if (response.status === 426) {
				logger.error('News API', 'API key required or invalid. Get one at https://newsapi.org/register');
			}
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: NewsAPIResponse = await response.json();

		if (data.status !== 'ok' || !data.articles) {
			logger.warn('News API', `No articles for ${category}`);
			return [];
		}

		return data.articles
			.filter((article) => article.title && article.url)
			.map((article) => transformNewsAPIArticle(article, category));
	} catch (error) {
		logger.error('News API', `Error fetching ${category}:`, error);
		return [];
	}
}

/** All news categories in fetch order */
const NEWS_CATEGORIES: NewsCategory[] = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'];

/** Create an empty news result object */
function createEmptyNewsResult(): Record<NewsCategory, NewsItem[]> {
	return { politics: [], tech: [], finance: [], gov: [], ai: [], intel: [] };
}

/**
 * Fetch all news - sequential with delays to avoid rate limiting
 */
export async function fetchAllNews(): Promise<Record<NewsCategory, NewsItem[]>> {
	const result = createEmptyNewsResult();

	for (let i = 0; i < NEWS_CATEGORIES.length; i++) {
		const category = NEWS_CATEGORIES[i];

		if (i > 0) {
			await delay(API_DELAYS.betweenCategories);
		}

		result[category] = await fetchCategoryNews(category);
	}

	return result;
}

/**
 * Fetch real-time breaking news using NewsAPI.org top-headlines
 */
export async function fetchBreakingNews(): Promise<NewsItem[]> {
	if (!NEWS_API_KEY) {
		logger.warn('News API', 'No API key configured for breaking news');
		return [];
	}

	try {
		// Use /top-headlines endpoint for breaking news
		const url = new URL(`${NEWS_API_BASE}/top-headlines`);
		url.searchParams.set('country', 'us');
		url.searchParams.set('pageSize', '10');
		url.searchParams.set('apiKey', NEWS_API_KEY);

		logger.log('News API', 'Fetching breaking news from NewsAPI.org');

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: NewsAPIResponse = await response.json();

		if (data.status !== 'ok' || !data.articles) {
			return [];
		}

		return data.articles
			.filter((article) => article.title && article.url)
			.map((article) => transformNewsAPIArticle(article, 'politics'));
	} catch (error) {
		logger.error('News API', 'Error fetching breaking news:', error);
		return [];
	}
}
