import { writable } from 'svelte/store';
import { locationFilter } from './location-filter';

export interface GeoIntelState {
	selectedRegion: string | null;
	coordinates: [number, number] | null;
	active: boolean;
}

/**
 * Store for geographic intelligence focused analysis
 */
function createGeoIntelStore() {
	const { subscribe, update } = writable<GeoIntelState>({
		selectedRegion: null,
		coordinates: null,
		active: false
	});

	return {
		subscribe,

		/**
		 * Select a region for analysis
		 */
		selectRegion(name: string, coords: [number, number]) {
			update(() => ({
				selectedRegion: name,
				coordinates: coords,
				active: true
			}));

			// Trigger location filter
			locationFilter.setLocation(name, [], coords[0], coords[1], 0);
		},

		/**
		 * Clear selected region
		 */
		clearRegion() {
			update(() => ({
				selectedRegion: null,
				coordinates: null,
				active: false
			}));

			locationFilter.clear();
		},

		/**
		 * Check if a region is currently selected
		 */
		isActive(): boolean {
			let active = false;
			subscribe((state) => {
				active = state.active;
			})();
			return active;
		}
	};
}

export const geoIntel = createGeoIntelStore();
