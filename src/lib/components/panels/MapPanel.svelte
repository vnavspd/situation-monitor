<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { HOTSPOTS, MAJOR_CITIES, type City } from '$lib/config/map';
	import { locationFilter } from '$lib/stores';
	import type { CustomMonitor } from '$lib/types';

	interface Props {
		monitors?: CustomMonitor[];
		loading?: boolean;
		error?: string | null;
	}

	let { loading = false, error = null }: Props = $props();

	let mapContainer: HTMLDivElement;
	let d3: any;
	let svg: any;
	let projection: any;
	let path: any;
	let g: any;

	// Tooltip state
	let tooltipContent = $state<{ title: string; color: string; lines: string[] } | null>(null);
	let tooltipPosition = $state({ left: 0, top: 0 });
	let tooltipVisible = $state(false);

	function showTooltip(event: MouseEvent, title: string, color: string, lines: string[] = []): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipContent = { title, color, lines };
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
		tooltipVisible = true;
	}

	function moveTooltip(event: MouseEvent): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
	}

	function hideTooltip(): void {
		tooltipVisible = false;
		tooltipContent = null;
	}

	async function initMap(): Promise<void> {
		d3 = await import('d3');
		const topojson = await import('topojson-client');

		const width = 960;
		const height = 960;

		svg = d3.select(mapContainer)
			.select('svg')
			.attr('viewBox', `0 0 ${width} ${height}`)
			.style('width', '100%')
			.style('height', '100%');

		g = svg.append('g');

		projection = d3
			.geoOrthographic()
			.scale(450)
			.translate([width / 2, height / 2])
			.clipAngle(90)
			.precision(0.1);

		path = d3.geoPath().projection(projection);

		// Draw sphere
		g.append('path')
			.datum({ type: 'Sphere' })
			.attr('class', 'sphere')
			.attr('d', path)
			.style('fill', '#000814')
			.style('stroke', '#1a2332')
			.style('stroke-width', '3px');

		// Load world data
		const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
		const world = await response.json();
		const countries = topojson.feature(world, world.objects.countries as any) as any;

		// Draw countries with different color
		g.selectAll('.country')
			.data(countries.features)
			.enter()
			.append('path')
			.attr('class', 'country')
			.attr('d', path)
			.style('fill', '#1a3a52')
			.style('stroke', '#2a4a62')
			.style('stroke-width', '0.5px');

		// Draw graticule
		const graticule = d3.geoGraticule();
		g.append('path')
			.datum(graticule)
			.attr('class', 'graticule')
			.attr('d', path)
			.style('fill', 'none')
			.style('stroke', '#2a4a62')
			.style('stroke-width', '0.5px')
			.style('opacity', '0.3');

		// Draw hotspots
		drawHotspots();

		// Setup rotation
		let rotating = false;
		let rotation = { x: 0, y: 0 };
		let lastPos = { x: 0, y: 0 };

		svg.on('mousedown', function (event: MouseEvent) {
			rotating = true;
			lastPos = { x: event.clientX, y: event.clientY };
			event.preventDefault();
		});

		svg.on('mousemove', function (event: MouseEvent) {
			if (!rotating) return;

		const dx = event.clientX - lastPos.x;
		const dy = event.clientY - lastPos.y;

		rotation.x += dx * 0.25;
		rotation.y -= dy * 0.25;
		rotation.y = Math.max(-90, Math.min(90, rotation.y));

			projection.rotate([rotation.x, rotation.y]);
			g.selectAll('path').attr('d', path);
			updateHotspots();

			lastPos = { x: event.clientX, y: event.clientY };
			event.preventDefault();
		});

		svg.on('mouseup', () => {
			rotating = false;
		});

		svg.on('mouseleave', () => {
			rotating = false;
		});

		// Zoom with wheel
		svg.on('wheel', function (event: WheelEvent) {
			event.preventDefault();
			const currentScale = projection.scale();
			const delta = -event.deltaY * 0.5;
			const newScale = Math.max(200, Math.min(1200, currentScale + delta));
			projection.scale(newScale);
			g.selectAll('path').attr('d', path);
			updateHotspots();
		});
	}

	function drawHotspots() {
		HOTSPOTS.forEach((h, i) => {
			const coords = projection([h.lon, h.lat]);
			if (!coords) return;
			const [x, y] = coords;

			// Check if point is visible (on front of globe)
			const rotate = projection.rotate();
			const antipode = d3.geoDistance([h.lon, h.lat], [-rotate[0], -rotate[1]]);
			const visible = antipode > Math.PI / 2 ? 0 : 1;

			const colorMap: Record<string, string> = {
				high: '#ff0000',
				elevated: '#ff6b35',
				low: '#ffd60a'
			};
			const color = colorMap[h.level] || '#ff6b35';

			// Outer glow
			g.append('circle')
				.attr('class', `hotspot-outer-${i}`)
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 12)
				.style('fill', color)
				.style('fill-opacity', 0.2)
				.style('stroke', color)
				.style('stroke-width', 2)
				.style('filter', 'blur(2px)')
				.style('opacity', visible * 0.2);

			// Inner circle
			g.append('circle')
				.attr('class', `hotspot-inner-${i}`)
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 4)
				.style('fill', color)
				.style('filter', `drop-shadow(0 0 6px ${color})`)
				.style('opacity', visible);

			// Label
			g.append('text')
				.attr('class', `hotspot-label-${i}`)
				.attr('x', x + 15)
				.attr('y', y + 5)
				.style('fill', '#00ff41')
				.style('font-size', '10px')
				.style('font-family', 'Courier New, monospace')
				.style('font-weight', 'bold')
				.style('pointer-events', 'none')
				.style('opacity', visible)
				.text(h.name.toUpperCase());

			// Hit area
			g.append('circle')
				.attr('class', `hotspot-hit-${i}`)
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 20)
				.style('fill', 'transparent')
				.style('cursor', 'pointer')
				.style('opacity', visible)
				.style('pointer-events', visible ? 'all' : 'none')
				.on('mouseenter', function (event: MouseEvent) {
					showTooltip(event, h.name, color, [h.desc]);
				})
				.on('mousemove', moveTooltip)
				.on('mouseleave', hideTooltip);
		});
	}

	function updateHotspots() {
		HOTSPOTS.forEach((h, i) => {
			const coords = projection([h.lon, h.lat]);
			if (!coords) {
				// Hide if projection fails
				g.select(`.hotspot-outer-${i}`).style('opacity', 0);
				g.select(`.hotspot-inner-${i}`).style('opacity', 0);
				g.select(`.hotspot-label-${i}`).style('opacity', 0);
				g.select(`.hotspot-hit-${i}`).style('opacity', 0);
				return;
			}
			
			const [x, y] = coords;
			
			// Check if point is visible (on front of globe)
			const rotate = projection.rotate();
			const antipode = d3.geoDistance([h.lon, h.lat], [-rotate[0], -rotate[1]]);
			const visible = antipode > Math.PI / 2 ? 0 : 1;

			g.select(`.hotspot-outer-${i}`)
				.attr('cx', x)
				.attr('cy', y)
				.style('opacity', visible * 0.2);
				
			g.select(`.hotspot-inner-${i}`)
				.attr('cx', x)
				.attr('cy', y)
				.style('opacity', visible);
				
			g.select(`.hotspot-label-${i}`)
				.attr('x', x + 15)
				.attr('y', y + 5)
				.style('opacity', visible);
				
			g.select(`.hotspot-hit-${i}`)
				.attr('cx', x)
				.attr('cy', y)
				.style('opacity', visible)
				.style('pointer-events', visible ? 'all' : 'none');
		});
	}

	function zoomIn(): void {
		if (!projection || !g) return;
		const currentScale = projection.scale();
		projection.scale(Math.min(1200, currentScale * 1.3));
		g.selectAll('path').attr('d', path);
		updateHotspots();
	}

	function zoomOut(): void {
		if (!projection || !g) return;
		const currentScale = projection.scale();
		projection.scale(Math.max(200, currentScale / 1.3));
		g.selectAll('path').attr('d', path);
		updateHotspots();
	}

	function resetZoom(): void {
		if (!projection || !g) return;
		projection.rotate([0, 0]).scale(450);
		g.selectAll('path').attr('d', path);
		updateHotspots();
	}

	onMount(() => {
		initMap();
	});
</script>

<Panel id="map" title="Global Situation" {loading} {error}>
	<div class="map-container" bind:this={mapContainer}>
		<svg class="map-svg"></svg>
		{#if tooltipVisible && tooltipContent}
			<div
				class="map-tooltip"
				style="left: {tooltipPosition.left}px; top: {tooltipPosition.top}px;"
			>
				<strong style="color: {tooltipContent.color}">{tooltipContent.title}</strong>
				{#each tooltipContent.lines as line}
					<br /><span class="tooltip-line">{line}</span>
				{/each}
			</div>
		{/if}
		<div class="zoom-controls">
			<button class="zoom-btn" onclick={zoomIn} title="Zoom in">+</button>
			<button class="zoom-btn" onclick={zoomOut} title="Zoom out">−</button>
			<button class="zoom-btn" onclick={resetZoom} title="Reset">⟲</button>
		</div>
		<div class="threat-level-box">
			<div class="threat-header">GLOBAL THREAT</div>
			<div class="threat-level">ELEVATED</div>
			<div class="threat-detail">DEFCON 3</div>
			<div class="flashpoint-count">{HOTSPOTS.length} FLASHPOINTS</div>
		</div>
	</div>
</Panel>

<style>
	.map-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 600px;
		background: var(--hud-bg-deep);
		overflow: hidden;
		border: 2px solid var(--hud-grid);
		display: flex;
		align-items: center;
		justify-content: center;
		background-image: linear-gradient(var(--hud-grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--hud-grid) 1px, transparent 1px);
		background-size: 50px 50px;
	}

	.map-svg {
		width: 100%;
		height: 100%;
		cursor: grab;
		display: block;
	}

	.map-svg:active {
		cursor: grabbing;
	}

	.map-tooltip {
		position: absolute;
		background: rgba(0, 8, 20, 0.95);
		border: 1px solid var(--hud-orange);
		padding: 0.5rem;
		font-size: 0.65rem;
		font-family: 'Courier New', 'Courier', monospace;
		color: var(--hud-green);
		max-width: 250px;
		pointer-events: none;
		z-index: 100;
		text-transform: uppercase;
	}

	.zoom-controls {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		z-index: 10;
	}

	.zoom-btn {
		width: 2.75rem;
		height: 2.75rem;
		background: rgba(0, 8, 20, 0.9);
		border: 1px solid var(--hud-grid);
		color: var(--hud-green);
		font-size: 1rem;
		font-family: 'Courier New', 'Courier', monospace;
		cursor: pointer;
		transition: all 0.2s;
	}

	.zoom-btn:hover {
		background: rgba(0, 29, 61, 0.9);
		border-color: var(--hud-orange);
		color: var(--hud-orange);
		box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
	}

	.threat-level-box {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: rgba(0, 8, 20, 0.95);
		border: 2px solid var(--hud-orange);
		padding: 0.75rem 1rem;
		font-family: 'Courier New', 'Courier', monospace;
		text-align: center;
		min-width: 180px;
		box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
		z-index: 10;
	}

	.threat-header {
		font-size: 0.65rem;
		color: var(--hud-green-dim);
		letter-spacing: 2px;
		margin-bottom: 0.25rem;
	}

	.threat-level {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--hud-orange);
		letter-spacing: 3px;
		text-shadow: 0 0 10px rgba(255, 107, 53, 0.8);
		animation: glow 2s ease-in-out infinite;
	}

	.threat-detail {
		font-size: 0.75rem;
		color: var(--hud-red);
		letter-spacing: 2px;
		margin-top: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.flashpoint-count {
		font-size: 0.6rem;
		color: var(--hud-green);
		letter-spacing: 1px;
		padding-top: 0.5rem;
		border-top: 1px solid var(--hud-grid);
	}

	@keyframes glow {
		0%,
		100% {
			text-shadow: 0 0 10px rgba(255, 107, 53, 0.8);
		}
		50% {
			text-shadow: 0 0 20px rgba(255, 107, 53, 1);
		}
	}
</style>
