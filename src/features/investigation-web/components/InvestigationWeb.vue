<template>
	<svg
			ref="svg"
	    @contextmenu.prevent="onContextMenu"
			@pointerdown="onPointerDown"
			@pointerup="onPointerUp"
			@pointermove="onPointerMove"
		>
			<defs>
        <marker id="iw-arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
        </marker>

				<pattern id="grid-overlay"
					:patternTransform="`translate(${rsTransform.x},${rsTransform.y}) scale(${rsTransform.k})`"
					patternUnits="userSpaceOnUse"
					patternContentUnits="userSpaceOnUse"
					:width="gridOverlaySize" :height="gridOverlaySize">
					<path :d="`M ${gridOverlaySize} 0 V ${gridOverlaySize} M 0 ${gridOverlaySize} H ${gridOverlaySize}`"
							stroke="rgba(255,255,255,.12)"
							vector-effect="non-scaling-stroke"/>
				</pattern>
      </defs>

      <g
				ref="world"
				class="world"
				:transform="`translate(${rsTransform.x},${rsTransform.y}) scale(${rsTransform.k})`"
			>
			  <g class="nodes" >
					<NodeDot v-for="node in nodeList" :key="node.id" :node="node" />
				</g>
			  <g class="links" >
					<Link v-for="link in linkList" :key="link.id" :link="link" />
				</g>
				<g class="ghosts" >
					<NodeGhost />
				</g>
      </g>
      <g class="overlay">
    		<rect v-if="gridOverlayShow" class="grid-overlay" />
				<rect v-if="stashZoneShow" class="stash-zone" :fill="stashZoneColor" />
			</g>
		</svg>
</template>


<script lang="ts">
import { DrawerConfig } from "@shared/types";
import { ZoomMixin } from "../mixins/InvestigationWeb/zoomMixin";
import { CommonMixin } from "../mixins/commonMixin";
import { StagingMixin } from "../mixins/InvestigationWeb/stagingMixin";
import { GridOverlayMixin } from "../mixins/InvestigationWeb/gridOverlayMixin";
import NodeDot from "./NodeDot.vue";
import Link from "./Link.vue";
import { NodeAny } from "../types/node";
import { LinkAny } from "../types/links";
import NodeGhost from "./NodeGhost.vue";

export default {
	name: "InvestigationWeb",
	components: { NodeDot, Link, NodeGhost },
	mixins: [ZoomMixin, StagingMixin, GridOverlayMixin, CommonMixin],
	data() {
		return {
		};
	},
  mounted(){
		this.store.init(this.$refs.svg as SVGSVGElement, this.$refs.world as SVGGElement)
		this.currentUser = "gm";
		this.initZoom();
    window.addEventListener("keydown", this.onKeyDown);
	},
	unmounted() {
    window.removeEventListener("keydown", this.onKeyDown);
	},
	computed: {
		nodeList(): NodeAny[] {
			return this.currentSnapshot?.nodes || [];
		},
		linkList(): LinkAny[] {
			return this.currentSnapshot?.links || [];
		},
	},
	methods: {
		onLeftDrawerChanged({ index, config }: { index: number, config: DrawerConfig }) {
			this.currentMode = config?.extra?.mode || "view";
		},
		onContextMenu() {
			this.store.cancel();
		},
		onKeyDown(event: KeyboardEvent) {
			switch(event.key) {
				case "Escape":
					this.store.cancel();
			}
		},
		onPointerDown(event: PointerEvent) {
		},
		onPointerMove(event: PointerEvent) {
			if ((event.pressure) && (this.store.drag.isDragging !== false)) {
				// Allow things to be dragged outside of their initial shape
				const converted = this.convertClientToWorld(event.clientX, event.clientY);
				return this.store.dragUpdate(converted.x, converted.y, !event.ctrlKey);
			}
		},
		onPointerUp(event: PointerEvent) {
		},
	},
};
</script>

<style scoped lang="scss">
svg {
	flex: 1;
	background: #0d142c radial-gradient(circle at 40% 35%, #142653 0%, #0d142c 70%);

	.world {
		vector-effect: non-scaling-stroke;
	}

	.overlay {
		pointer-events:none;

		.grid-overlay {
			x: 0;
			y: 0;
			width: 100%;
			height: 100%;
			fill: url(#grid-overlay);
		}

		.stash-zone {
			x: 90%;
			y: 0;
			width: 10%;
			height: 100%;
			stroke: rgba(96,165,250,0.45);
			stroke-dasharray: 4 4;
			rx: 3;
		}
	}
}
</style>
