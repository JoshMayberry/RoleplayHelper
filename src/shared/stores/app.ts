// Utilities
import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
	state: () => ({
		helpInfoLeft: "",
		helpInfoRight: "",
	}),

	getters: {
	},
	actions: {
		clearHelp() {
			this.helpInfoLeft = "";
			this.helpInfoRight = "";
		}
	},
})
