<script lang="ts">
	import { onMount } from 'svelte';
	import type { NewsItem } from '$types';
	import {
		analyzeEntityRelationships,
		filterNewsByEntity,
		type EntityNode,
		type EntityEdge
	} from '$lib/analysis/entity-relationships';

	interface Props {
		news: NewsItem[];
	}

	let { news }: Props = $props();

	let d3: any = $state(null);
	let svgElement: SVGSVGElement | null = $state(null);
	let containerElement: HTMLDivElement | null = $state(null);
	let selectedEntity: EntityNode | null = $state(null);
	let searchQuery = $state('');
	let minEdgeWeight = $state(0.15);
	let simulation: any = $state(null);

	const categoryColors = {
		person: '#3b82f6',
		organization: '#f59e0b',
		location: '#10b981'
	};

	// Compute graph data
	const graphData = $derived.by(() => {
		const data = analyzeEntityRelationships(news);
		// Filter edges by min weight
		return {
			...data,
			edges: data.edges.filter((e) => e.weight >= minEdgeWeight)
		};
	});

	const filteredNews = $derived.by(() => {
		if (!selectedEntity) return [];
		return filterNewsByEntity(news, selectedEntity.name);
	});

	onMount(() => {
		// Dynamic import of D3
		import('d3').then((module) => {
			d3 = module;
			renderGraph();
		});

		// Cleanup on unmount
		return () => {
			if (simulation) {
				simulation.stop();
			}
		};
	});

	$effect(() => {
		// Re-render when graph data changes
		if (d3 && svgElement && graphData) {
			renderGraph();
		}
	});

	function renderGraph() {
		if (!d3 || !svgElement || !containerElement) return;

		const width = containerElement.clientWidth;
		const height = containerElement.clientHeight;

		// Clear previous content
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement);

		// Create container group for zoom
		const g = svg.append('g');

		// Add zoom behavior
		const zoom = d3.zoom().scaleExtent([0.5, 3]).on('zoom', (event: any) => {
			g.attr('transform', event.transform);
		});

		svg.call(zoom);

		// Copy data to avoid mutations
		const nodes = graphData.nodes.map((d) => ({ ...d }));
		const edges = graphData.edges.map((d) => ({ ...d }));

		// Create force simulation
		simulation = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3
					.forceLink(edges)
					.id((d: any) => d.id)
					.distance(80)
			)
			.force('charge', d3.forceManyBody().strength(-150))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force(
				'collision',
				d3.forceCollide().radius((d: any) => nodeRadius(d) + 5)
			);

		// Create edges
		const link = g
			.append('g')
			.selectAll('line')
			.data(edges)
			.enter()
			.append('line')
			.attr('stroke', '#4b5563')
			.attr('stroke-opacity', (d: EntityEdge) => Math.min(d.weight * 2, 1))
			.attr('stroke-width', (d: EntityEdge) => Math.max(1, d.weight * 3));

		// Create nodes
		const node = g
			.append('g')
			.selectAll('circle')
			.data(nodes)
			.enter()
			.append('circle')
			.attr('r', nodeRadius)
			.attr('fill', (d: EntityNode) => categoryColors[d.category])
			.attr('stroke', '#fff')
			.attr('stroke-width', 2)
			.style('cursor', 'pointer')
			.call(drag(simulation))
			.on('click', handleNodeClick)
			.on('mouseenter', handleNodeHover)
			.on('mouseleave', handleNodeLeave);

		// Create labels for top entities
		const label = g
			.append('g')
			.selectAll('text')
			.data(nodes.filter((d: EntityNode) => d.count > 5))
			.enter()
			.append('text')
			.text((d: EntityNode) => d.name)
			.attr('font-size', '10px')
			.attr('fill', '#e5e7eb')
			.attr('text-anchor', 'middle')
			.attr('dy', -15)
			.style('pointer-events', 'none');

		// Update positions on tick
		simulation.on('tick', () => {
			link
				.attr('x1', (d: any) => d.source.x)
				.attr('y1', (d: any) => d.source.y)
				.attr('x2', (d: any) => d.target.x)
				.attr('y2', (d: any) => d.target.y);

			node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

			label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
		});

		// Highlight searched entity
		if (searchQuery) {
			const searchLower = searchQuery.toLowerCase();
			node.attr('opacity', (d: EntityNode) =>
				d.name.toLowerCase().includes(searchLower) ? 1 : 0.3
			);
			label.attr('opacity', (d: EntityNode) =>
				d.name.toLowerCase().includes(searchLower) ? 1 : 0.3
			);
		}
	}

	function nodeRadius(d: EntityNode): number {
		return Math.max(3, Math.min(15, d.count / 2));
	}

	function drag(simulation: any) {
		function dragstarted(event: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		function dragged(event: any) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		function dragended(event: any) {
			if (!event.active) simulation.alphaTarget(0);
			// Keep node fixed on double-click
			if (event.sourceEvent.detail === 2) {
				return;
			}
			event.subject.fx = null;
			event.subject.fy = null;
		}

		return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
	}

	function handleNodeClick(_event: MouseEvent, d: EntityNode) {
		selectedEntity = selectedEntity?.id === d.id ? null : d;
	}

	function handleNodeHover(_event: MouseEvent, d: EntityNode) {
		// Could add tooltip here
		console.log('Hover:', d.name, `${d.count} mentions`);
	}

	function handleNodeLeave(_event: MouseEvent, _d: EntityNode) {
		// Clear tooltip
	}

	function resetLayout() {
		if (simulation) {
			simulation.alpha(1).restart();
		}
	}

	function handleSearch() {
		renderGraph();
	}
</script>

<div class="entity-graph-panel h-full flex flex-col">
	<div class="panel-header flex items-center justify-between p-4 border-b border-cyan-900/30">
		<h2 class="text-lg font-bold text-cyan-400">
			Entity Network
			<span class="ml-2 text-sm text-gray-400">({graphData.nodes.length} entities)</span>
		</h2>
		<button
			onclick={resetLayout}
			class="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
		>
			Reset Layout
		</button>
	</div>

	<div class="controls p-3 border-b border-cyan-900/30 flex gap-3 items-center">
		<input
			type="text"
			bind:value={searchQuery}
			oninput={handleSearch}
			placeholder="Search entities..."
			class="flex-1 px-3 py-1 bg-gray-900/50 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
		/>
		<label class="text-xs text-gray-400 flex items-center gap-2 whitespace-nowrap">
			Min Edge:
			<input
				type="range"
				bind:value={minEdgeWeight}
				min="0.05"
				max="0.5"
				step="0.05"
				class="w-20"
			/>
			<span>{minEdgeWeight.toFixed(2)}</span>
		</label>
	</div>

	<div class="flex flex-1 overflow-hidden">
		<div class="graph-container flex-1" bind:this={containerElement}>
			<svg bind:this={svgElement} width="100%" height="100%" class="bg-gray-950/50"></svg>
		</div>

		{#if selectedEntity}
			<div class="entity-sidebar w-80 border-l border-cyan-900/30 bg-gray-950/80 overflow-y-auto">
				<div class="p-4">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold text-cyan-400">{selectedEntity.name}</h3>
						<button
							onclick={() => (selectedEntity = null)}
							class="text-gray-400 hover:text-red-400"
						>
							✕
						</button>
					</div>

					<div class="space-y-3 mb-4">
						<div class="flex items-center gap-2">
							<div
								class="w-3 h-3 rounded-full"
								style="background-color: {categoryColors[selectedEntity.category]}"
							></div>
							<span class="text-xs text-gray-400 uppercase">{selectedEntity.category}</span>
						</div>
						<div class="text-sm text-gray-300">
							<span class="font-semibold">{selectedEntity.count}</span> mentions
						</div>
					</div>

					<div class="border-t border-gray-700 pt-4">
						<h4 class="text-sm font-semibold text-gray-400 mb-2">
							Related Articles ({filteredNews.length})
						</h4>
						<div class="space-y-2">
							{#each filteredNews.slice(0, 10) as article}
								<a
									href={article.link}
									target="_blank"
									rel="noopener noreferrer"
									class="block text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
								>
									{article.title}
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="legend p-3 border-t border-cyan-900/30 flex gap-4 text-xs">
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 rounded-full" style="background-color: {categoryColors.person}"></div>
			<span class="text-gray-400">Person</span>
		</div>
		<div class="flex items-center gap-2">
			<div
				class="w-3 h-3 rounded-full"
				style="background-color: {categoryColors.organization}"
			></div>
			<span class="text-gray-400">Organization</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 rounded-full" style="background-color: {categoryColors.location}"></div>
			<span class="text-gray-400">Location</span>
		</div>
	</div>
</div>

<style>
	.entity-graph-panel {
		background: rgba(0, 8, 20, 0.95);
		border: 1px solid rgba(6, 182, 212, 0.2);
		border-radius: 4px;
	}

	.entity-sidebar::-webkit-scrollbar {
		width: 6px;
	}

	.entity-sidebar::-webkit-scrollbar-track {
		background: rgba(0, 8, 20, 0.5);
	}

	.entity-sidebar::-webkit-scrollbar-thumb {
		background: rgba(6, 182, 212, 0.3);
		border-radius: 3px;
	}

	.entity-sidebar::-webkit-scrollbar-thumb:hover {
		background: rgba(6, 182, 212, 0.5);
	}
</style>
