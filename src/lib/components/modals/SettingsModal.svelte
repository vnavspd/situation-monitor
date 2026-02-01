<script lang="ts">
	import Modal from './Modal.svelte';
	import { settings } from '$lib/stores';
	import { refresh } from '$lib/stores/refresh';
	import { PANELS, type PanelId } from '$lib/config';

	interface Props {
		open: boolean;
		onClose: () => void;
		onReconfigure?: () => void;
	}

	let { open = false, onClose, onReconfigure }: Props = $props();

	// Refresh interval options (in milliseconds)
	const REFRESH_INTERVALS = [
		{ label: '1 minute', value: 60 * 1000 },
		{ label: '5 minutes', value: 5 * 60 * 1000 },
		{ label: '15 minutes', value: 15 * 60 * 1000 },
		{ label: '30 minutes', value: 30 * 60 * 1000 },
		{ label: '1 hour', value: 60 * 60 * 1000 },
		{ label: 'Manual only', value: -1 }
	];

	let selectedInterval = $derived(
		$refresh.autoRefreshEnabled ? $refresh.autoRefreshInterval : -1
	);

	function handleTogglePanel(panelId: PanelId) {
		settings.togglePanel(panelId);
	}

	function handleToggleStreaming() {
		refresh.toggleStreaming();
	}

	function handleResetPanels() {
		settings.reset();
	}

	function handleRefreshIntervalChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const value = parseInt(target.value);

		if (value === -1) {
			// Manual only - disable auto-refresh
			refresh.toggleAutoRefresh();
		} else {
			// Enable auto-refresh with selected interval
			if (!$refresh.autoRefreshEnabled) {
				refresh.toggleAutoRefresh();
			}
			refresh.setAutoRefreshInterval(value);
		}
	}
</script>

<Modal {open} title="Settings" {onClose}>
	<div class="settings-sections">
		<section class="settings-section">
			<h3 class="section-title">Enabled Panels</h3>
			<p class="section-desc">Toggle panels on/off to customize your dashboard</p>

			<div class="panels-grid">
				{#each Object.entries(PANELS) as [id, config]}
					{@const panelId = id as PanelId}
					{@const isEnabled = $settings.enabled[panelId]}
					<label class="panel-toggle" class:enabled={isEnabled}>
						<input
							type="checkbox"
							checked={isEnabled}
							onchange={() => handleTogglePanel(panelId)}
						/>
						<span class="panel-name">{config.name}</span>
						<span class="panel-priority">P{config.priority}</span>
					</label>
				{/each}
			</div>
		</section>

		<section class="settings-section">
			<h3 class="section-title">Data Refresh</h3>
			<p class="section-desc">Control how often data is automatically refreshed</p>

			<div class="refresh-settings">
				<label class="setting-label">
					<span class="label-text">Auto-Refresh Interval</span>
					<select class="interval-select" value={selectedInterval} onchange={handleRefreshIntervalChange}>
						{#each REFRESH_INTERVALS as interval}
							<option value={interval.value}>{interval.label}</option>
						{/each}
					</select>
				</label>

				<div class="refresh-info">
					{#if $refresh.autoRefreshEnabled}
						<span class="status-badge active">Auto-refresh enabled</span>
						<span class="info-text">
							Next refresh in {Math.floor(($refresh.autoRefreshInterval - ($refresh.lastRefresh ? Date.now() - $refresh.lastRefresh : 0)) / 1000 / 60)} min
						</span>
					{:else}
						<span class="status-badge inactive">Manual refresh only</span>
						<span class="info-text">Click refresh button to update data</span>
					{/if}
				</div>

				<div class="streaming-toggle">
					<label class="toggle-label">
						<input
							type="checkbox"
							checked={$refresh.streamingEnabled}
							onchange={handleToggleStreaming}
							class="toggle-checkbox"
						/>
						<span class="toggle-text">
							<span class="toggle-title">Real-Time Streaming</span>
							<span class="toggle-desc">
								Fetch breaking news every 2 minutes (15-min window)
							</span>
						</span>
						{#if $refresh.streamingEnabled}
							<span class="streaming-indicator">🔴 LIVE</span>
						{/if}
					</label>
				</div>
			</div>
		</section>

		<section class="settings-section">
			<h3 class="section-title">Dashboard</h3>
			{#if onReconfigure}
				<button class="reconfigure-btn" onclick={onReconfigure}> Reconfigure Dashboard </button>
				<p class="btn-hint">Choose a preset profile for your panels</p>
			{/if}
			<button class="reset-btn" onclick={handleResetPanels}> Reset All Settings </button>
		</section>
	</div>
</Modal>

<style>
	.settings-sections {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin: 0;
	}

	.section-desc {
		font-size: 0.65rem;
		color: var(--text-muted);
		margin: 0;
	}

	.panels-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.panel-toggle {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.panel-toggle:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.panel-toggle.enabled {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
	}

	.panel-toggle input {
		accent-color: var(--accent);
	}

	.panel-name {
		flex: 1;
		font-size: 0.65rem;
		color: var(--text-primary);
	}

	.panel-priority {
		font-size: 0.5rem;
		color: var(--text-muted);
		background: rgba(255, 255, 255, 0.05);
		padding: 0.1rem 0.25rem;
		border-radius: 2px;
	}

	.reconfigure-btn {
		padding: 0.5rem 1rem;
		background: rgba(0, 255, 136, 0.1);
		border: 1px solid rgba(0, 255, 136, 0.3);
		border-radius: 4px;
		color: var(--accent);
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.15s ease;
		margin-bottom: 0.25rem;
	}

	.reconfigure-btn:hover {
		background: rgba(0, 255, 136, 0.2);
	}

	.btn-hint {
		font-size: 0.6rem;
		color: var(--text-muted);
		margin: 0 0 0.75rem;
	}

	.reset-btn {
		padding: 0.5rem 1rem;
		background: rgba(255, 68, 68, 0.1);
		border: 1px solid rgba(255, 68, 68, 0.3);
		border-radius: 4px;
		color: var(--danger);
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.reset-btn:hover {
		background: rgba(255, 68, 68, 0.2);
	}

	.refresh-settings {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.setting-label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.label-text {
		font-size: 0.65rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.interval-select {
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-primary);
		font-size: 0.7rem;
		font-family: 'Courier New', Courier, monospace;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.interval-select:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--hud-green);
	}

	.interval-select:focus {
		outline: none;
		border-color: var(--hud-green);
		box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
	}

	.refresh-info {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
		border: 1px solid var(--border);
	}

	.status-badge {
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		width: fit-content;
	}

	.status-badge.active {
		background: rgba(0, 255, 136, 0.15);
		color: var(--hud-green);
		border: 1px solid var(--hud-green);
	}

	.status-badge.inactive {
		background: rgba(255, 170, 0, 0.15);
		color: var(--hud-yellow);
		border: 1px solid var(--hud-yellow);
	}

	.info-text {
		font-size: 0.6rem;
		color: var(--text-muted);
		font-family: 'Courier New', Courier, monospace;
	}

	.streaming-toggle {
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid var(--border);
		border-radius: 4px;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.toggle-checkbox {
		width: 18px;
		height: 18px;
		accent-color: var(--hud-green);
		cursor: pointer;
	}

	.toggle-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.toggle-title {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'Courier New', Courier, monospace;
	}

	.toggle-desc {
		font-size: 0.6rem;
		color: var(--text-muted);
		font-family: 'Courier New', Courier, monospace;
	}

	.streaming-indicator {
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--hud-red);
		animation: pulse 2s ease-in-out infinite;
		text-shadow: 0 0 8px var(--hud-red);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
