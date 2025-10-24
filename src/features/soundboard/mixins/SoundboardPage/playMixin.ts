import { defineComponent } from "vue";
import { useSoundboardStore } from "@/features/soundboard/stores/soundboard";
import type { Track } from "@features/soundboard/types";

export const PlayMixin = defineComponent({
  data() {
    return { soundboardStore: useSoundboardStore() };
  },
  computed: {
    isPlaying(): boolean { return this.soundboardStore.trackState === "playing"; },
    selectedFile() { return this.soundboardStore.currentFile; },
    selectedGroup() { return this.soundboardStore.currentGroup; },
    selectedSubGroup() { return this.soundboardStore.currentSubGroup; },
    selectedTrack() { return this.soundboardStore.currentTrack; },
  },
  methods: {
    onTrackClick(track: Track, toggle: () => void) {
      toggle();

      const sameTrack = this.soundboardStore.currentTrack?.id === track.id;
      if (sameTrack && this.isPlaying) {
        this.soundboardStore.pause();
        return;
      }

      if (!sameTrack) {
        this.soundboardStore.selectTrack(track);
      }

      console.log("[soundboard] track clicked", track)
      this.soundboardStore.play();
      this.soundboardStore.openPlayer();
    },
  },
});
