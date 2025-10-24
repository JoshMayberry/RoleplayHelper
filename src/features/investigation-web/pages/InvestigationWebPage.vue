<template>
	<div class="investigation-web-page">
		<Dresser
			side="left"
			@drawer:change="onLeftDrawerChanged"
		>
			<Drawer
				:drawer="{ icon: 'mdi-folder', label: 'Load/Save', extra: { mode: 'folder' }}"
			>
				<v-chip-group mandatory column @update:modelValue="onSelectFile">
					<v-chip v-for="file in store.snapshotList" >{{ file.title }}</v-chip>
				</v-chip-group>
			</Drawer>
			<Drawer
				:drawer="{ icon: 'mdi-pencil', label: 'Edit', extra: { mode: 'edit' }}"
			>
				<p>TODO</p>
			</Drawer>
			<Drawer
				:drawer="{ icon: 'mdi-eye', label: 'Discovery', extra: { mode: 'discovery' }}"
			>
				<p>TODO</p>
			</Drawer>
			<Drawer
				:drawer="{ icon: 'mdi-filter', label: 'Filters', extra: { mode: 'filter' }}"
			>
				<p>TODO</p>
			</Drawer>
			<Drawer
				:drawer="{ icon: 'mdi-star', label: 'Bonuses', extra: { mode: 'bonus' }}"
			>
				<p>TODO</p>
			</Drawer>
			<Drawer
				:drawer="{ icon: 'mdi-run', label: 'Simulation', extra: { mode: 'simulation' }}"
			>
				<p>TODO</p>
			</Drawer>
			<Drawer
				:drawer="{ icon: 'mdi-cog', label: 'Settings', extra: { mode: 'setting' }}"
			>
				<p>TODO</p>
			</Drawer>
		</Dresser>

		<InvestigationWeb />

		<Dresser side="right" >
			<Drawer
				:drawer="{ icon: 'mdi-seat', label: 'Staging' }"
			>
				<p>TODO</p>
			</Drawer>
			<Drawer
				:drawer="{ icon: 'mdi-plus', label: 'Add' }"
			>
				<p>TODO</p>
			</Drawer>
		</Dresser>
	</div>
</template>

<script lang="ts">
import Dresser from "@shared/components/layout/Dresser.vue";
import Drawer from "@shared/components/layout/Drawer.vue";
import { DrawerConfig } from "@shared/types";
import { CommonMixin } from "../mixins/commonMixin";
import { LoadFilesMixin } from "../mixins/InvestigationWebPage/loadFilesMixin";
import InvestigationWeb from "../components/InvestigationWeb.vue";

export default {
	name: "InvestigatioNWebPage",
	components: { Dresser, Drawer, InvestigationWeb },
	mixins: [LoadFilesMixin, CommonMixin],
	data() {
		return {
		};
	},
	methods: {
		onLeftDrawerChanged({ index, config }: { index: number, config: DrawerConfig }) {
			this.currentMode = config?.extra?.mode || "view";
		},
	},
};
</script>

<style scoped lang="scss">
.investigation-web-page {
	position: relative;
	display: flex;
	flex-direction: row;
}
</style>
