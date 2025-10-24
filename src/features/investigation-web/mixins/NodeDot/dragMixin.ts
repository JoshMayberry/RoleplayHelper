import { defineComponent } from "vue";
import { NodeAny } from "@features/investigation-web/types/node";
import { CommonNodeMixin } from "./commonNodeMixin";


export const DragMixin = defineComponent({
	mixins: [CommonNodeMixin],
  props: {
    node: { type: Object as () => NodeAny, required: true },
	},
	data() {	
		return {
      isMoved: false,
			wasSelectedAtPointerDown: false,
		};
	},
	async mounted() {
	},
	methods: {
		onPointerDown_drag(event: PointerEvent) {
			this.wasSelectedAtPointerDown = this.isSelected;
			this.store.selected.node = this.node;

			if (this.node.locked) {
        event.stopPropagation();
				return
			}

			switch (this.node.kind) {
				case "snap":
					this.currentEditMode = "drag-snap-node";
					break;

				case "free":
					this.currentEditMode = "drag-free-node";
					break;
			}

			const converted = this.convertClientToWorld(event.clientX, event.clientY);
			this.store.dragStart(converted.x, converted.y);
      window.addEventListener("pointerup", this.onPointerUp_drag, { once:true });
		},
		onPointerUp_drag(event: PointerEvent) {
			const wasDragging = this.store.drag.isDragging;

			if (this.currentEditMode === "drag-track") {
				this.currentEditMode = "drag-track-end";
      	window.addEventListener("pointerup", this.onPointerUp_drag, { once:true }); // Let this call one more time
			} else {
				this.currentEditMode = "none";
				this.store.dragEnd();
			}

			if (wasDragging) {
				if (this.store.drag.isValid) {
					this.store.moveNode(this.node.id, this.store.drag.currentPosition);
				}

				if (!this.wasSelectedAtPointerDown) {
					this.store.selected.node = undefined;
				}
			}
		},
	},
});
