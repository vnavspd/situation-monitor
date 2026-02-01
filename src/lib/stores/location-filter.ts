/**
 * Location filter store - for filtering news by geographic location
 */

import { writable, derived } from 'svelte/store';

export interface LocationFilter {
	name: string | null;
	keywords: string[];
	lat: number | null;
	lon: number | null;
	radius: number; // in km
}

function createLocationFilterStore() {
	const { subscribe, set, update } = writable<LocationFilter>({
		name: null,
		keywords: [],
		lat: null,
		lon: null,
		radius: 500 // default 500km radius
	});

	return {
		subscribe,

		/**
		 * Set location filter
		 */
		setLocation(name: string, keywords: string[], lat: number, lon: number, radius = 500) {
			set({ name, keywords, lat, lon, radius });
		},

		/**
		 * Clear location filter
		 */
		clear() {
			set({ name: null, keywords: [], lat: null, lon: null, radius: 500 });
		},

		/**
		 * Check if filter is active
		 */
		isActive(): boolean {
			let active = false;
			subscribe((filter) => {
				active = filter.name !== null;
			})();
			return active;
		}
	};
}

export const locationFilter = createLocationFilterStore();

// Derived store - is filtering active
export const isLocationFilterActive = derived(
	locationFilter,
	($filter) => $filter.name !== null
);
