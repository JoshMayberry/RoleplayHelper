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
				<EditWebItem/>
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
import EditWebItem from "../components/EditWebItem.vue";
import { HelpType } from "../types";

export default {
	name: "InvestigatioNWebPage",
	components: { Dresser, Drawer, InvestigationWeb, EditWebItem },
	mixins: [LoadFilesMixin, CommonMixin],
	data() {
		return {
		};
	},
	mounted() {
		this.updateHelpLeft();
		this.updateHelpRight();
	},
	watch: {
		currentMode(newValue: string) {
			this.updateHelpLeft();
		},
		currentEditMode(newValue: string) {
			this.updateHelpRight();
		},
	},
	methods: {
		onLeftDrawerChanged({ index, config }: { index: number, config: DrawerConfig }) {
			this.currentMode = config?.extra?.mode || "view";
		},
		updateHelpLeft() {
			this.appStore.helpInfoLeft = this.getHelpText(this.store.settings.help.left.text);
			switch (this.store.settings.help.left.otherOnChange) {
				case "clear":
					this.appStore.helpInfoRight = "";
					break;
				case "update":
					this.appStore.helpInfoRight = this.getHelpText(this.store.settings.help.right.text);
					break;
			}
		},
		updateHelpRight() {
			this.appStore.helpInfoRight = this.getHelpText(this.store.settings.help.right.text);
			switch (this.store.settings.help.right.otherOnChange) {
				case "clear":
					this.appStore.helpInfoLeft = "";
					break;
				case "update":
					this.appStore.helpInfoLeft = this.getHelpText(this.store.settings.help.left.text);
					break;
			}
		},
		getHelpText(kind: HelpType): string {
			switch (kind) {
				case "none":
					return "";

				case "current-mode": 
					return `Current Mode: ${this.currentMode}`;

				case "current-sub-mode":
					switch (this.currentMode) {
						case "edit":
							return `Current Edit Mode: ${this.currentEditMode}`;
						default:
							return "";
					}
			}

			throw new Error(`Unknown help type '${kind}'`);
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
