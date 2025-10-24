<template>
	<g
		class="node"
		:data-id="node.id"
		:class="{
			'show-halo': showHalo,
			'show-bonus-dot': showBonusDot,
			'show-lock-dot': showLockDot,
			'show-simulation-ring': showSimulationRing,
			'show-overlap-padding': showOverlapPadding,
			'show-label': showLabel,
			'discovered': !!node.discovered,
			'discoverable': isDiscoverable,
			'dragging': isDragging,
			'selected': isSelected,
			'simulation-enabled': isSimulationEnabled,
		}"
		:transform="`translate(${node.x},${node.y})`"
		@pointerdown="onPointerDown"
		@mouseenter="onEnter"
		@mouseleave="onLeave"
		@click.stop
	>
		<circle
			class="halo"
			:r="(node.r||12) + 8"
		/>
		<circle
			class="core"
			:r="node.r || 12"
			:fill="node.color || '#10b981'"
		/>
		<circle
			class="bonus-dot"
			:cx="(node.r||12) * 0.7"
			:cy="-(node.r||12) * 0.7"
		/>
		<circle
			class="lock-dot"
			:cx="-(node.r||12) * 0.7"
			:cy="-(node.r||12) * 0.7"
		/>
		<circle
			class="simulation-ring"
			:r="(node.r||12) + 4"
		/>
		<circle
			class="discoverable-ring"
			:r="(node.r||12) + 4"
		/>
		<circle
			class="overlap-padding"
			:r="(node.r||12) + store.settings.overlapPadding.radius"
		/>
		<!-- <text
			class="label"
			:transform="labelTransform"
			:text-anchor="textAnchor"
		>{{ playerView && !discovered ? "?" : node.label }}</text> -->
	</g>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NodeAny } from "../types/node";
import { CommonNodeMixin } from "../mixins/NodeDot/commonNodeMixin";
import { DragMixin } from "../mixins/NodeDot/dragMixin";

export default defineComponent({
	name: "NodeDot",
	mixins: [DragMixin, CommonNodeMixin],
  props: {
    node: { type: Object as () => NodeAny, required: true },
	},
	data(){
		return {
		};
	},
	computed: {
		showHalo(): boolean {
			return (this.currentUser !== "player") && this.isSelected;
		},
		showBonusDot(): boolean {
			return (this.node.bonuses?.length || 0) > 0;
		},
		showLockDot(): boolean {
			return !!(this.node.locked && (this.currentUser == "gm"));
		},
		showSimulationRing(): boolean {
			return ((this.currentUser !== "player") && (this.currentMode === "simulation") && (this.node.kind === "snap"));
		},
		showDiscoverableRing(): boolean {
			return ((this.currentUser !== "player") && (this.currentMode === "discovery") && this.isDiscoverable);
		},
		showOverlapPadding(): boolean {
			return this.store.settings.overlapPadding.enable && this.store.settings.overlapPadding.show;
		},
		showLabel(): boolean {
			return true;
		},
		
		isSimulationEnabled(): boolean {
			return (this.node as any).sim?.enabled;
		},
		isDiscoverable(): boolean {
			return true;
		},
		isDragging(): boolean {
			return true;
		},
	},
	methods: {
		onPointerDown(event: PointerEvent) {
			switch (this.currentMode) {
				case "edit":
					return this.onPointerDown_drag(event);
			}
		},
		onEnter(event: MouseEvent) {
		},
		onLeave(event: MouseEvent) {
		},
	}
});
</script>

<style scoped lang="scss">
.pad-preview { pointer-events:none; }
.pad-circle {
	fill: rgba(96,165,250,0.05);
	stroke: rgba(96,165,250,0.35);
	stroke-width:1;
	stroke-dasharray:4 4;
}

.node {
	.core {
		stroke: #15204e;
		stroke-width: 2;
	}

	.halo {
		opacity: 0;
		fill: rgba(96,165,250,0.18);
		stroke: rgba(96,165,250,0.5);
		stroke-width: 1.5;
		pointer-events: none;
	}
	&.show-halo {
		.halo {
			opacity: 1;
		}
	}

	.bonus-dot {
		opacity: 0;
		r: 3.5;
		fill: var(--ok, #10b981);
		stroke: rgba(255,255,255,0.9);
		stroke-width: 1;
		pointer-events: none;
	}
	&.show-bonus-dot {
		.bonus-dot {
			opacity: 1;
		}
	}

	.lock-dot {
		opacity: 0;
		r: 3.5;
		fill: #f59e0b;
		stroke: rgba(255,255,255,0.9);
		stroke-width: 1;
		pointer-events: none;
	}
	&.show-lock-dot {
		.lock-dot {
			opacity: 1;
		}
	}

	.simulation-ring {
		opacity: 0;
		fill: none;
		stroke: #999;
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
		pointer-events: none;
	}
	&.show-simulation-ring {
		.simulation-ring {
			opacity: 1;
		}
	}
	&.simulation-enabled {
		.simulation-ring {
			stroke: #f59e0b;
		}
	}

	.discoverable-ring {
		opacity: 0;
		fill: none;
		stroke: #f59e0b;
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
		pointer-events: none;
	}
	&.show-discoverable-ring {
		.discoverable-ring {
			opacity: 1;
		}
	}

	.overlap-padding {
		opacity: 0;
		fill: rgba(96,165,250,0.05);
		stroke: rgba(96,165,250,0.35);
		stroke-width:1;
		stroke-dasharray:4 4;
	}
	&.show-overlap-padding {
		.overlap-padding {
			opacity: 1;
		}
	}
}
</style>