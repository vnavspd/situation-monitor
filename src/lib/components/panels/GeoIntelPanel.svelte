<script lang="ts">
	import { geoIntel } from '$lib/stores/geo-intel';
	import { allNewsItems, alerts } from '$lib/stores/news';
	import { markets } from '$lib/stores/markets';
	import { analyzeCorrelations } from '$lib/analysis/correlation';
	import { analyzeNarratives } from '$lib/analysis/narrative';
	import type { NewsItem } from '$types';

	// Filter news by selected region
	const regionNews = $derived.by(() => {
		if (!$geoIntel.selectedRegion) return [];
		const regionName = $geoIntel.selectedRegion;
		return $allNewsItems.filter(
			(item) =>
				item.region === regionName ||
				item.title.includes(regionName) ||
				item.description?.includes(regionName)
		);
	});

	// Filter alerts by region
	const regionAlerts = $derived.by(() => {
		if (!$geoIntel.selectedRegion) return [];
		const regionName = $geoIntel.selectedRegion;
		return $alerts.filter(
			(item) =>
				item.region === regionName ||
				item.title.includes(regionName) ||
				item.description?.includes(regionName)
		);
	});

	// Analyze correlations for region
	const regionCorrelations = $derived.by(() => {
		if (regionNews.length === 0) return null;
		return analyzeCorrelations(regionNews);
	});

	// Extract entities from region news
	const regionEntities = $derived.by(() => {
		if (regionNews.length === 0) return [];

		// Simple entity extraction
		const entityCounts: Record<string, { count: number; articles: NewsItem[] }> = {};

		const patterns = [
			'Trump',
			'Biden',
			'Putin',
			'Xi Jinping',
			'Netanyahu',
			'Zelenskyy',
			'Iran',
			'China',
			'Russia',
			'Israel',
			'Hamas',
			'Hezbollah',
			'NATO',
			'UN',
			'Pentagon',
			'CIA'
		];

		for (const article of regionNews) {
			const text = `${article.title} ${article.description || ''}`;
			for (const entity of patterns) {
				const regex = new RegExp(`\\b${entity}\\b`, 'i');
				if (regex.test(text)) {
					if (!entityCounts[entity]) {
						entityCounts[entity] = { count: 0, articles: [] };
					}
					entityCounts[entity].count++;
					entityCounts[entity].articles.push(article);
				}
			}
		}

		return Object.entries(entityCounts)
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 5)
			.map(([name, data]) => ({ name, count: data.count }));
	});

	// Calculate risk score
	const riskScore = $derived.by(() => {
		if (regionNews.length === 0) return { level: 'LOW', score: 0 };

		let score = 0;

		// Alert density (0-30 points)
		const alertDensity = Math.min(regionAlerts.length / regionNews.length, 1);
		score += alertDensity * 30;

		// News volume (0-30 points)
		const volumeScore = Math.min(regionNews.length / 10, 1);
		score += volumeScore * 30;

		// Correlation intensity (0-20 points)
		if (regionCorrelations && regionCorrelations.emergingPatterns.length > 0) {
			score += Math.min(regionCorrelations.emergingPatterns.length * 5, 20);
		}

		// Narrative presence (0-20 points)
		const narratives = analyzeNarratives(regionNews);
		if (narratives && narratives.emergingFringe.length > 0) {
			score += Math.min(narratives.emergingFringe.length * 10, 20);
		}

		// Classify risk level
		let level = 'LOW';
		if (score > 75) level = 'CRITICAL';
		else if (score > 60) level = 'HIGH';
		else if (score > 40) level = 'ELEVATED';
		else if (score > 20) level = 'MODERATE';

		return { level, score: Math.round(score) };
	});

	const riskColors: Record<string, string> = {
		LOW: 'text-green-400 border-green-500',
		MODERATE: 'text-blue-400 border-blue-500',
		ELEVATED: 'text-yellow-400 border-yellow-500',
		HIGH: 'text-orange-400 border-orange-500',
		CRITICAL: 'text-red-400 border-red-500'
	};

	function formatCoords(coords: [number, number] | null): string {
		if (!coords) return 'N/A';
		const [lat, lon] = coords;
		const latDir = lat >= 0 ? 'N' : 'S';
		const lonDir = lon >= 0 ? 'E' : 'W';
		return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
	}

	function handleClose() {
		geoIntel.clearRegion();
	}
</script>

{#if $geoIntel.active}
	<div class="geo-intel-panel h-full flex flex-col">
		<div class="panel-header flex items-center justify-between p-4 border-b border-cyan-900/30">
			<div>
				<h2 class="text-lg font-bold text-cyan-400">{$geoIntel.selectedRegion}</h2>
				<div class="text-xs text-gray-400">{formatCoords($geoIntel.coordinates)}</div>
			</div>
			<button
				onclick={handleClose}
				class="text-gray-400 hover:text-red-400 transition-colors text-xl"
			>
				✕
			</button>
		</div>

		<div class="panel-content flex-1 overflow-y-auto p-4 space-y-4">
			<!-- Risk Assessment -->
			<section class="border-l-4 {riskColors[riskScore.level]} bg-gray-900/50 p-3 rounded">
				<h3 class="text-sm font-semibold uppercase mb-2">Risk Assessment</h3>
				<div class="flex items-baseline gap-2">
					<span class="text-2xl font-bold {riskColors[riskScore.level]}">
						{riskScore.level}
					</span>
					<span class="text-sm text-gray-400">({riskScore.score}/100)</span>
				</div>
			</section>

			<!-- News Intelligence -->
			<section class="bg-gray-900/50 p-3 rounded border border-cyan-900/30">
				<h3 class="text-sm font-semibold text-cyan-400 mb-2">News Intelligence</h3>
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-gray-400">Total Articles:</span>
						<span class="text-gray-200">{regionNews.length}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-400">Alerts:</span>
						<span class="text-red-400">{regionAlerts.length}</span>
					</div>
				</div>

				{#if regionAlerts.length > 0}
					<div class="mt-3 space-y-1">
						<h4 class="text-xs font-semibold text-red-400">Recent Alerts:</h4>
						{#each regionAlerts.slice(0, 3) as alert}
							<a
								href={alert.link}
								target="_blank"
								rel="noopener noreferrer"
								class="block text-xs text-red-400 hover:underline"
							>
								{alert.title}
							</a>
						{/each}
					</div>
				{/if}

				{#if regionNews.length > 0}
					<div class="mt-3 space-y-1">
						<h4 class="text-xs font-semibold text-gray-400">Latest Articles:</h4>
						{#each regionNews.slice(0, 5) as article}
							<a
								href={article.link}
								target="_blank"
								rel="noopener noreferrer"
								class="block text-xs text-cyan-400 hover:underline"
							>
								{article.title}
							</a>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Correlation Hotspots -->
			{#if regionCorrelations && regionCorrelations.emergingPatterns.length > 0}
				<section class="bg-gray-900/50 p-3 rounded border border-cyan-900/30">
					<h3 class="text-sm font-semibold text-cyan-400 mb-2">Correlation Hotspots</h3>
					<div class="space-y-2">
						{#each regionCorrelations.emergingPatterns.slice(0, 3) as pattern}
							<div class="text-xs">
								<div class="text-yellow-400">{pattern.name}</div>
								<div class="text-gray-400">
									{pattern.count} mentions | Level: {pattern.level}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Related Entities -->
			{#if regionEntities.length > 0}
				<section class="bg-gray-900/50 p-3 rounded border border-cyan-900/30">
					<h3 class="text-sm font-semibold text-cyan-400 mb-2">Key Entities</h3>
					<div class="space-y-1">
						{#each regionEntities as entity}
							<div class="flex justify-between text-xs">
								<span class="text-gray-200">{entity.name}</span>
								<span class="text-gray-400">{entity.count} mentions</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Market Impact -->
			<section class="bg-gray-900/50 p-3 rounded border border-cyan-900/30">
				<h3 class="text-sm font-semibold text-cyan-400 mb-2">Market Context</h3>
				<div class="space-y-2 text-xs">
					{#if $markets.indices.items.length > 0}
						<div>
							<span class="text-gray-400">VIX:</span>
							<span class="text-yellow-400 ml-2">
								{$markets.indices.items.find((i) => i.symbol === 'VIX')?.price?.toFixed(2) || 'N/A'}
							</span>
						</div>
					{/if}
					<div class="text-gray-500 text-xs">
						Monitor market reactions to regional developments
					</div>
				</div>
			</section>

			{#if regionNews.length === 0}
				<div class="text-center text-gray-500 py-8">
					<div class="text-2xl mb-2">📍</div>
					<div>No recent news for this region</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.geo-intel-panel {
		background: rgba(0, 8, 20, 0.95);
		border: 1px solid rgba(6, 182, 212, 0.2);
		border-radius: 4px;
	}

	.panel-content::-webkit-scrollbar {
		width: 6px;
	}

	.panel-content::-webkit-scrollbar-track {
		background: rgba(0, 8, 20, 0.5);
	}

	.panel-content::-webkit-scrollbar-thumb {
		background: rgba(6, 182, 212, 0.3);
		border-radius: 3px;
	}

	.panel-content::-webkit-scrollbar-thumb:hover {
		background: rgba(6, 182, 212, 0.5);
	}
</style>
