<template>
	<g v-if="nodeFrom && nodeTo"
		:data-id="link.id"
		class="link"
		:class="{
			'simulation-enabled': isSimulationEnabled,
			'show-simulation-outline': showSimulationOutline,
		}"
	>
		<!-- <path
			v-bind="pathAttributes"
			class="hit"
			:stroke-width="hitWidth"
			@pointerdown.stop="onLinkPointerDown"
			@mouseenter="onEnter"
			@mouseleave="onLeave"
			@click.stop
		/> -->
		<path
			v-bind="pathAttributes"
			class="core"
			:class="{
				dashed__long: link.stroke === 'dashed',
				dashed__short: link.stroke === 'dotted',
			}"
			:style="{
				color: link.color
			}"
			:marker-end="link.arrowHead ? 'url(#iw-arrow-head)' : undefined"
		/>
		<path
			:d="straightOverlay"
			class="simulation-outline"
		/>
	</g>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CommonMixin } from "../mixins/commonMixin";
import { LinkAny, LinkCurved, LinkSpline, LinkStraight } from "../types/links";
import { NodeAny } from "../types/node";

export default defineComponent({
	name: "Link",
	mixins: [CommonMixin],
  props: {
    link: { type: Object as () => LinkAny, required: true },
	},
  data(){
		return {};
	},
  computed:{
		isSimulationEnabled(): boolean {
			return (this.link as any).sim?.enabled;
		},
		showSimulationOutline(): boolean {
			return ((this.currentUser !== "player") && (this.currentMode === "simulation") && this.isSimulationEnabled);
		},
		nodeFrom(): NodeAny {
			return this.store.nodeMap[this.link.from];
		},
		nodeTo(): NodeAny {
			return this.store.nodeMap[this.link.to];
		},
    straightOverlay() {
      if (!this.nodeFrom || !this.nodeTo) return "";
      return `M ${this.nodeFrom.x} ${this.nodeFrom.y} L ${this.nodeTo.x} ${this.nodeTo.y}`;
    },
		hitWidth() {
			return 2 + this.store.settings.linkHitRadius * 2;
		},
		pathAttributes() {
			if (!this.nodeFrom || !this.nodeTo) {
				return {};
			}

			switch (this.link.type) {
				case "straight":
					return this.pathAttributes_straight;
				case "spline":
					return this.pathAttributes_spline;
				case "curved":
					return this.pathAttributes_curved;
			}

			console.error(`Unknown link type '${this.link.type}'`);
			return {};
		},
		pathAttributes_straight() {
			const link = this.link as LinkStraight;
			const dx = this.nodeTo.x - this.nodeFrom.x;
			const dy = this.nodeTo.y - this.nodeFrom.y;
			const length = Math.hypot(dx, dy) || 1;
			const ux = dx / length;
			const uy = dy / length;
			const aOff = (this.nodeFrom.r || 12) + (link.pad || 0);
			const bOff = (this.nodeTo.r || 12) + (link.pad || 0);
			return {
				x1: this.nodeFrom.x + ux * aOff,
				y1: this.nodeFrom.y + uy * aOff,
				x2: this.nodeTo.x - ux * bOff,
				y2: this.nodeTo.y - uy * bOff,
			};
		},
		pathAttributes_spline() {
			const link = this.link as LinkSpline;
			const pad = link.pad || 0;
			const dx = this.nodeTo.x - this.nodeFrom.x, dy = this.nodeTo.y - this.nodeFrom.y;
			const dist = Math.hypot(dx, dy) || 1;
			const ux = dx / dist, uy = dy / dist;
			const nx = -uy, ny = ux;
			const s = { x: this.nodeFrom.x + ux * ((this.nodeFrom.r||12)+pad), y: this.nodeFrom.y + uy * ((this.nodeFrom.r||12)+pad) };
			const e = { x: this.nodeTo.x - ux * ((this.nodeTo.r||12)+pad), y: this.nodeTo.y - uy * ((this.nodeTo.r||12)+pad) };
			const segLen = Math.hypot(e.x - s.x, e.y - s.y) || 1;

			const controls = (link.controls && link.controls.length ? link.controls : [{ t: 50, off: 0 }]).map((c:any)=>{
				const t = Math.max(0, Math.min(100, Number(c.t))) / 100;
				const off = Math.max(-100, Math.min(100, Number(c.off))) / 100;
				return {
					x: s.x + ux * (t * segLen) + nx * (off * segLen),
					y: s.y + uy * (t * segLen) + ny * (off * segLen)
				};
			});

			const pts = [s, ...controls, e];
			if (pts.length === 2) return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;

			const tParam = Math.max(0, Math.min(1, Number(link.tension ?? 0.25)));
			const k = (1 - tParam) / 6;
			const P = (i:number) => pts[Math.max(0, Math.min(pts.length-1, i))];
			let d = `M ${pts[0].x} ${pts[0].y}`;
			for (let i=0;i<pts.length-1;i++){
				const p0 = P(i-1), p1 = P(i), p2 = P(i+1), p3 = P(i+2);
				const c1 = { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k };
				const c2 = { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k };
				d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
			}

			return { d };
		},
		pathAttributes_curved() {
			const link = this.link as LinkCurved;
			const pad = link.pad || 0;
			const dx = this.nodeTo.x - this.nodeFrom.x, dy = this.nodeTo.y - this.nodeFrom.y;
			const dist = Math.hypot(dx, dy) || 1;
			const ux = dx/dist, uy = dy/dist;
			const nx = -uy, ny = ux;
			const s = { x: this.nodeFrom.x + ux * ((this.nodeFrom.r||12)+pad), y: this.nodeFrom.y + uy * ((this.nodeFrom.r||12)+pad) };
			const e = { x: this.nodeTo.x - ux * ((this.nodeTo.r||12)+pad), y: this.nodeTo.y - uy * ((this.nodeTo.r||12)+pad) };
			const segLen = Math.hypot(e.x - s.x, e.y - s.y) || 1;
			let ctrls: {x:number;y:number}[] = [];
			if (Array.isArray(link.midControls) && link.midControls.length) {
				ctrls = link.midControls.map((c:any) => {
					const t = Math.max(0, Math.min(100, Number(c.t))) / 100;
					const off = Math.max(-100, Math.min(100, Number(c.off))) / 100;
					return {
						x: s.x + ux * (t * segLen) + nx * (off * segLen),
						y: s.y + uy * (t * segLen) + ny * (off * segLen)
					};
				});
			} else if (Array.isArray(link.midpoints) && link.midpoints.length) {
				ctrls = link.midpoints.slice();
			}
			const pts = [s, ...ctrls, e];
			let d = `M ${pts[0].x} ${pts[0].y}`;
			if (pts.length === 2) {
				d += ` L ${pts[1].x} ${pts[1].y}`;
				return {d};
			}
			for (let i = 1; i < pts.length - 1; i++) {
				const ctrl = pts[i];
				const next = pts[i+1];
				const end = i < pts.length - 2 ? { x:(ctrl.x+next.x)/2, y:(ctrl.y+next.y)/2 } : next;
				d += ` Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
			}
			return {d};
		},
  },
  methods:{
		onLinkPointerDown() {

		},
		onEnter() {

		},
		onLeave() {

		},
  }
});
</script>

<style scoped lang="scss">
.link {
	.simulation-outline {
		opacity: 0;
		vector-effect: non-scaling-stroke;
		fill: none;
		stroke: #f59e0b;
		stroke-width: 1.5;
		stroke-dasharray: 6 4;
		pointer-events: none;
	}
	&.show-simulation-outline {
		.simulation-outline {
			opacity: 0.85;
		}
	}

	.core {
		stroke: currentColor;
		stroke-width: 2;
		stroke-opacity: 0.9;
		fill: none;
		vector-effect: non-scaling-stroke;

		&.dashed {
			&__long {
				stroke-dasharray: 6 4
			}
			&__short {
				stroke-dasharray: 2 4
			}
		}
	}

	.hit {
		stroke: rgba(0,0,0,0);
		fill: none;
		vector-effect: non-scaling-stroke;
		pointer-events: stroke;
	}
}
</style>