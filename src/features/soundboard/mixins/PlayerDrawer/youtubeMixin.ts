import { defineComponent } from "vue";
import { useSoundboardStore } from "@/features/soundboard/stores/soundboard";

let ytReadyPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (ytReadyPromise) return ytReadyPromise;
  ytReadyPromise = new Promise((resolve) => {
    if ((window as any).YT?.Player) return resolve();
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => resolve();
  });
  return ytReadyPromise;
}

export const YoutubeMixin = defineComponent({
  data() {
    return {
      soundboardStore: useSoundboardStore(),
      player: null as any,
      playerReady: false,
      playerElId: `ytp_${Math.random().toString(36).slice(2)}`,
    };
  },
  computed: {
    effectiveVolume(): number {
      const t = this.soundboardStore.currentTrack;
      const base = t && t.useVolume && t.volume != null
        ? Number(t.volume)
        : Number(this.soundboardStore.masterVol);
      const v = Number.isFinite(base) ? base : 0;
      return Math.min(100, Math.max(0, Math.round(v)));
    },
  },
  watch: {
    // Store → Player: play/pause/stop
    "soundboardStore.trackState"(state: string) {
      if (!this.playerReady) return;
      if (state === "playing") {
        this.ensureVideoLoaded();
        try { this.player?.playVideo?.(); } catch {}
        this.applyVolume();
      } else if (state === "paused") {
        try { this.player?.pauseVideo?.(); } catch {}
      } else if (state === "stopped") {
        try { this.player?.stopVideo?.(); } catch {}
      }
    },

    // Volume changes
    "soundboardStore.masterVol"() { this.applyVolume(); },
    "soundboardStore.currentTrack.useVolume"() { this.applyVolume(); },
    "soundboardStore.currentTrack.volume"() { this.applyVolume(); },
  },
  mounted() {
    loadYouTubeApi().then(() => this.initPlayer());
  },
  beforeUnmount() {
    try { this.player?.destroy?.(); } catch {}
  },
  methods: {
    initPlayer() {
      // eslint-disable-next-line new-cap
      this.player = new (window as any).YT.Player(this.playerElId, {
        playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            this.playerReady = true;
            this.applyVolume();
            // If store says we should be playing and we already have a track
            if (this.soundboardStore.currentTrack?.url && this.soundboardStore.trackState === "playing") {
              this.ensureVideoLoaded(true);
              try { this.player?.playVideo?.(); } catch {}
            }
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            if (!YT) return;

            // See: https://developers.google.com/youtube/iframe_api_reference#Playback_status
            switch (e.data) {
              case YT.PlayerState.ENDED:
                 if (this.soundboardStore.currentTrack?.isLoop) {
                  try {
                    this.player.seekTo(0, true);
                    this.player.playVideo();
                    this.applyVolume();
                  } catch (error) {
                    console.error("[soundboard] error playing track again", error);
                  }
                } else {
                  this.soundboardStore.next();
                }
                break;

              case YT.PlayerState.PLAYING:
                this.soundboardStore.trackState = "playing";
                this.applyVolume();
                break;

              case YT.PlayerState.PAUSED:
                this.soundboardStore.trackState = "paused";
                break;
            }
          },
        },
      });
    },

    parseId(u: string): string | null {
      try {
        if (/^[a-zA-Z0-9_-]{11}$/.test(u)) return u;           // raw id
        const x = new URL(u);
        if (x.hostname.includes("youtu.be")) return x.pathname.slice(1) || null;
        if (x.searchParams.has("v")) return x.searchParams.get("v");
        const m = x.pathname.match(/\/shorts\/([^/]+)/);
        return m ? m[1] : null;
      } catch { return null; }
    },

    ensureVideoLoaded(force=false) {
      if (!this.soundboardStore.currentTrack?.url) {
        console.debug("[soundboard] No current track URL to load");
        return;
      }
      const id = this.parseId(this.soundboardStore.currentTrack.url);
      if (!id) {
        console.debug("[soundboard] No valid video ID found");
        return;
      }

      // If force or player has no video cued (getVideoData might be undefined early)
      let currentId: string | null = null;
      try {
        currentId = this.player?.getVideoData?.()?.video_id || null;
      } catch (error) {
        console.error("[soundboard] Failed to get current video ID", error);
      }

      if (force || id !== currentId) {
        try {
          this.player.loadVideoById({ videoId: id, startSeconds: 0 });
        } catch {
          try { this.player.loadVideoById(id); } catch (error) {
            console.error("[soundboard] Failed to load video", error);
          }
        }
      }
    },

    applyVolume() {
      if (!this.playerReady || !this.player?.setVolume) return;
      try { this.player.setVolume(this.effectiveVolume); } catch (error) { console.error(error) }
    },
  },
});
