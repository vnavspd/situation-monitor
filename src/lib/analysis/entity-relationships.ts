import type { NewsItem } from '$types';
import { PERSON_PATTERNS } from '$lib/config/analysis';

export interface EntityNode {
	id: string;
	name: string;
	count: number;
	articles: NewsItem[];
	category: 'person' | 'organization' | 'location';
}

export interface EntityEdge {
	source: string;
	target: string;
	weight: number;
	sharedArticles: NewsItem[];
}

export interface EntityGraphData {
	nodes: EntityNode[];
	edges: EntityEdge[];
}

// Organization patterns
const ORG_PATTERNS = [
	'Pentagon',
	'CIA',
	'FBI',
	'NATO',
	'EU',
	'UN',
	'IMF',
	'Federal Reserve',
	'Treasury',
	'OpenAI',
	'Meta',
	'Google',
	'Microsoft',
	'Apple',
	'Tesla',
	'SpaceX',
	'Amazon',
	'Blackrock',
	'Congress',
	'Senate',
	'White House',
	'State Department',
	'Hamas',
	'Hezbollah'
];

// Location patterns
const LOCATION_PATTERNS = [
	'Ukraine',
	'Russia',
	'China',
	'Iran',
	'Israel',
	'Gaza',
	'Taiwan',
	'Syria',
	'Yemen',
	'Venezuela',
	'Greenland',
	'Europe',
	'Middle East',
	'Washington',
	'Beijing',
	'Moscow',
	'Tehran',
	'Jerusalem'
];

const MIN_EDGE_WEIGHT = 0.15;
const MAX_NODES = 25;

/**
 * Analyze entity relationships across news articles
 */
export function analyzeEntityRelationships(news: NewsItem[]): EntityGraphData {
	if (news.length === 0) {
		return { nodes: [], edges: [] };
	}

	// Extract all entities from news
	const entityMentions = extractEntities(news);

	// Create nodes (limit to top entities by mention count)
	const sortedEntities = Object.entries(entityMentions).sort(
		(a, b) => b[1].count - a[1].count
	);
	const topEntities = sortedEntities.slice(0, MAX_NODES);

	const nodes: EntityNode[] = topEntities.map(([name, data]) => ({
		id: normalizeEntityName(name),
		name,
		count: data.count,
		articles: data.articles,
		category: data.category
	}));

	// Create edges based on co-occurrence
	const edges: EntityEdge[] = [];

	// For each article, create edges between all entity pairs in that article
	for (const article of news) {
		const entitiesInArticle = nodes.filter((node) =>
			article.title.includes(node.name) || article.description?.includes(node.name)
		);

		// Create edges for all pairs
		for (let i = 0; i < entitiesInArticle.length; i++) {
			for (let j = i + 1; j < entitiesInArticle.length; j++) {
				const sourceId = entitiesInArticle[i].id;
				const targetId = entitiesInArticle[j].id;

				// Find or create edge
				let edge = edges.find(
					(e) =>
						(e.source === sourceId && e.target === targetId) ||
						(e.source === targetId && e.target === sourceId)
				);

				if (!edge) {
					edge = {
						source: sourceId,
						target: targetId,
						weight: 0,
						sharedArticles: []
					};
					edges.push(edge);
				}

				edge.sharedArticles.push(article);
			}
		}
	}

	// Calculate edge weights
	for (const edge of edges) {
		const sourceNode = nodes.find((n) => n.id === edge.source);
		const targetNode = nodes.find((n) => n.id === edge.target);

		if (sourceNode && targetNode) {
			// Weight = shared articles / min(source mentions, target mentions)
			const minMentions = Math.min(sourceNode.count, targetNode.count);
			edge.weight = edge.sharedArticles.length / minMentions;
		}
	}

	// Filter edges by minimum weight
	const filteredEdges = edges.filter((e) => e.weight >= MIN_EDGE_WEIGHT);

	return { nodes, edges: filteredEdges };
}

/**
 * Extract entities from news articles
 */
function extractEntities(news: NewsItem[]): Record<
	string,
	{
		count: number;
		articles: NewsItem[];
		category: 'person' | 'organization' | 'location';
	}
> {
	const entities: Record<
		string,
		{
			count: number;
			articles: NewsItem[];
			category: 'person' | 'organization' | 'location';
		}
	> = {};

	// Combine all patterns
	const allPatterns = [
		...PERSON_PATTERNS.map((p) => ({ name: String(p), category: 'person' as const })),
		...ORG_PATTERNS.map((p) => ({ name: String(p), category: 'organization' as const })),
		...LOCATION_PATTERNS.map((p) => ({ name: String(p), category: 'location' as const }))
	];

	for (const article of news) {
		const text = `${article.title} ${article.description || ''}`;

		for (const { name, category } of allPatterns) {
			const regex = new RegExp(`\\b${name}\\b`, 'i');
			if (regex.test(text)) {
				if (!entities[name]) {
					entities[name] = {
						count: 0,
						articles: [],
						category
					};
				}
				entities[name].count++;
				entities[name].articles.push(article);
			}
		}
	}

	return entities;
}

/**
 * Normalize entity name for use as ID
 */
function normalizeEntityName(name: string): string {
	return name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Get entity by ID from graph
 */
export function getEntityById(graph: EntityGraphData, id: string): EntityNode | undefined {
	return graph.nodes.find((n) => n.id === id);
}

/**
 * Get connected entities for a given entity
 */
export function getConnectedEntities(graph: EntityGraphData, entityId: string): EntityNode[] {
	const connectedIds = new Set<string>();

	for (const edge of graph.edges) {
		if (edge.source === entityId) {
			connectedIds.add(edge.target);
		} else if (edge.target === entityId) {
			connectedIds.add(edge.source);
		}
	}

	return graph.nodes.filter((n) => connectedIds.has(n.id));
}

/**
 * Filter news articles mentioning a specific entity
 */
export function filterNewsByEntity(news: NewsItem[], entityName: string): NewsItem[] {
	const regex = new RegExp(`\\b${entityName}\\b`, 'i');
	return news.filter((item) => regex.test(item.title) || regex.test(item.description || ''));
}
