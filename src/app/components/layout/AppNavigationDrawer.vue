<template>
	<v-navigation-drawer v-model="isOpen" >
		<v-list nav>
			<v-list-item link title="Navigation drawer"></v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "AppNavigationDrawer",
	props: {
		isOpen: { type: Boolean, default: false },
	},
});
</script>

<style scoped lang="scss"></style>
