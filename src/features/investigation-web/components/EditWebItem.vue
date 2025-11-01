<template>
	<v-toolbar density="comfortable" elevation="0">
		<v-toolbar-title>{{ headerTitle }}</v-toolbar-title>
	</v-toolbar>
	<v-divider />

	<div v-if="currentEditMode_isEditing" class="editor-scroll">
		<EditNodePanel v-if="editingNode" class="pa-4" />
	</div>
	<v-spacer />
	<v-btn v-if="currentEditMode_isEditing"
		color="primary"
		:disabled="!store.isDirty"
		@click="console.log('TODO: Save')"
	>Save</v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CommonMixin } from "../mixins/commonMixin";
import EditNodePanel from "./EditSections/EditNodePanel.vue";

export default defineComponent({
	name: "EditWebItem",
	mixins: [CommonMixin],
	components: {EditNodePanel},
	data() {
		return {};
	},

	computed: {
		editingNode() {
			return this.currentEditMode === "edit-selected-node"
		},
		editingLink() {
			return this.currentEditMode === "edit-selected-link"
		},
		editingTrack() {
			return this.currentEditMode === "edit-selected-track"
		},
		headerTitle(): string {
			if (this.editingNode) {
				return "Edit Node";
			}
			if (this.editingLink) {
				return "Edit Link";
			}
			if (this.editingTrack) {
				return "Edit Track";
			}
			return "Nothing Selected"
		},

	},

	watch: {
	},

	methods: {
	},
});
</script>

<style scoped lang="scss">
.editor-panel { display: flex; flex-direction: column; }
.editor-scroll { flex: 1 1 auto; overflow: auto; }
.editor-actions {
	display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px;
	border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, .12));
}
</style>
