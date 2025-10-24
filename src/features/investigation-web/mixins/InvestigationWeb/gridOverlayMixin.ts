import * as d3 from "d3"
import { defineComponent } from "vue";
import { CommonMixin } from "../commonMixin";

export const GridOverlayMixin = defineComponent({
	mixins: [CommonMixin],
	computed: {
		gridOverlaySize(): number {
			return this.store.settings.gridOverlay.size;
		},
		gridOverlayShow(): boolean {
			if (!this.store.settings.gridOverlay.enabled || (this.currentUser == "player")) {
				return false;
			}

			if ((this.currentMode === "setting") || this.store.settings.gridOverlay.alwaysVisible) {
				return true;
			}

			return this.currentEditMode_isAdding || this.currentEditMode_isDragging;
		},
	},
	methods: {
		
	}
});