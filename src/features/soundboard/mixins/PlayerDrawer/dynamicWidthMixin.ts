import { defineComponent } from "vue";

export const DynamicWidthMixin = defineComponent({
	data() {
		return {
      		drawerWidth: 0,
		};
	},
	props: {
		modelValue: { type: Boolean, default: false },  // v-model open/close
	},
  mounted() {
    window.addEventListener('resize', this.recomputeWidth);
    this.$nextTick(this.recomputeWidth);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.recomputeWidth);
  },
	 watch: {
    isOpen: {
      handler(newValue: boolean) {
		// Ensure it has a width before opening
        if (newValue && (this.drawerWidth <= 0)) {
          this.recomputeWidth();
        }
      },
      immediate: true,
    },
	},
	methods: {
		recomputeWidth() {
			const holder = this.$refs.ytHolder as HTMLElement | undefined;
			const scroll = this.$refs.scrollArea as HTMLElement | undefined;
			if (!holder) return;

			const frame = holder.querySelector("iframe") as HTMLElement | null;
			if (!frame) return;


			const width = Math.ceil(frame.getBoundingClientRect().width || 0);
			if (width <= 0) return;

			const padX = (() => {
				if (!scroll) return 24;
				const cs = getComputedStyle(scroll);
				return (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
			})();

			this.drawerWidth = width + padX;
		},
	},
});
