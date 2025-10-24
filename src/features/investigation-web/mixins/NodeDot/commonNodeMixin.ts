import { defineComponent } from "vue";
import { CommonMixin } from "../commonMixin";
import { NodeAny } from "@features/investigation-web/types/node";


export const CommonNodeMixin = defineComponent({
	mixins: [CommonMixin],
	props: {
		node: { type: Object as () => NodeAny, required: true },
	},
	data() {	
		return {
			isMoved: false,
			wasSelectedAtDragStart: false,
			startClient:{ x:0, y:0 },
		};
	},
	computed: {
		isSelected() {
			return this.node.id === this.store.selected.node?.id
		},
	},
	methods: {
	},
});
