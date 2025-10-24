<template>
	<g v-if="isDragging"
		class="node-ghost"
	>
		<circle
			class="core"
			:transform="`translate(${transform.x},${transform.y})`"
      :r="r"
      :fill="isValid ?  color || 'grey' : 'rgba(239,68,68,0.30)'"
      :stroke="isValid ? color || 'grey' : '#ef4444'"
      :stroke-dasharray="isValid ? undefined : '4 4'"
		/>
	</g>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { CommonMixin } from "../mixins/commonMixin";
import { useDebounceFn } from '@vueuse/core'

export default defineComponent({
	name: "NodeGhost",
	mixins: [CommonMixin],
	data(){
		return {
			updateValidationDebounced: null as any,
		};
	},
	created() {
    this.updateValidationDebounced = useDebounceFn(() => {
      this.updateValidation();
    }, 120, { maxWait: 500 });
  },
  beforeUnmount() {
    this.updateValidationDebounced?.cancel?.();
  },
	computed:{
		transform() {
			return this.store.drag.currentPosition;
		},
		r() {
			return this.store.selected.node?.r || 12;
		},
		color() {
			return this.store.selected.node?.color || "grey";
		},
		isDragging() {
			return this.store.drag.isDragging && this.currentEditMode_isDraggingNode;
		},
		isValid() {
			return this.store.drag.isValid;
		},
	},
	watch: {
		isDragging() {
			this.updateValidation();
		},
		transform: {
			handler() {
				this.updateValidationDebounced();
			},
			deep: true,
		},
	},
	methods:{
		updateValidation() {
			switch (this.store.selected.node?.kind) {
				case undefined:
					return;

				case "snap":
					 // TODO: Is it on a track?
					this.store.drag.isValid = true;
					return;

				case "free":
					// TODO: Is the node too close to others?
					this.store.drag.isValid = true;
					return;
			}

			console.error(`Unknown node kind '${(this.store.selected.node as any)?.kind}'`)
		},
	}
});
</script>

<style scoped lang="scss">
.node-ghost {
	pointer-events:none;
	opacity: 0.9;

	.core {
    stroke-width: 2;
	}
}
</style>