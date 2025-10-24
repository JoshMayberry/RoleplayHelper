import { defineComponent } from "vue";

import type { FileNode, PartialGroup } from "@features/soundboard/types";
import { formatFile } from "@features/soundboard/utils/formatting";

export const LoadFilesMixin = defineComponent({
	data() {
		return {
			fileNodes: [] as FileNode[],
			isLoading: false,
		};
	},
	async mounted() {
		await this.loadAllData();
	},
	methods: {
		async loadAllData() {
      this.isLoading = true;
      this.fileNodes = [];
      try {
        // get file names from the server
        const listRes = await fetch("/api/files?folder=soundboard");
        const { files } = await listRes.json() as { files: string[] };

        for (const name of files) {
          const r = await fetch(`/api/data?folder=soundboard&filename=${encodeURIComponent(name)}`);
          const json = await r.json() as PartialGroup[];
          this.fileNodes.push(formatFile(name + ".json", json));
        }
      } catch (err) {
        console.error("[soundboard] loadAllData failed:", err);
      } finally {
        this.isLoading = false;
      }
    },
	},
});
