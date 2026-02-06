import { writable } from 'svelte/store';
import type { NewsItem } from '$types';

interface HistoricalNewsState {
	items: NewsItem[];
	oldestTimestamp: number;
}

const RETENTION_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Store for historical news data used in anomaly detection
 * Maintains a rolling 24-hour window of news items
 */
function createHistoricalNewsStore() {
	const { subscribe, update } = writable<HistoricalNewsState>({
		items: [],
		oldestTimestamp: Date.now()
	});

	return {
		subscribe,

		/**
		 * Add new news items to historical data
		 */
		addItems(newItems: NewsItem[]) {
			update((state) => {
				const now = Date.now();
				const cutoffTime = now - RETENTION_PERIOD;

				// Combine with existing items
				const allItems = [...state.items, ...newItems];

				// Remove duplicates by link
				const uniqueItems = Array.from(
					new Map(allItems.map((item) => [item.link, item])).values()
				);

				// Prune items older than 24h
				const recentItems = uniqueItems.filter((item) => item.timestamp > cutoffTime);

				// Sort by timestamp (newest first)
				recentItems.sort((a, b) => b.timestamp - a.timestamp);

				return {
					items: recentItems,
					oldestTimestamp: recentItems.length > 0 ? recentItems[recentItems.length - 1].timestamp : now
				};
			});
		},

		/**
		 * Get all historical items
		 */
		getItems(): NewsItem[] {
			let items: NewsItem[] = [];
			subscribe((state) => {
				items = state.items;
			})();
			return items;
		},

		/**
		 * Clear all historical data
		 */
		clear() {
			update(() => ({
				items: [],
				oldestTimestamp: Date.now()
			}));
		},

		/**
		 * Manually prune old items (called automatically on add)
		 */
		prune() {
			update((state) => {
				const now = Date.now();
				const cutoffTime = now - RETENTION_PERIOD;
				const recentItems = state.items.filter((item) => item.timestamp > cutoffTime);

				return {
					items: recentItems,
					oldestTimestamp: recentItems.length > 0 ? recentItems[recentItems.length - 1].timestamp : now
				};
			});
		}
	};
}

export const historicalNews = createHistoricalNewsStore();
