<template>
  <v-app-bar app style="z-index: 3;">
    <v-app-bar-title @click="goHome" style="cursor: pointer">Roleplay Helper</v-app-bar-title>

    <v-spacer />

    <div class="app-bar-tabs">
      <!-- no watchers; tabs reflect $route.path -->
      <v-tabs v-model="tab" :mandatory="false" grow>
        <v-tab value="/player">Player View</v-tab>
        <v-tab value="/investigation-web">Investigation Web</v-tab>
        <v-tab value="/soundboard">Soundboard</v-tab>
      </v-tabs>
    </div>

    <v-spacer />

    <v-btn icon @click="$emit('open-player')" title="Player">
      <v-icon>mdi-music</v-icon>
    </v-btn>
    <v-btn icon @click="$emit('open-settings')" title="Settings">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AppHeader",
  emits: ["toggle-dresser", "open-settings", "open-player"],
  computed: {
    // Bind tabs directly to the route
    tab: {
      get(): string {
        return this.$route.path;
      },
      set(v: string) {
        if (v && v !== this.$route.path) {
          this.$router.push(v);
        }
      },
    },
  },
  methods: {
    goHome() {
      if (this.$route.path !== "/") {
        this.$router.push("/");
      }
      // When on '/', no tab matches; with mandatory=false no auto-select happens.
    },
  },
});
</script>

<style scoped lang="scss">
.app-bar-tabs {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.app-bar-tabs .v-tabs {
  pointer-events: auto;
  min-width: 320px;
  max-width: 60vw;
}
</style>
