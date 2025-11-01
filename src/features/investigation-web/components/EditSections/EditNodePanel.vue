<template>
	<div class="edit-node-panel">
		<v-text-field label="Id"
			density="comfortable" variant="solo-filled"
			:disabled="store.selected.node === undefined"
			:model-value="store.selected.node?.id ?? ''"
			@update:model-value="val => store.updateSelectedNode('id', val)"
		/>
		<EditLabelSection :store="store" />

		<v-textarea label="Description"
			density="comfortable" variant="solo-filled" inset
			:disabled="store.selected.node === undefined"
			:model-value="store.selected.node?.description ?? ''"
			@update:model-value="val => store.updateSelectedNode('description', val)"
		/>
		<div style="display: flex; gap: 0.2rem;">
			<v-number-input label="R"
				density="comfortable" variant="solo-filled" inset control-variant="stacked"
				:disabled="store.selected.node === undefined"
				:model-value="store.selected.node?.r ?? 0"
				@update:model-value="val => store.updateSelectedNode('r', val)"
			/>
			<v-number-input label="X"
				density="comfortable" variant="solo-filled" inset control-variant="hidden"
				:disabled="store.selected.node === undefined"
				:model-value="store.selected.node?.x ?? 0"
				@update:model-value="val => store.updateSelectedNode('x', val)"
			/>
			<v-number-input label="Y"
				density="comfortable" variant="solo-filled" inset control-variant="hidden"
				:disabled="store.selected.node === undefined"
				:model-value="store.selected.node?.y ?? 0"
				@update:model-value="val => store.updateSelectedNode('y', val)"
			/>
		</div>

		<ColorInput v-model="nodeColorProxy" label="Color" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CommonMixin } from "../../mixins/commonMixin";
import ColorInput from "@shared/components/input/ColorInput.vue";
import EditLabelSection from "./EditLabelSection.vue";

export default defineComponent({
	name: "EditNodePanel",
	mixins: [CommonMixin],
	components: {ColorInput, EditLabelSection},
	computed: {
		nodeColorProxy: {
			get() {
				return this.store.selected.node?.color ?? "";
			},
			set(newValue: string) {
				if (this.store.selected.node) {
					this.store.updateSelectedNode("color", newValue);
				}
			}
		}
	},
});
</script>

<style scoped lang="scss">
</style>
