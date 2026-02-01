<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Drag-drop state and handlers will be added in Phase 4
	// when panels are fully implemented
</script>

<main class="dashboard">
	<div class="dashboard-grid">
		{@render children()}
	</div>
</main>

<style>
	.dashboard {
		flex: 1;
		overflow-y: auto;
	}

	.dashboard-grid {
		column-count: 1;
		column-gap: 0.5rem;
		max-width: 100%;
		margin: 0 auto;
	}

	.dashboard-grid > :global(*) {
		break-inside: avoid;
		margin-bottom: 0.5rem;
	}

	@media (min-width: 768px) {
		.dashboard-grid {
			column-count: 1;
		}
	}
</style>
