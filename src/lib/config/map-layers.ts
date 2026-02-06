/**
 * Map layer configurations for enhanced visualization
 */

export interface LayerData {
	id: string;
	coords: [number, number][] | [number, number];
	label: string;
	description: string;
	metadata?: Record<string, any>;
}

export interface MapLayer {
	id: string;
	name: string;
	type: 'points' | 'lines' | 'polygons' | 'zones';
	color: string;
	visible: boolean;
	data: LayerData[];
}

export const MAP_LAYERS: MapLayer[] = [
	{
		id: 'conflicts',
		name: 'Active Conflicts',
		type: 'zones',
		color: '#ff3333',
		visible: true,
		data: [
			{
				id: 'ukraine',
				coords: [
					[48.5, 38.0],
					[48.5, 32.0],
					[46.0, 32.0],
					[46.0, 38.0],
					[48.5, 38.0]
				],
				label: 'Ukraine War Zone',
				description: 'Active combat areas in eastern Ukraine'
			},
			{
				id: 'gaza',
				coords: [
					[31.6, 34.2],
					[31.6, 34.6],
					[31.2, 34.6],
					[31.2, 34.2],
					[31.6, 34.2]
				],
				label: 'Gaza Conflict',
				description: 'Israel-Hamas conflict zone'
			},
			{
				id: 'syria',
				coords: [
					[37.0, 36.0],
					[37.0, 42.0],
					[33.0, 42.0],
					[33.0, 36.0],
					[37.0, 36.0]
				],
				label: 'Syria Conflict',
				description: 'Ongoing instability in Syria'
			},
			{
				id: 'yemen',
				coords: [
					[19.0, 42.0],
					[19.0, 54.0],
					[12.0, 54.0],
					[12.0, 42.0],
					[19.0, 42.0]
				],
				label: 'Yemen Conflict',
				description: 'Civil war and Houthi insurgency'
			}
		]
	},
	{
		id: 'trade-routes',
		name: 'Major Trade Routes',
		type: 'lines',
		color: '#3388ff',
		visible: false,
		data: [
			{
				id: 'suez',
				coords: [
					[31.3, 32.3],
					[30.5, 32.5],
					[29.9, 32.5],
					[27.2, 33.8],
					[21.0, 38.0],
					[15.0, 42.0],
					[10.0, 45.0]
				],
				label: 'Suez Canal Route',
				description: 'Critical maritime chokepoint connecting Mediterranean and Red Sea'
			},
			{
				id: 'hormuz',
				coords: [
					[26.5, 56.0],
					[26.0, 56.5],
					[25.5, 57.0]
				],
				label: 'Strait of Hormuz',
				description: 'Strategic oil shipping lane'
			},
			{
				id: 'malacca',
				coords: [
					[1.4, 103.0],
					[2.5, 101.0],
					[5.5, 100.0]
				],
				label: 'Strait of Malacca',
				description: 'Vital shipping route between Indian Ocean and Pacific'
			},
			{
				id: 'panama',
				coords: [
					[9.0, -79.9],
					[9.3, -79.7],
					[9.4, -79.5]
				],
				label: 'Panama Canal',
				description: 'Connects Atlantic and Pacific oceans'
			}
		]
	},
	{
		id: 'military-bases',
		name: 'US Military Bases',
		type: 'points',
		color: '#ffaa00',
		visible: false,
		data: [
			{
				id: 'ramstein',
				coords: [49.4, 7.6],
				label: 'Ramstein Air Base',
				description: 'Largest US air base in Europe (Germany)'
			},
			{
				id: 'camp-humphreys',
				coords: [36.9, 127.0],
				label: 'Camp Humphreys',
				description: 'Largest US overseas military base (South Korea)'
			},
			{
				id: 'al-udeid',
				coords: [25.1, 51.3],
				label: 'Al Udeid Air Base',
				description: 'Key US air base in Middle East (Qatar)'
			},
			{
				id: 'diego-garcia',
				coords: [-7.3, 72.4],
				label: 'Diego Garcia',
				description: 'Strategic naval base in Indian Ocean'
			},
			{
				id: 'guam',
				coords: [13.5, 144.8],
				label: 'Andersen AFB',
				description: 'Strategic Pacific base (Guam)'
			},
			{
				id: 'okinawa',
				coords: [26.3, 127.8],
				label: 'Kadena Air Base',
				description: 'Major base in Asia-Pacific (Japan)'
			}
		]
	},
	{
		id: 'economic-zones',
		name: 'Economic Alliances',
		type: 'zones',
		color: '#00ff88',
		visible: false,
		data: [
			{
				id: 'eu',
				coords: [
					[71.0, -10.0],
					[71.0, 40.0],
					[35.0, 40.0],
					[35.0, -10.0],
					[71.0, -10.0]
				],
				label: 'European Union',
				description: 'Economic and political union of 27 member states'
			},
			{
				id: 'asean',
				coords: [
					[28.0, 92.0],
					[28.0, 141.0],
					[-11.0, 141.0],
					[-11.0, 92.0],
					[28.0, 92.0]
				],
				label: 'ASEAN',
				description: 'Association of Southeast Asian Nations'
			},
			{
				id: 'usmca',
				coords: [
					[72.0, -170.0],
					[72.0, -50.0],
					[14.0, -50.0],
					[14.0, -118.0],
					[14.0, -170.0],
					[72.0, -170.0]
				],
				label: 'USMCA',
				description: 'US-Mexico-Canada trade agreement'
			}
		]
	}
];

/**
 * Get layer by ID
 */
export function getLayerById(id: string): MapLayer | undefined {
	return MAP_LAYERS.find((layer) => layer.id === id);
}

/**
 * Get all visible layers
 */
export function getVisibleLayers(): MapLayer[] {
	return MAP_LAYERS.filter((layer) => layer.visible);
}

/**
 * Toggle layer visibility
 */
export function toggleLayerVisibility(id: string): void {
	const layer = getLayerById(id);
	if (layer) {
		layer.visible = !layer.visible;
	}
}
