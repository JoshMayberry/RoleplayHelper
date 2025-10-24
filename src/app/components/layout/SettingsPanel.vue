<template>
	<v-navigation-drawer
		v-model="open"
		location="right"
		temporary
		width="380"
		class="settings-panel"
	>
		<v-toolbar density="comfortable" elevation="0">
			<v-toolbar-title>Settings</v-toolbar-title>
			<v-spacer />
			<v-btn icon @click="close" :title="'Close'">
				<v-icon>mdi-close</v-icon>
			</v-btn>
		</v-toolbar>
		<v-divider />

		<div class="settings-scroll">
			<v-list density="comfortable" nav lines="one">
				<v-list-subheader>Appearance</v-list-subheader>

		<v-list-item prepend-icon="mdi-theme-light-dark" title="Dark Mode">
			<template #append><v-switch v-model="darkMode" inset /></template>
		</v-list-item>

			</v-list>
		</div>

		<div class="settings-actions">
			<v-spacer />
			<v-btn variant="text" @click="reset">Reset</v-btn>
		</div>
	</v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useSettingsStore } from "@/shared/stores/settings";

export default defineComponent({
	name: "SettingsPanel",
	props: { modelValue: { type: Boolean, default: false } },
	emits: ["update:modelValue", "change"],
	data() {
		return {
			settingsStore: useSettingsStore(),
		};
	},
	computed: {
		open: {
			get(): boolean {
				return this.modelValue;
			},
			set(newValue: boolean) {
				this.$emit("update:modelValue", newValue);
			},
		},
		darkMode: {
			get(): boolean {
				return this.settingsStore.darkMode;
			},
			set(newValue: boolean) {
				this.settingsStore.setDarkMode(newValue);
			},
		},
	},
	methods: {
		close() {
			this.$emit("update:modelValue", false);
		},
		reset() {
			this.settingsStore.reset();
		},
	},
});
</script>

<style scoped lang="scss">
.settings-panel {
	display: flex;
	flex-direction: column;
}

.settings-scroll {
	flex: 1 1 auto;
	overflow: auto;
}

.settings-actions {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px;
	border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12));
}
</style>
