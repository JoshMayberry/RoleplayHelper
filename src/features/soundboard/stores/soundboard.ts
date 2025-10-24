import { defineStore } from "pinia";
import type { FileNode, Group, SubGroup, Track, TrackState } from "@/features/soundboard/types";

export const useSoundboardStore = defineStore("soundboard", {
  state: () => ({
    // selection
    currentGroup: null as Group | null,
    currentSubGroup: null as SubGroup | null,
    currentTrack: null as Track | null,
    currentFile: null as FileNode | null,

    // playback
    trackState: "stopped" as TrackState,
    masterVol: 70,
    autoplay: false,

    // UI
    isPlayerOpen: false,

    // autoplay (stub)
    autoplayDelayMs: 8000,
    _timer: null as number | null,
  }),
  getters: {
    currentIndexInSub(state): number {
      const sg = state.currentSubGroup;
      if (!sg || !state.currentTrack) return -1;
      return sg.children.findIndex(t => t.id === state.currentTrack!.id);
    },
    hasNext(): boolean {
      const sg = this.currentSubGroup;
      if (!sg) return false;
      return this.currentIndexInSub < sg.children.length - 1;
    },
    nextTrack(): Track | null {
      const sg = this.currentSubGroup;
      if (!sg) return null;
      const i = this.currentIndexInSub;
      if (i < 0) return sg.children[0] ?? null;
      return sg.children[i + 1] ?? null;
    },
  },
  actions: {
    selectFile(file: FileNode) {
      this.currentFile = file;
      this.currentGroup = null;
      this.currentSubGroup = null;
      this.currentTrack = null;
    },
    selectGroup(group: Group) {
      this.currentFile = group.file;
      this.currentGroup = group;
      this.currentSubGroup = null;
      this.currentTrack = null;
    },
    selectSubGroup(subGroup: SubGroup) {
      this.currentFile = subGroup.file;
      this.currentGroup = subGroup.group;
      this.currentSubGroup = subGroup;
      this.currentTrack = null;
    },
    selectTrack(track: Track) {
      this.currentFile = track.file;
      this.currentGroup = track.group;
      this.currentSubGroup = track.subGroup;
      this.currentTrack = track;
    },

    // --- playback
    play() {
      if (!this.currentTrack && this.currentSubGroup?.children?.length) {
        this.currentTrack = this.currentSubGroup.children[0];
      }
      this.trackState = "playing";
      if (this.autoplay) this._restartAutoplay();
    },
    pause() {
      this.trackState = "paused";
      this._clearTimer();
    },
    stop() {
      this.trackState = "stopped";
      this._clearTimer();
    },
    next() {
      const sg = this.currentSubGroup;
      if (!sg) return;
      const i = this.currentIndexInSub;
      const next = sg.children[i + 1];
      if (next) {
        this.currentTrack = next;
        // keep playing if we were playing
        if (this.trackState === "playing" && this.autoplay) this._restartAutoplay();
      } else if (this.currentTrack?.isLoop && sg.children.length) {
        this.currentTrack = sg.children[0];
        if (this.trackState === "playing" && this.autoplay) this._restartAutoplay();
      } else {
        // reached end
        this._clearTimer();
        this.trackState = "paused";
      }
    },
    previous() {
      const sg = this.currentSubGroup;
      if (!sg) return;
      const i = this.currentIndexInSub;
      const prev = sg.children[i - 1];
      if (prev) this.currentTrack = prev;
    },

    setVolume(v: number) {
      this.masterVol = Math.max(0, Math.min(100, Math.round(v)));
    },
    setAutoplay(enabled: boolean) {
      this.autoplay = enabled;
      if (enabled && this.trackState === "playing") this._restartAutoplay();
      else this._clearTimer();
    },
    setLoop(enabled: boolean) {
      if (!this.currentTrack) return;
      this.currentTrack.isLoop = enabled;
    },

    // --- UI
    openPlayer() { this.isPlayerOpen = true; },
    closePlayer() { this.isPlayerOpen = false; },

    // --- stub autoplay
    _restartAutoplay() {
      this._clearTimer();
      this._timer = window.setTimeout(() => {
        // when your YouTube player fires 'ended', you can call next() too.
        // This timeout is just the stub.
        this.next();
      }, this.autoplayDelayMs);
    },
    _clearTimer() {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    },
  },
});
