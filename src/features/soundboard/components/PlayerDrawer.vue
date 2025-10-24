<template>
  <div>
    <v-overlay
      :model-value="isOpen"
      class="player-overlay"
      :z-index="overlayZ"
      :scrim="true"
      :persistent="false"
      scroll-strategy="none"
      @update:model-value="isOpen = $event"
    />

    <!-- Drawer teleported to body; always mounted; sits above overlay -->
    <teleport to="body">
      <aside
        class="player-drawer"
        ref="panel"
        role="dialog"
        aria-label="Audio Player"
        :style="{ width: drawerWidth + 'px', zIndex: overlayZ + 1 }"
        @pointerdown.stop
        @mousedown.stop
        @touchstart.stop
        @click.stop
      >
        <header class="player-toolbar">
          <v-toolbar density="comfortable" elevation="0">
            <v-toolbar-title>Player</v-toolbar-title>
          </v-toolbar>
          <v-spacer />
          <v-btn icon @click="close" title="Close"><v-icon>mdi-close</v-icon></v-btn>
        </header>
        <v-divider />

        <section class="player-scroll" ref="scrollArea">
          <!-- YouTube iframe holder -->
          <div ref="ytHolder" class="yt-holder">
            <div :id="playerElId" class="yt-frame"></div>
          </div>

          <!-- Now Playing -->
          <v-chip-group :column="true">
            <v-chip>File: {{ soundboardStore.currentFile?.title ?? "—" }}</v-chip>
            <v-chip>Group: {{ soundboardStore.currentGroup?.title ?? "—" }}</v-chip>
            <v-chip>SubGroup: {{ soundboardStore.currentSubGroup?.title ?? "—" }}</v-chip>
            <v-chip>Track: {{ soundboardStore.currentTrack?.title ?? "—" }}</v-chip>
          </v-chip-group>

          <!-- Controls -->
          <div
            v-if="soundboardStore.currentTrack"
            class="controls"
            @pointerdown.stop
            @mousedown.stop
            @touchstart.stop
            @click.stop
          >
            <v-btn class="mr-2" size="small" @click="soundboardStore.play()">
              <v-icon start>mdi-play</v-icon> Play
            </v-btn>
            <v-btn size="small" variant="text" @click="soundboardStore.next()" :disabled="!soundboardStore.currentSubGroup">
              Next <v-icon end>mdi-skip-next</v-icon>
            </v-btn>
            <v-switch v-model="soundboardStore.autoplay" class="ml-4" hide-details inset label="Autoplay" />
            <v-switch v-model="soundboardStore.currentTrack.isLoop" class="ml-2" hide-details inset label="Loop" />
          </div>
        </section>

        <!-- Sticky footer actions -->
        <footer class="player-actions">
          <v-slider
            :model-value="soundboardStore.masterVol"
            @update:model-value="soundboardStore.setVolume($event as number)"
            min="0" max="100" step="1" hide-details
            style="max-width: 180px"
          />
          <v-spacer />
          <v-btn variant="text" @click="soundboardStore.stop()">Stop</v-btn>
        </footer>
      </aside>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DynamicWidthMixin } from "../mixins/PlayerDrawer/dynamicWidthMixin";
import { OpenDrawerMixin } from "../mixins/PlayerDrawer/openDrawerMixin";
import { YoutubeMixin } from "../mixins/PlayerDrawer/youtubeMixin";

export default defineComponent({
  name: "PlayerDrawer",
  mixins: [DynamicWidthMixin, OpenDrawerMixin, YoutubeMixin],
  props: {
    overlayZIndex: { type: Number, default: 2000 },
  },
  data() {
    return {
      overlayZ: this.overlayZIndex,
    };
  },
});
</script>

<style scoped lang="scss">
/* Overlay is constrained between app bar & footer */
.player-overlay {
  position: fixed;
  inset: var(--v-layout-top, 0) 0 var(--v-layout-bottom, 0) 0;
}

/* Drawer teleported to body; sits above overlay (z-index set inline) */
.player-drawer {
  position: fixed;
  right: 0;
  top: var(--v-layout-top, 0);
  bottom: var(--v-layout-bottom, 0);
  background: rgb(var(--v-theme-surface));
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, .12));
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 28px rgba(0,0,0,.2);
  width: 380px; /* initial; overridden inline via :style */
}

/* Layout sections */
.player-toolbar { display: flex; align-items: center; padding: 8px 8px 0; }
.player-scroll  { flex: 1 1 auto; overflow: auto; padding: 8px 12px 12px; }
.player-actions { display: flex; align-items: center; gap: 12px; padding: 12px; border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, .12)); }

/* YouTube frame:
   Height is independent of drawer width; width is intrinsic via aspect-ratio.
   Drawer width is computed from this height in JS. */
.yt-holder { margin-bottom: 8px; min-height: 160px; }
.yt-frame  {
  height: min(
    56vh,
    calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px) - 180px)
  );
  aspect-ratio: 16 / 9;
  width: auto;
  border-radius: 8px;
  background: black;
  overflow: hidden;
}

.yt-holder {
  position: relative;
  margin-bottom: 8px;
  min-height: 160px;
}

/* Cosmetic */
.pill { padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.07); }
.controls { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
</style>

<style>
.v-chip-group--column {
  .v-slide-group__content {
    flex-direction: column;
  }
}
</style>
