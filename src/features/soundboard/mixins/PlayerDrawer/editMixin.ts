// mixins/EditMixin.ts
import { defineComponent } from "vue";
import { useEditorStore } from "@/features/soundboard/stores/editor";
import type { FileNode, Group, SubGroup, Track } from "@features/soundboard/types";

export const EditMixin = defineComponent({
  data() {
    return { editorStore: useEditorStore() };
  },
  methods: {
    editItem(item: FileNode | Group | SubGroup | Track) {
      this.editorStore.beginEdit(item);
    },
  },
});
