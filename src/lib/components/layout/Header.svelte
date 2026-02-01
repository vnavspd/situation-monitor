<script lang="ts">
	import { isRefreshing, lastRefresh, refresh } from '$lib/stores';

	interface Props {
		onSettingsClick?: () => void;
	}

	let { onSettingsClick }: Props = $props();

	const lastRefreshText = $derived(
		$lastRefresh
			? `Last updated: ${new Date($lastRefresh).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
			: 'Never refreshed'
	);
</script>

<header class="header">
	<div class="header-left">
		<h1 class="logo">SITUATION MONITOR</h1>
	</div>

	<div class="header-center">
		<div class="refresh-status">
			{#if $refresh.streamingEnabled}
				<span class="streaming-badge">🔴 LIVE</span>
			{/if}
			{#if $isRefreshing}
				<span class="status-text loading">Refreshing...</span>
			{:else}
				<span class="status-text">{lastRefreshText}</span>
			{/if}
		</div>
	</div>

	<div class="header-right">
		<button class="header-btn settings-btn" onclick={onSettingsClick} title="Settings">
			<span class="btn-icon">⚙</span>
			<span class="btn-label">Settings</span>
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: var(--terminal-orange);
		border-bottom: 2px solid var(--terminal-yellow);
		position: sticky;
		top: 0;
		z-index: 100;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: baseline;
		flex-shrink: 0;
	}

	.logo {
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: #000000;
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-family: 'Courier New', 'Courier', monospace;
	}

	.header-center {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: center;
		min-width: 0;
	}

	.refresh-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-text {
		font-size: 0.6rem;
		color: #000000;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: 'Courier New', 'Courier', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.status-text.loading {
		color: #000000;
		animation: blink 1s ease-in-out infinite;
	}

	.streaming-badge {
		font-size: 0.6rem;
		font-weight: 700;
		color: #ff0000;
		font-family: 'Courier New', 'Courier', monospace;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		padding: 0.2rem 0.5rem;
		background: #000000;
		border: 1px solid #ff0000;
		border-radius: 0;
		animation: pulse-live 2s ease-in-out infinite;
	}
	
	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes pulse-live {
		0%, 100% {
			opacity: 1;
			box-shadow: 0 0 5px var(--hud-red);
		}
		50% {
			opacity: 0.7;
			box-shadow: 0 0 15px var(--hud-red);
		}
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.header-btn {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2rem;
		padding: 0.4rem 0.75rem;
		background: #000000;
		border: 1px solid #000000;
		border-radius: 0;
		color: var(--terminal-yellow);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 0.65rem;
		font-family: 'Courier New', 'Courier', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.header-btn:hover {
		background: rgba(0, 0, 0, 0.8);
		border-color: var(--terminal-yellow);
		color: #ffffff;
	}

	.btn-icon {
		font-size: 0.8rem;
	}

	.btn-label {
		display: none;
	}

	@media (min-width: 768px) {
		.btn-label {
			display: inline;
		}
	}
</style>
