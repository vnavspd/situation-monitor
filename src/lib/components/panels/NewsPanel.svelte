<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import type { NewsCategory } from '$lib/types';
	import type { PanelId } from '$lib/config';
	import { politicsNews, techNews, financeNews, govNews, aiNews, intelNews } from '$lib/stores';

	interface Props {
		category: NewsCategory;
		panelId: PanelId;
		title: string;
	}

	let { category, panelId, title }: Props = $props();

	// Get the appropriate derived store based on category
	const categoryStores = {
		politics: politicsNews,
		tech: techNews,
		finance: financeNews,
		gov: govNews,
		ai: aiNews,
		intel: intelNews
	};

	const categoryStore = $derived(categoryStores[category]);
	const items = $derived($categoryStore.items);
	const loading = $derived($categoryStore.loading);
	const error = $derived($categoryStore.error);
	const count = $derived(items.length);
</script>

<Panel id={panelId} {title} {count} {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">
			<p>No news available</p>
			<p class="empty-hint">Check your NewsAPI.org key in .env file</p>
		</div>
	{:else}
		<div class="news-list">
			{#each items.slice(0, 20) as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.news-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 2rem 1rem;
	}

	.empty-state p {
		margin: 0.5rem 0;
	}

	.empty-hint {
		font-size: 0.6rem;
		color: var(--text-muted);
		font-family: 'Courier New', 'Courier', monospace;
	}
</style>
