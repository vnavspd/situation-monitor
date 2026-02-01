<script lang="ts">
	import type { NewsItem } from '$lib/types';

	interface Props {
		item: NewsItem;
	}

	let { item }: Props = $props();

	// Extract clean source name
	const sourceName = $derived(() => {
		const lower = item.source.toLowerCase();
		if (lower.includes('reuters')) return 'REUTERS';
		if (lower.includes('bloomberg')) return 'BLOOMBERG';
		if (lower.includes('bbc')) return 'BBC';
		if (lower.includes('cnn')) return 'CNN';
		if (lower.includes('cnbc')) return 'CNBC';
		if (lower.includes('ap news') || lower.includes('associated press')) return 'AP NEWS';
		if (lower.includes('guardian')) return 'THE GUARDIAN';
		if (lower.includes('wsj') || lower.includes('wall street')) return 'WSJ';
		if (lower.includes('nyt') || lower.includes('new york times')) return 'NYT';
		if (lower.includes('ft') || lower.includes('financial times')) return 'FT';
		if (lower.includes('politico')) return 'POLITICO';
		if (lower.includes('axios')) return 'AXIOS';
		return item.source.toUpperCase();
	});

	// Get region badge if available
	const regionBadge = $derived(() => {
		if (!item.region) return null;
		return item.region.toUpperCase();
	});

	// Get time in HH:MM format
	const timeString = $derived(() => {
		const date = new Date(item.timestamp);
		return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
	});
</script>

<a href={item.link} target="_blank" rel="noopener noreferrer" class="terminal-row" class:breaking={item.isAlert}>
	{#if item.image}
		<div class="thumbnail-col">
			<img 
				src={item.image} 
				alt="" 
				loading="lazy"
				onerror={(e) => { const target = e.currentTarget as HTMLImageElement; if (target.parentElement) target.parentElement.style.display = 'none'; }}
			/>
		</div>
	{/if}
	
	<div class="row-left">
		<span class="source-col">{sourceName()}</span>
		{#if regionBadge()}
			<span class="region-col">{regionBadge()}</span>
		{/if}
	</div>
	
	<div class="headline-col">{item.title}</div>
	
	<div class="time-col">{timeString()}</div>
</a>

<style>
	.terminal-row {
		display: grid;
		grid-template-columns: 80px 180px 1fr 60px;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		text-decoration: none;
		transition: background 0.1s ease;
		font-family: 'Courier New', 'Courier', monospace;
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.terminal-row:hover {
		background: rgba(217, 119, 6, 0.05);
	}

	.terminal-row.breaking {
		background: rgba(255, 0, 0, 0.05);
		border-left: 3px solid var(--terminal-orange);
		padding-left: calc(0.75rem - 3px);
	}

	.thumbnail-col {
		width: 80px;
		height: 60px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.05);
		flex-shrink: 0;
	}

	.thumbnail-col img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.row-left {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.source-col {
		color: var(--terminal-yellow);
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.7rem;
		letter-spacing: 0.03em;
	}

	.region-col {
		color: var(--terminal-blue);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.headline-col {
		color: var(--terminal-text);
		min-width: 0;
	}

	.terminal-row:hover .headline-col {
		color: var(--terminal-orange);
	}

	.time-col {
		color: var(--terminal-gray);
		text-align: right;
		font-size: 0.7rem;
		flex-shrink: 0;
	}

	@media (max-width: 1024px) {
		.terminal-row {
			grid-template-columns: 70px 140px 1fr 50px;
			gap: 0.6rem;
			font-size: 0.7rem;
		}

		.thumbnail-col {
			width: 70px;
			height: 52px;
		}
	}

	@media (max-width: 768px) {
		.terminal-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
			padding: 0.6rem 0.75rem;
		}

		.thumbnail-col {
			width: 100%;
			height: 120px;
		}

		.time-col {
			text-align: left;
			font-size: 0.65rem;
		}
	}
</style>
