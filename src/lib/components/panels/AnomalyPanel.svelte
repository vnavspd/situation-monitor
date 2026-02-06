<script lang="ts">
	import { anomalies } from '$lib/stores/anomalies';
	import type { Anomaly } from '$lib/analysis/anomaly';

	const severityColors = {
		critical: 'text-red-400 border-red-500',
		high: 'text-orange-400 border-orange-500',
		medium: 'text-yellow-400 border-yellow-500',
		low: 'text-blue-400 border-blue-500'
	};

	const typeIcons = {
		'mention-spike': '📈',
		'velocity-surge': '⚡',
		'silent-source': '🔇'
	};

	function formatTimestamp(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
		return date.toLocaleString();
	}

	function handleDismiss(id: string) {
		anomalies.clearAnomaly(id);
	}

	function handleViewArticles(anomaly: Anomaly) {
		// TODO: Integrate with news panel to show filtered articles
		console.log('View articles for anomaly:', anomaly);
	}

	// Group anomalies by severity
	let groupedAnomalies = $derived({
		critical: $anomalies.anomalies.filter((a) => a.severity === 'critical'),
		high: $anomalies.anomalies.filter((a) => a.severity === 'high'),
		medium: $anomalies.anomalies.filter((a) => a.severity === 'medium'),
		low: $anomalies.anomalies.filter((a) => a.severity === 'low')
	});

	let totalCount = $derived($anomalies.anomalies.length);
</script>

<div class="anomaly-panel h-full flex flex-col">
	<div class="panel-header flex items-center justify-between p-4 border-b border-cyan-900/30">
		<h2 class="text-lg font-bold text-cyan-400">
			Anomaly Detection
			{#if totalCount > 0}
				<span class="ml-2 text-sm text-gray-400">({totalCount})</span>
			{/if}
		</h2>
		{#if totalCount > 0}
			<button
				onclick={() => anomalies.clearAll()}
				class="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
			>
				Dismiss All
			</button>
		{/if}
	</div>

	<div class="panel-content flex-1 overflow-y-auto p-4 space-y-4">
		{#if totalCount === 0}
			<div class="text-center text-gray-500 py-8">
				<div class="text-4xl mb-2">✓</div>
				<div>No anomalies detected</div>
				<div class="text-xs mt-1">System monitoring normally</div>
			</div>
		{:else}
			{#each (['critical', 'high', 'medium', 'low'] as const) as severity}
				{#if groupedAnomalies[severity].length > 0}
					<div class="severity-group">
						<h3 class="text-sm font-semibold uppercase {severityColors[severity].split(' ')[0]} mb-2">
							{severity} ({groupedAnomalies[severity].length})
						</h3>
						<div class="space-y-2">
							{#each groupedAnomalies[severity] as anomaly (anomaly.id)}
								<div
									class="anomaly-card border-l-4 {severityColors[anomaly.severity]} bg-gray-900/50 p-3 rounded"
								>
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<div class="flex items-center gap-2 mb-1">
												<span class="text-xl">{typeIcons[anomaly.type]}</span>
												<span class="text-xs text-gray-400 uppercase">{anomaly.type}</span>
												<span class="text-xs text-gray-500">{formatTimestamp(anomaly.timestamp)}</span>
											</div>
											<div class="text-sm text-gray-200 mb-2">
												{anomaly.description}
											</div>
											{#if anomaly.entity}
												<div class="text-xs text-cyan-400">Entity: {anomaly.entity}</div>
											{/if}
											{#if anomaly.topic}
												<div class="text-xs text-cyan-400">Topic: {anomaly.topic}</div>
											{/if}
											{#if anomaly.source}
												<div class="text-xs text-orange-400">Source: {anomaly.source}</div>
											{/if}
											<div class="text-xs text-gray-500 mt-1">
												Threshold: {anomaly.threshold.toFixed(1)} | Current: {anomaly.current.toFixed(1)}
											</div>
										</div>
										<div class="flex flex-col gap-1 ml-2">
											{#if anomaly.relatedArticles.length > 0}
												<button
													onclick={() => handleViewArticles(anomaly)}
													class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap"
												>
													View ({anomaly.relatedArticles.length})
												</button>
											{/if}
											<button
												onclick={() => handleDismiss(anomaly.id)}
												class="text-xs text-gray-400 hover:text-red-400 transition-colors"
											>
												Dismiss
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style>
	.anomaly-panel {
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
