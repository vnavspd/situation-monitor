import { writable, derived } from 'svelte/store';
import type { Anomaly } from '$lib/analysis/anomaly';

interface AnomaliesState {
	anomalies: Anomaly[];
	history: Anomaly[];
}

const MAX_HISTORY = 100;
const AUTO_DISMISS_TIME = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Store for anomaly detections with history tracking
 */
function createAnomaliesStore() {
	const { subscribe, update } = writable<AnomaliesState>({
		anomalies: [],
		history: []
	});

	return {
		subscribe,

		/**
		 * Replace current anomalies with new detections
		 */
		setAnomalies(anomalies: Anomaly[]) {
			update((state) => {
				const now = Date.now();

				// Auto-dismiss anomalies older than 6 hours
				const activeAnomalies = anomalies.filter(
					(a) => now - a.timestamp < AUTO_DISMISS_TIME
				);

				// Add dismissed anomalies to history
				const dismissed = state.anomalies.filter(
					(old) => !activeAnomalies.find((a) => a.id === old.id)
				);

				const newHistory = [...state.history, ...dismissed]
					.slice(-MAX_HISTORY) // Keep last 100
					.sort((a, b) => b.timestamp - a.timestamp);

				return {
					anomalies: activeAnomalies,
					history: newHistory
				};
			});
		},

		/**
		 * Add a single anomaly
		 */
		addAnomaly(anomaly: Anomaly) {
			update((state) => {
				// Check if anomaly already exists
				const exists = state.anomalies.find((a) => a.id === anomaly.id);
				if (exists) return state;

				return {
					...state,
					anomalies: [...state.anomalies, anomaly]
				};
			});
		},

		/**
		 * Dismiss (clear) a specific anomaly
		 */
		clearAnomaly(id: string) {
			update((state) => {
				const anomaly = state.anomalies.find((a) => a.id === id);
				if (!anomaly) return state;

				const newHistory = [anomaly, ...state.history]
					.slice(0, MAX_HISTORY)
					.sort((a, b) => b.timestamp - a.timestamp);

				return {
					anomalies: state.anomalies.filter((a) => a.id !== id),
					history: newHistory
				};
			});
		},

		/**
		 * Get anomaly history
		 */
		getHistory(): Anomaly[] {
			let history: Anomaly[] = [];
			subscribe((state) => {
				history = state.history;
			})();
			return history;
		},

		/**
		 * Clear all anomalies
		 */
		clearAll() {
			update((state) => ({
				anomalies: [],
				history: [...state.history, ...state.anomalies]
					.slice(-MAX_HISTORY)
					.sort((a, b) => b.timestamp - a.timestamp)
			}));
		}
	};
}

export const anomalies = createAnomaliesStore();

/**
 * Derived store for critical anomalies only
 */
export const criticalAnomalies = derived(anomalies, ($anomalies) =>
	$anomalies.anomalies.filter((a) => a.severity === 'critical')
);

/**
 * Derived store for active (non-dismissed) anomalies
 */
export const activeAnomalies = derived(anomalies, ($anomalies) => $anomalies.anomalies);
