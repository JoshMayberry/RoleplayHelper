import { defineComponent } from "vue";
import { gsap } from "gsap";

export const OpenDrawerMixin = defineComponent({
  emits: ["update:modelValue"],
	data() {
		return {
			drawerWidth: 0,
		};
	},
	props: {
		modelValue: { type: Boolean, default: false },  // v-model open/close
	},
	computed: {
		isOpen: {
			get(): boolean { return this.modelValue; },
			set(v: boolean) { this.$emit("update:modelValue", v); },
		},
	},
	mounted() {
		if (this.isOpen) {
			gsap.set(this.$refs.panel as HTMLElement, { x: this.drawerWidth, opacity: 1 });
		} else {
			gsap.set(this.$refs.panel as HTMLElement, { x: "100%", opacity: 1 });
		}
	},
	watch: {
		isOpen: {
			handler(v: boolean) {
				this.animate(v);
			},
			immediate: true,
		},
	},
	methods: {
		 close() { this.isOpen = false; },

		animate(shouldOpen: boolean) {
			const panel = this.$refs.panel as HTMLElement;
			if (!panel) {
				console.debug("[soundboard] No panel ref found for animation");
				return;
			}

			if (shouldOpen) {
				gsap.fromTo(panel, { x: this.drawerWidth }, { x: 0, duration: 0.25, ease: "power2.out" });
			} else {
				gsap.fromTo(panel, { x: 0 }, { x: this.drawerWidth, duration: 0.25, ease: "power2.out" });
			}
		},
	},
});