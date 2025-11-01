<template>
	<v-footer app height="40">
		<div class="text-caption text-disabled">
			{{ helpInfoLeft }}
		</div>
		<v-spacer />
		<div class="text-caption text-disabled">
			{{ helpInfoRight }}
		</div>
	</v-footer>
</template>

<script lang="ts">
import { useAppStore } from "@shared/stores/app";
import { defineComponent } from "vue";
export default defineComponent({
	name: "AppFooter",
	data() {
		return {
			appStore: useAppStore(),
		}
	},
  computed: {
    helpInfoLeft() {
			return this.appStore.helpInfoLeft;
		},
    helpInfoRight() {
			return this.appStore.helpInfoRight;
		},
	},
})
</script>

<style scoped lang="scss">
.social-link :deep(.v-icon) {
	color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
	text-decoration: none;
	transition: 0.2s ease-in-out;

	&:hover {
		color: rgba(25, 118, 210, 1);
	}
}
</style>
