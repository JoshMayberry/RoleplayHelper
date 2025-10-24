import { defineComponent } from "vue";
import { useSoundboardStore } from "@features/soundboard/stores/soundboard";

export const SelectMixin = defineComponent({
	data() {
		return {
			soundboardStore: useSoundboardStore(),
		};
	},

	methods: {
		onSelect(itemList: any) {
			const item = itemList?.[0];
			if (!item) {
				console.debug("Deselected Item");
				return;
			}
			// console.debug("Selected item:", item);

			switch (item.type) {
				case "file":
					this.soundboardStore.selectFile(item);
					break;
				case "group":
					this.soundboardStore.selectGroup(item);
					break;
				case "subGroup":
					this.soundboardStore.selectSubGroup(item);
					break;
				case "track":
					this.soundboardStore.selectTrack(item);
					break;
			}
		},
	},
});
