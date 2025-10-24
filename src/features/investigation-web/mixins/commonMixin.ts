import { defineComponent } from "vue";
import { useMainStore } from "../stores/mainStore";
import { Mode, EditMode, User, RSTransform } from "../types";
import { Snapshot } from "@features/investigation-web/types/snapshot";

export const CommonMixin = defineComponent({
	data() {
		return {
			store: useMainStore(),
		};
	},
	computed: {
		svgElement(): SVGSVGElement | null {
			return this.store.svgElement;
		},
		worldElement(): SVGGElement | null {
			return this.store.worldElement;
		},
		rsTransform: {
			get(): RSTransform { return this.store.rsTransform; },
			set(newValue: RSTransform) { this.store.rsTransform = newValue; },
		},

		currentMode: {
			get(): Mode { return this.store.currentMode; },
			set(newValue: Mode) { this.store.currentMode = newValue; },
		},
		currentEditMode: {
			get(): EditMode { return this.store.currentEditMode; },
			set(newValue: EditMode) { this.store.currentEditMode = newValue; },
		},
		currentUser: {
			get(): User { return this.store.currentUser; },
			set(newValue: User) { this.store.currentUser = newValue; },
		},
		currentSnapshot(): Snapshot | undefined {
			return this.store.currentSnapshot;
		},

		currentEditMode_usesDragBehavior(): boolean {
			return (this.currentEditMode == "link-lasso") || (this.currentEditMode == "link-cutter");
		},
		currentEditMode_isAdding(): boolean {
			return  (this.currentEditMode === "add-free-node") || (this.currentEditMode === "add-snap-node") || (this.currentEditMode === "add-track") || (this.currentEditMode === "add-calc-group") ||(this.currentEditMode === "add-link");
		},
		currentEditMode_isDragging(): boolean {
			return  (this.currentEditMode === "drag-free-node") || (this.currentEditMode === "drag-snap-node") || (this.currentEditMode === "drag-track") || (this.currentEditMode === "drag-track-end");
		},
		currentEditMode_isDraggingNode(): boolean {
			return (this.currentEditMode === "drag-free-node") || (this.currentEditMode === "drag-snap-node");
		},
	},
	methods: {
		convertClientToWorld(clientX: number, clientY: number){
			if (!this.svgElement) {
				return { x:0, y:0 };
			}


			const r = this.svgElement.getBoundingClientRect();
			const sx = clientX - r.left;
			const sy = clientY - r.top;
			return {
				x:(sx - this.rsTransform.x)/this.rsTransform.k,
				y:(sy - this.rsTransform.y)/this.rsTransform.k,
			};
		},
		convertWorldToClient(x: number, y: number){
			if (!this.svgElement) {
				return { x:0, y:0 };
			}

			const r = this.svgElement.getBoundingClientRect();
			return {
				x: r.left + (x*this.rsTransform.k + this.rsTransform.x),
				y: r.top + (y*this.rsTransform.k + this.rsTransform.y)
			};
		},
	},
});