import { defineComponent } from "vue";
import { CommonMixin } from "../commonMixin";

import { Snapshot } from "@features/investigation-web/types/snapshot";
import { capitalCase } from "change-case";

export const LoadFilesMixin = defineComponent({
	mixins: [CommonMixin],
	data() {	
		return {
			isLoading: false,
		};
	},
	async mounted() {
		await this.loadAllData();
	},
	methods: {
		async loadAllData() {
			this.isLoading = true;
			this.store.snapshotList = [];
			try {
				// get file names from the server
				const listRes = await fetch("/api/files?folder=investigation-web");
				const { files } = await listRes.json() as { files: string[] };

				for (const name of files) {
					const r = await fetch(`/api/data?folder=investigation-web&filename=${encodeURIComponent(name)}`);
					const json = await r.json() as Snapshot;
					this.store.snapshotList.push(this.formatFile(name, json));
				}
			} catch (err) {
				console.error("[investigation-web] loadAllData failed:", err);
			} finally {
				this.isLoading = false;
			}
		},
		formatFile(fileName: string, payload: Snapshot): Snapshot {
			if (!payload.title) {
				payload.title = capitalCase(fileName)
			}
			return payload
		},
		onSelectFile(index: unknown) {
			this.store.currentSnapshotIndex = index as number;
		},
	},
});
