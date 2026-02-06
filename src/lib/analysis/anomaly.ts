import type { NewsItem } from '$types';

export interface Anomaly {
	id: string;
	type: 'mention-spike' | 'velocity-surge' | 'silent-source';
	severity: 'low' | 'medium' | 'high' | 'critical';
	entity?: string;
	topic?: string;
	source?: string;
	description: string;
	baseline: number;
	current: number;
	threshold: number;
	timestamp: number;
	relatedArticles: NewsItem[];
}

interface EntityMentions {
	[entity: string]: {
		count: number;
		articles: NewsItem[];
	};
}

interface TopicVelocity {
	[topic: string]: {
		count: number;
		articles: NewsItem[];
	};
}

/**
 * Detect anomalies in news data: mention spikes, velocity surges, and silent sources
 */
export function detectAnomalies(
	currentNews: NewsItem[],
	historicalData: NewsItem[],
	lastUpdateTimes: Record<string, number>
): Anomaly[] {
	const anomalies: Anomaly[] = [];
	const now = Date.now();

	// 1. Mention Spike Detection
	const mentionSpikes = detectMentionSpikes(currentNews, historicalData, now);
	anomalies.push(...mentionSpikes);

	// 2. Velocity Surge Detection
	const velocitySurges = detectVelocitySurges(currentNews, historicalData, now);
	anomalies.push(...velocitySurges);

	// 3. Silent Source Detection
	const silentSources = detectSilentSources(lastUpdateTimes, now);
	anomalies.push(...silentSources);

	return anomalies;
}

/**
 * Detect unusual spikes in entity mentions
 */
function detectMentionSpikes(
	currentNews: NewsItem[],
	historicalData: NewsItem[],
	timestamp: number
): Anomaly[] {
	const anomalies: Anomaly[] = [];

	// Extract entities to track (prominent figures from analysis config)
	const entitiesToTrack = [
		'Trump',
		'Biden',
		'Xi Jinping',
		'Putin',
		'Zelenskyy',
		'Netanyahu',
		'Modi',
		'Musk',
		'Altman',
		'Iran',
		'China',
		'Russia',
		'Israel',
		'Ukraine',
		'Taiwan',
		'Gaza'
	];

	// Calculate mention rates in current hour vs historical baseline
	const oneHourAgo = timestamp - 60 * 60 * 1000;
	const recentNews = currentNews.filter((item) => item.timestamp > oneHourAgo);

	for (const entity of entitiesToTrack) {
		// Current hourly rate
		const currentMentions = countEntityMentions(recentNews, entity);

		// Historical baseline (24h average hourly rate)
		const historicalHourlyRate = calculateHistoricalRate(historicalData, entity);

		if (historicalHourlyRate === 0) continue; // No baseline data

		// Calculate standard deviation
		const stdDev = calculateStdDev(historicalData, entity);

		// Detect spike: current > mean + 3σ
		const threshold = historicalHourlyRate + 3 * stdDev;

		if (currentMentions.count > threshold && currentMentions.count > 5) {
			const severity = calculateSeverity(currentMentions.count, threshold);

			anomalies.push({
				id: `spike-${entity}-${timestamp}`,
				type: 'mention-spike',
				severity,
				entity,
				description: `Unusual spike in mentions of "${entity}": ${currentMentions.count} mentions (baseline: ${Math.round(historicalHourlyRate)})`,
				baseline: historicalHourlyRate,
				current: currentMentions.count,
				threshold,
				timestamp,
				relatedArticles: currentMentions.articles
			});
		}
	}

	return anomalies;
}

/**
 * Detect unusual surge in article publication rate by topic
 */
function detectVelocitySurges(
	currentNews: NewsItem[],
	historicalData: NewsItem[],
	timestamp: number
): Anomaly[] {
	const anomalies: Anomaly[] = [];

	// Track velocity by topic/region
	const topics = ['Iran', 'China', 'Russia', 'Israel', 'Ukraine', 'Taiwan', 'Gaza', 'Syria'];

	const oneHourAgo = timestamp - 60 * 60 * 1000;
	const recentNews = currentNews.filter((item) => item.timestamp > oneHourAgo);

	for (const topic of topics) {
		const currentRate = countTopicArticles(recentNews, topic);
		const historicalRate = calculateTopicHistoricalRate(historicalData, topic);

		if (historicalRate === 0) continue;

		// Detect surge: current > 5x historical average
		const surgeFactor = 5;
		const threshold = historicalRate * surgeFactor;

		if (currentRate.count > threshold && currentRate.count > 3) {
			const severity = currentRate.count > threshold * 2 ? 'critical' : 'high';

			anomalies.push({
				id: `surge-${topic}-${timestamp}`,
				type: 'velocity-surge',
				severity,
				topic,
				description: `Article surge for "${topic}": ${currentRate.count} articles/hour (normal: ${Math.round(historicalRate)})`,
				baseline: historicalRate,
				current: currentRate.count,
				threshold,
				timestamp,
				relatedArticles: currentRate.articles
			});
		}
	}

	return anomalies;
}

/**
 * Detect sources that have gone silent
 */
function detectSilentSources(
	lastUpdateTimes: Record<string, number>,
	timestamp: number
): Anomaly[] {
	const anomalies: Anomaly[] = [];

	// Expected update intervals by category (in milliseconds)
	const expectedIntervals: Record<string, number> = {
		politics: 30 * 60 * 1000, // 30 minutes
		tech: 45 * 60 * 1000, // 45 minutes
		finance: 30 * 60 * 1000, // 30 minutes
		government: 60 * 60 * 1000, // 1 hour
		ai: 60 * 60 * 1000, // 1 hour
		intel: 30 * 60 * 1000 // 30 minutes
	};

	for (const [category, lastUpdate] of Object.entries(lastUpdateTimes)) {
		const expectedInterval = expectedIntervals[category] || 60 * 60 * 1000;
		const silenceThreshold = expectedInterval * 2; // Flag if silent for 2x normal interval
		const timeSinceUpdate = timestamp - lastUpdate;

		if (timeSinceUpdate > silenceThreshold) {
			const severity = timeSinceUpdate > silenceThreshold * 2 ? 'high' : 'medium';

			anomalies.push({
				id: `silent-${category}-${timestamp}`,
				type: 'silent-source',
				severity,
				source: category,
				description: `"${category}" feed silent for ${Math.round(timeSinceUpdate / 60000)} minutes (expected: ${Math.round(expectedInterval / 60000)}min)`,
				baseline: expectedInterval,
				current: timeSinceUpdate,
				threshold: silenceThreshold,
				timestamp,
				relatedArticles: []
			});
		}
	}

	return anomalies;
}

/**
 * Count mentions of entity in news articles
 */
function countEntityMentions(news: NewsItem[], entity: string): EntityMentions[string] {
	const regex = new RegExp(`\\b${entity}\\b`, 'i');
	const articles = news.filter(
		(item) => regex.test(item.title) || regex.test(item.description || '')
	);

	return {
		count: articles.length,
		articles
	};
}

/**
 * Calculate historical average hourly mention rate
 */
function calculateHistoricalRate(historicalData: NewsItem[], entity: string): number {
	if (historicalData.length === 0) return 0;

	const mentions = countEntityMentions(historicalData, entity);
	const timeSpanHours = 24; // Assuming 24h of historical data

	return mentions.count / timeSpanHours;
}

/**
 * Calculate standard deviation of mention rates
 */
function calculateStdDev(historicalData: NewsItem[], entity: string): number {
	if (historicalData.length === 0) return 0;

	// Group by hour and calculate mention counts
	const hourlyMentions: number[] = [];
	const now = Date.now();

	for (let i = 0; i < 24; i++) {
		const hourStart = now - (i + 1) * 60 * 60 * 1000;
		const hourEnd = now - i * 60 * 60 * 1000;
		const hourNews = historicalData.filter(
			(item) => item.timestamp >= hourStart && item.timestamp < hourEnd
		);
		const mentions = countEntityMentions(hourNews, entity);
		hourlyMentions.push(mentions.count);
	}

	const mean = hourlyMentions.reduce((sum, val) => sum + val, 0) / hourlyMentions.length;
	const variance =
		hourlyMentions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / hourlyMentions.length;

	return Math.sqrt(variance);
}

/**
 * Count articles mentioning a topic
 */
function countTopicArticles(news: NewsItem[], topic: string): TopicVelocity[string] {
	const regex = new RegExp(`\\b${topic}\\b`, 'i');
	const articles = news.filter(
		(item) => regex.test(item.title) || regex.test(item.description || '')
	);

	return {
		count: articles.length,
		articles
	};
}

/**
 * Calculate historical average hourly article rate for topic
 */
function calculateTopicHistoricalRate(historicalData: NewsItem[], topic: string): number {
	if (historicalData.length === 0) return 0;

	const articles = countTopicArticles(historicalData, topic);
	const timeSpanHours = 24;

	return articles.count / timeSpanHours;
}

/**
 * Calculate anomaly severity based on threshold crossing
 */
function calculateSeverity(current: number, threshold: number): Anomaly['severity'] {
	const ratio = current / threshold;

	if (ratio > 3) return 'critical';
	if (ratio > 2) return 'high';
	if (ratio > 1.5) return 'medium';
	return 'low';
}
