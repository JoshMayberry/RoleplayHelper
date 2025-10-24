import { defineComponent } from "vue";
import { CommonMixin } from "../commonMixin";

export const StagingMixin = defineComponent({
	mixins: [CommonMixin],
	computed: {
		stashZoneColor(): string {
			if (this.currentEditMode_isDraggingNode) {
				return "rgba(96,165,250,0.15)";
			}
			return "rgba(96,165,250,0.08)";
		},
		stashZoneShow(): boolean {
			if (this.currentUser == "player") {
				return false;
			}

			if (this.currentEditMode_isDraggingNode) {
				return true;
			}

			return false;
		},
	},
});