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
import AppFooter from "@app/components/layout/AppFooter.vue"
import AppHeader from "@app/components/layout/AppHeader.vue"
import SettingsPanel from "@app/components/layout/SettingsPanel.vue"
import PlayerDrawer from "@features/soundboard/components/PlayerDrawer.vue"

export default {
	name: "App",
	components: { AppHeader, AppFooter, SettingsPanel, PlayerDrawer },
	data() {
		return { openAside: "" as "settings" | "player" | ""  }
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
		}
	}
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
</style>
