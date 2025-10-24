
<template>
	<v-sheet
		class="drawer"
		ref="drawer"
		:elevation="11"
		height="100%"
	>
		<slot />
	</v-sheet>
</template>

<script lang="ts">
import { DrawerConfig } from "@shared/types";
import { defineComponent } from "vue"

export default defineComponent({
	name: "Drawer",
	props: {
		drawer: {
			type: Object as () => DrawerConfig,
			required: true,
		},
	},
})
</script>

<style scoped>
</style>
