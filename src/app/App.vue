<template>
	<v-app>
		<v-layout>
			<AppHeader
				@open-settings="isSettingsOpen = true"
				@open-player="isPlayerOpen = true"
			/>

			<SettingsPanel v-model="isSettingsOpen" />
			<PlayerDrawer
				v-model="isPlayerOpen"
			/>

			<v-main>
				<router-view />
			</v-main>

			<AppFooter />
		</v-layout>
	</v-app>
</template>

<script lang="ts">
import { useAppStore } from "@shared/stores/app";
import AppFooter from "@app/components/layout/AppFooter.vue"
import AppHeader from "@app/components/layout/AppHeader.vue"
import SettingsPanel from "@app/components/layout/SettingsPanel.vue"
import PlayerDrawer from "@features/soundboard/components/PlayerDrawer.vue"

export default {
	name: "App",
	components: { AppHeader, AppFooter, SettingsPanel, PlayerDrawer },
	data() {
		return {
			openAside: "" as "settings" | "player" | "",
			appStore: useAppStore(),
		};
	},
	watch: {
		$route: { immediate: true, deep: true, handler() {
			this.appStore.clearHelp()
		}}
	},
	computed: {
		isSettingsOpen: {
			get(): boolean {
				return this.openAside === "settings";
			},
			set(newValue: boolean) {
				this.openAside = newValue ? "settings" : "";
			},
		},
		isPlayerOpen: {
			get(): boolean {
				return this.openAside === "player";
			},
			set(newValue: boolean) {
				this.openAside = newValue ? "player" : "";
			},
		},
	},
}
</script>

<style>
.v-main {
	position: relative;
	display: flex;
	flex-direction: row;

	& > * {
		flex: 1;
	}
}

/* Let the label be readble with text behind it. */
.v-textarea .v-field__input {
    flex: 1 1 auto;
    outline: none;
    -webkit-mask-image: linear-gradient(to bottom,transparent,transparent calc(var(--v-field-padding-top, 0) + var(--v-input-padding-top, 0) - 6px),black calc(var(--v-field-padding-top, 0) + var(--v-input-padding-top, 0) + 4px)),linear-gradient(to right,transparent,transparent calc(100% - var(--v-textarea-scroll-bar-width, 16px)),black calc(100% - var(--v-textarea-scroll-bar-width, 16px)));
    mask-image: linear-gradient(to bottom,transparent,transparent calc(var(--v-field-padding-top, 0) + var(--v-input-padding-top, 0) - 6px),black calc(var(--v-field-padding-top, 0) + var(--v-input-padding-top, 0) + 4px)),linear-gradient(to right,transparent,transparent calc(100% - var(--v-textarea-scroll-bar-width, 16px)),black calc(100% - var(--v-textarea-scroll-bar-width, 16px)));
}
</style>
