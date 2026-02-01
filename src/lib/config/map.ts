// Map configuration - hotspots, conflict zones, and strategic locations

export interface Hotspot {
	name: string;
	lat: number;
	lon: number;
	level: 'critical' | 'high' | 'elevated' | 'low';
	desc: string;
}

export interface ConflictZone {
	name: string;
	coords: [number, number][];
	color: string;
}

export interface Chokepoint {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface CableLanding {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface NuclearSite {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface MilitaryBase {
	name: string;
	lat: number;
	lon: number;
	desc: string;
}

export interface Ocean {
	name: string;
	lat: number;
	lon: number;
}

export interface City {
	name: string;
	lat: number;
	lon: number;
	country: string;
	importance: 'major' | 'capital' | 'regional'; // major = show at low zoom, capital = medium zoom, regional = high zoom
	keywords: string[]; // For news filtering
}

export const THREAT_COLORS = {
	critical: '#ff0000',
	high: '#ff4444',
	elevated: '#ffcc00',
	low: '#00ff88'
} as const;

export const SANCTIONED_COUNTRY_IDS = [
	364, // Iran
	408, // North Korea
	760, // Syria
	862, // Venezuela
	112, // Belarus
	643, // Russia
	728, // South Sudan
	729 // Sudan
];

export const HOTSPOTS: Hotspot[] = [
	{
		name: 'DC',
		lat: 38.9,
		lon: -77.0,
		level: 'low',
		desc: 'Washington DC — US political center, White House, Pentagon, Capitol'
	},
	{
		name: 'Moscow',
		lat: 55.75,
		lon: 37.6,
		level: 'elevated',
		desc: 'Moscow — Kremlin, Russian military command, sanctions hub'
	},
	{
		name: 'Beijing',
		lat: 39.9,
		lon: 116.4,
		level: 'elevated',
		desc: 'Beijing — CCP headquarters, US-China tensions, tech rivalry'
	},
	{
		name: 'Kyiv',
		lat: 50.45,
		lon: 30.5,
		level: 'high',
		desc: 'Kyiv — Active conflict zone, Russian invasion ongoing'
	},
	{
		name: 'Taipei',
		lat: 25.03,
		lon: 121.5,
		level: 'elevated',
		desc: 'Taipei — Taiwan Strait tensions, TSMC, China threat'
	},
	{
		name: 'Tehran',
		lat: 35.7,
		lon: 51.4,
		level: 'critical',
		desc: 'Tehran — ACTIVE UPRISING: 200+ cities, 26 provinces. Revolution protests, regime instability, nuclear program'
	},
	{
		name: 'Tel Aviv',
		lat: 32.07,
		lon: 34.78,
		level: 'high',
		desc: 'Tel Aviv — Israel-Gaza conflict, active military operations'
	},
	{
		name: 'London',
		lat: 51.5,
		lon: -0.12,
		level: 'low',
		desc: 'London — Financial center, Five Eyes, NATO ally'
	},
	{
		name: 'Brussels',
		lat: 50.85,
		lon: 4.35,
		level: 'low',
		desc: 'Brussels — EU/NATO headquarters, European policy'
	},
	{
		name: 'Pyongyang',
		lat: 39.03,
		lon: 125.75,
		level: 'elevated',
		desc: 'Pyongyang — North Korea nuclear threat, missile tests'
	},
	{
		name: 'Riyadh',
		lat: 24.7,
		lon: 46.7,
		level: 'elevated',
		desc: 'Riyadh — Saudi oil, OPEC+, Yemen conflict, regional power'
	},
	{
		name: 'Delhi',
		lat: 28.6,
		lon: 77.2,
		level: 'low',
		desc: 'Delhi — India rising power, China border tensions'
	},
	{
		name: 'Singapore',
		lat: 1.35,
		lon: 103.82,
		level: 'low',
		desc: 'Singapore — Shipping chokepoint, Asian finance hub'
	},
	{
		name: 'Tokyo',
		lat: 35.68,
		lon: 139.76,
		level: 'low',
		desc: 'Tokyo — US ally, regional security, economic power'
	},
	{
		name: 'Caracas',
		lat: 10.5,
		lon: -66.9,
		level: 'high',
		desc: 'Caracas — Venezuela crisis, Maduro regime, US sanctions, humanitarian emergency'
	},
	{
		name: 'Nuuk',
		lat: 64.18,
		lon: -51.72,
		level: 'elevated',
		desc: 'Nuuk — Greenland, US acquisition interest, Arctic strategy, Denmark tensions'
	}
];

export const CONFLICT_ZONES: ConflictZone[] = [
	{
		name: 'Ukraine',
		coords: [
			[30, 52],
			[40, 52],
			[40, 45],
			[30, 45],
			[30, 52]
		],
		color: '#ff4444'
	},
	{
		name: 'Gaza',
		coords: [
			[34, 32],
			[35, 32],
			[35, 31],
			[34, 31],
			[34, 32]
		],
		color: '#ff4444'
	},
	{
		name: 'Taiwan Strait',
		coords: [
			[117, 28],
			[122, 28],
			[122, 22],
			[117, 22],
			[117, 28]
		],
		color: '#ffaa00'
	},
	{
		name: 'Yemen',
		coords: [
			[42, 19],
			[54, 19],
			[54, 12],
			[42, 12],
			[42, 19]
		],
		color: '#ff6644'
	},
	{
		name: 'Sudan',
		coords: [
			[22, 23],
			[38, 23],
			[38, 8],
			[22, 8],
			[22, 23]
		],
		color: '#ff6644'
	},
	{
		name: 'Myanmar',
		coords: [
			[92, 28],
			[101, 28],
			[101, 10],
			[92, 10],
			[92, 28]
		],
		color: '#ff8844'
	}
];

export const CHOKEPOINTS: Chokepoint[] = [
	{
		name: 'Suez',
		lat: 30.0,
		lon: 32.5,
		desc: 'Suez Canal — 12% of global trade, Europe-Asia route'
	},
	{
		name: 'Panama',
		lat: 9.1,
		lon: -79.7,
		desc: 'Panama Canal — Americas transit, Pacific-Atlantic link'
	},
	{
		name: 'Hormuz',
		lat: 26.5,
		lon: 56.5,
		desc: 'Strait of Hormuz — 21% of global oil, Persian Gulf exit'
	},
	{
		name: 'Malacca',
		lat: 2.5,
		lon: 101.0,
		desc: 'Strait of Malacca — 25% of global trade, China supply line'
	},
	{
		name: 'Bab el-M',
		lat: 12.5,
		lon: 43.3,
		desc: 'Bab el-Mandeb — Red Sea gateway, Houthi threat zone'
	},
	{ name: 'Gibraltar', lat: 36.0, lon: -5.5, desc: 'Strait of Gibraltar — Mediterranean access' },
	{
		name: 'Bosporus',
		lat: 41.1,
		lon: 29.0,
		desc: 'Bosporus Strait — Black Sea access, Russia exports'
	}
];

export const CABLE_LANDINGS: CableLanding[] = [
	{ name: 'NYC', lat: 40.7, lon: -74.0, desc: 'New York — Transatlantic hub, 10+ cables' },
	{ name: 'Cornwall', lat: 50.1, lon: -5.5, desc: 'Cornwall UK — Europe-Americas gateway' },
	{ name: 'Marseille', lat: 43.3, lon: 5.4, desc: 'Marseille — Mediterranean hub, SEA-ME-WE' },
	{ name: 'Mumbai', lat: 19.1, lon: 72.9, desc: 'Mumbai — India gateway, 10+ cables' },
	{ name: 'Singapore', lat: 1.3, lon: 103.8, desc: 'Singapore — Asia-Pacific nexus' },
	{ name: 'Hong Kong', lat: 22.3, lon: 114.2, desc: 'Hong Kong — China connectivity hub' },
	{ name: 'Tokyo', lat: 35.5, lon: 139.8, desc: 'Tokyo — Trans-Pacific terminus' },
	{ name: 'Sydney', lat: -33.9, lon: 151.2, desc: 'Sydney — Australia/Pacific hub' },
	{ name: 'LA', lat: 33.7, lon: -118.2, desc: 'Los Angeles — Pacific gateway' },
	{ name: 'Miami', lat: 25.8, lon: -80.2, desc: 'Miami — Americas/Caribbean hub' }
];

export const NUCLEAR_SITES: NuclearSite[] = [
	{ name: 'Natanz', lat: 33.7, lon: 51.7, desc: 'Natanz — Iran uranium enrichment' },
	{ name: 'Yongbyon', lat: 39.8, lon: 125.8, desc: 'Yongbyon — North Korea nuclear complex' },
	{ name: 'Dimona', lat: 31.0, lon: 35.1, desc: 'Dimona — Israel nuclear facility' },
	{ name: 'Bushehr', lat: 28.8, lon: 50.9, desc: 'Bushehr — Iran nuclear power plant' },
	{
		name: 'Zaporizhzhia',
		lat: 47.5,
		lon: 34.6,
		desc: 'Zaporizhzhia — Europe largest NPP, conflict zone'
	},
	{ name: 'Chernobyl', lat: 51.4, lon: 30.1, desc: 'Chernobyl — Exclusion zone, occupied 2022' },
	{ name: 'Fukushima', lat: 37.4, lon: 141.0, desc: 'Fukushima — Decommissioning site' }
];

export const MILITARY_BASES: MilitaryBase[] = [
	{ name: 'Ramstein', lat: 49.4, lon: 7.6, desc: 'Ramstein — US Air Force, NATO hub Germany' },
	{
		name: 'Diego Garcia',
		lat: -7.3,
		lon: 72.4,
		desc: 'Diego Garcia — US/UK Indian Ocean base'
	},
	{
		name: 'Okinawa',
		lat: 26.5,
		lon: 127.9,
		desc: 'Okinawa — US Forces Japan, Pacific presence'
	},
	{ name: 'Guam', lat: 13.5, lon: 144.8, desc: 'Guam — US Pacific Command, bomber base' },
	{
		name: 'Djibouti',
		lat: 11.5,
		lon: 43.1,
		desc: 'Djibouti — US/China/France bases, Horn of Africa'
	},
	{ name: 'Qatar', lat: 25.1, lon: 51.3, desc: 'Al Udeid — US CENTCOM forward HQ' },
	{
		name: 'Kaliningrad',
		lat: 54.7,
		lon: 20.5,
		desc: 'Kaliningrad — Russian Baltic exclave, missiles'
	},
	{ name: 'Sevastopol', lat: 44.6, lon: 33.5, desc: 'Sevastopol — Russian Black Sea Fleet' },
	{
		name: 'Hainan',
		lat: 18.2,
		lon: 109.5,
		desc: 'Hainan — Chinese submarine base, South China Sea'
	}
];

export const OCEANS: Ocean[] = [
	{ name: 'ATLANTIC', lat: 25, lon: -40 },
	{ name: 'PACIFIC', lat: 0, lon: -150 },
	{ name: 'INDIAN', lat: -20, lon: 75 },
	{ name: 'ARCTIC', lat: 75, lon: 0 },
	{ name: 'SOUTHERN', lat: -60, lon: 0 }
];

// Major world cities for map labels and news filtering
export const MAJOR_CITIES: City[] = [
	// North America - Major
	{ name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA', importance: 'major', keywords: ['new york', 'nyc', 'manhattan', 'wall street'] },
	{ name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'USA', importance: 'major', keywords: ['los angeles', 'la', 'hollywood', 'california'] },
	{ name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'USA', importance: 'major', keywords: ['chicago', 'illinois'] },
	{ name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada', importance: 'major', keywords: ['toronto', 'ontario'] },
	{ name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'Mexico', importance: 'major', keywords: ['mexico city', 'cdmx', 'mexico'] },
	
	// North America - Capitals
	{ name: 'Washington DC', lat: 38.9072, lon: -77.0369, country: 'USA', importance: 'capital', keywords: ['washington', 'dc', 'white house', 'capitol'] },
	{ name: 'Ottawa', lat: 45.4215, lon: -75.6972, country: 'Canada', importance: 'capital', keywords: ['ottawa'] },
	
	// North America - Regional
	{ name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'USA', importance: 'regional', keywords: ['san francisco', 'sf', 'silicon valley'] },
	{ name: 'Boston', lat: 42.3601, lon: -71.0589, country: 'USA', importance: 'regional', keywords: ['boston', 'massachusetts'] },
	{ name: 'Miami', lat: 25.7617, lon: -80.1918, country: 'USA', importance: 'regional', keywords: ['miami', 'florida'] },
	{ name: 'Seattle', lat: 47.6062, lon: -122.3321, country: 'USA', importance: 'regional', keywords: ['seattle', 'washington'] },
	{ name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'Canada', importance: 'regional', keywords: ['vancouver', 'british columbia'] },
	
	// Europe - Major
	{ name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK', importance: 'major', keywords: ['london', 'uk', 'britain', 'england'] },
	{ name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France', importance: 'major', keywords: ['paris', 'france'] },
	{ name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany', importance: 'major', keywords: ['berlin', 'germany'] },
	{ name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'Russia', importance: 'major', keywords: ['moscow', 'russia', 'kremlin'] },
	{ name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy', importance: 'major', keywords: ['rome', 'italy', 'vatican'] },
	{ name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain', importance: 'major', keywords: ['madrid', 'spain'] },
	
	// Europe - Capitals
	{ name: 'Brussels', lat: 50.8503, lon: 4.3517, country: 'Belgium', importance: 'capital', keywords: ['brussels', 'belgium', 'eu', 'nato'] },
	{ name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'Austria', importance: 'capital', keywords: ['vienna', 'austria'] },
	{ name: 'Warsaw', lat: 52.2297, lon: 21.0122, country: 'Poland', importance: 'capital', keywords: ['warsaw', 'poland'] },
	{ name: 'Kyiv', lat: 50.4501, lon: 30.5234, country: 'Ukraine', importance: 'capital', keywords: ['kyiv', 'kiev', 'ukraine'] },
	{ name: 'Stockholm', lat: 59.3293, lon: 18.0686, country: 'Sweden', importance: 'capital', keywords: ['stockholm', 'sweden'] },
	
	// Europe - Regional
	{ name: 'Amsterdam', lat: 52.3676, lon: 4.9041, country: 'Netherlands', importance: 'regional', keywords: ['amsterdam', 'netherlands'] },
	{ name: 'Munich', lat: 48.1351, lon: 11.5820, country: 'Germany', importance: 'regional', keywords: ['munich', 'germany'] },
	{ name: 'Milan', lat: 45.4642, lon: 9.1900, country: 'Italy', importance: 'regional', keywords: ['milan', 'italy'] },
	{ name: 'Barcelona', lat: 41.3851, lon: 2.1734, country: 'Spain', importance: 'regional', keywords: ['barcelona', 'spain', 'catalonia'] },
	
	// Asia - Major
	{ name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan', importance: 'major', keywords: ['tokyo', 'japan'] },
	{ name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China', importance: 'major', keywords: ['beijing', 'china', 'chinese'] },
	{ name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'China', importance: 'major', keywords: ['shanghai', 'china'] },
	{ name: 'Hong Kong', lat: 22.3193, lon: 114.1694, country: 'China', importance: 'major', keywords: ['hong kong', 'hk'] },
	{ name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore', importance: 'major', keywords: ['singapore'] },
	{ name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea', importance: 'major', keywords: ['seoul', 'south korea', 'korea'] },
	{ name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India', importance: 'major', keywords: ['mumbai', 'india', 'bombay'] },
	{ name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'India', importance: 'major', keywords: ['delhi', 'new delhi', 'india'] },
	
	// Asia - Capitals
	{ name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand', importance: 'capital', keywords: ['bangkok', 'thailand'] },
	{ name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia', importance: 'capital', keywords: ['jakarta', 'indonesia'] },
	{ name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines', importance: 'capital', keywords: ['manila', 'philippines'] },
	{ name: 'Hanoi', lat: 21.0285, lon: 105.8542, country: 'Vietnam', importance: 'capital', keywords: ['hanoi', 'vietnam'] },
	{ name: 'Taipei', lat: 25.0330, lon: 121.5654, country: 'Taiwan', importance: 'capital', keywords: ['taipei', 'taiwan'] },
	{ name: 'Pyongyang', lat: 39.0392, lon: 125.7625, country: 'North Korea', importance: 'capital', keywords: ['pyongyang', 'north korea', 'dprk'] },
	
	// Middle East - Major
	{ name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE', importance: 'major', keywords: ['dubai', 'uae', 'emirates'] },
	{ name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, country: 'Israel', importance: 'major', keywords: ['tel aviv', 'israel'] },
	{ name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey', importance: 'major', keywords: ['istanbul', 'turkey'] },
	
	// Middle East - Capitals
	{ name: 'Riyadh', lat: 24.7136, lon: 46.6753, country: 'Saudi Arabia', importance: 'capital', keywords: ['riyadh', 'saudi', 'saudi arabia'] },
	{ name: 'Tehran', lat: 35.6892, lon: 51.3890, country: 'Iran', importance: 'capital', keywords: ['tehran', 'iran'] },
	{ name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'Iraq', importance: 'capital', keywords: ['baghdad', 'iraq'] },
	{ name: 'Damascus', lat: 33.5138, lon: 36.2765, country: 'Syria', importance: 'capital', keywords: ['damascus', 'syria'] },
	{ name: 'Jerusalem', lat: 31.7683, lon: 35.2137, country: 'Israel', importance: 'capital', keywords: ['jerusalem', 'israel'] },
	{ name: 'Ankara', lat: 39.9334, lon: 32.8597, country: 'Turkey', importance: 'capital', keywords: ['ankara', 'turkey'] },
	
	// South America - Major
	{ name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil', importance: 'major', keywords: ['sao paulo', 'brazil'] },
	{ name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'Argentina', importance: 'major', keywords: ['buenos aires', 'argentina'] },
	
	// South America - Capitals
	{ name: 'Brasília', lat: -15.8267, lon: -47.9218, country: 'Brazil', importance: 'capital', keywords: ['brasilia', 'brazil'] },
	{ name: 'Santiago', lat: -33.4489, lon: -70.6693, country: 'Chile', importance: 'capital', keywords: ['santiago', 'chile'] },
	{ name: 'Lima', lat: -12.0464, lon: -77.0428, country: 'Peru', importance: 'capital', keywords: ['lima', 'peru'] },
	{ name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'Colombia', importance: 'capital', keywords: ['bogota', 'colombia'] },
	{ name: 'Caracas', lat: 10.4806, lon: -66.9036, country: 'Venezuela', importance: 'capital', keywords: ['caracas', 'venezuela'] },
	
	// Africa - Major
	{ name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt', importance: 'major', keywords: ['cairo', 'egypt'] },
	{ name: 'Lagos', lat: 6.5244, lon: 3.3792, country: 'Nigeria', importance: 'major', keywords: ['lagos', 'nigeria'] },
	{ name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'South Africa', importance: 'major', keywords: ['johannesburg', 'south africa'] },
	
	// Africa - Capitals
	{ name: 'Nairobi', lat: -1.2864, lon: 36.8172, country: 'Kenya', importance: 'capital', keywords: ['nairobi', 'kenya'] },
	{ name: 'Addis Ababa', lat: 9.0320, lon: 38.7469, country: 'Ethiopia', importance: 'capital', keywords: ['addis ababa', 'ethiopia'] },
	{ name: 'Khartoum', lat: 15.5007, lon: 32.5599, country: 'Sudan', importance: 'capital', keywords: ['khartoum', 'sudan'] },
	
	// Oceania
	{ name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia', importance: 'major', keywords: ['sydney', 'australia'] },
	{ name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'Australia', importance: 'major', keywords: ['melbourne', 'australia'] },
	{ name: 'Canberra', lat: -35.2809, lon: 149.1300, country: 'Australia', importance: 'capital', keywords: ['canberra', 'australia'] },
	{ name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'New Zealand', importance: 'regional', keywords: ['auckland', 'new zealand'] }
];

export const WEATHER_CODES: Record<number, string> = {
	0: '☀️ Clear',
	1: '🌤️ Mostly clear',
	2: '⛅ Partly cloudy',
	3: '☁️ Overcast',
	45: '🌫️ Fog',
	48: '🌫️ Fog',
	51: '🌧️ Drizzle',
	53: '🌧️ Drizzle',
	55: '🌧️ Drizzle',
	61: '🌧️ Rain',
	63: '🌧️ Rain',
	65: '🌧️ Heavy rain',
	71: '🌨️ Snow',
	73: '🌨️ Snow',
	75: '🌨️ Heavy snow',
	77: '🌨️ Snow',
	80: '🌧️ Showers',
	81: '🌧️ Showers',
	82: '⛈️ Heavy showers',
	85: '🌨️ Snow',
	86: '🌨️ Snow',
	95: '⛈️ Thunderstorm',
	96: '⛈️ Thunderstorm',
	99: '⛈️ Thunderstorm'
};
