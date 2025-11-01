<template>
	<div style="display: flex; gap: 0.2rem;">
    <v-text-field
      :label="label"
      density="comfortable"
      variant="solo-filled"
      :disabled="disabled"
      :error="!isValid"
      :messages="isValid ? [] : invalidMessageList"
      v-model="valueProxy"
    />

    <v-menu
      v-model="pickerOpen"
      :close-on-content-click="false"
      :disabled="disabled"
      offset="8"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="tonal"
          :ripple="false"
          @click.stop
          :disabled="disabled"
          :title="`Pick ${label.toLowerCase()}`"
					height="48"
					prepend-icon="mdi-eyedropper"
        >
          <v-avatar size="20" :style="{ backgroundColor: valueProxy || '#bbb' }" />
        </v-btn>
      </template>

      <v-card min-width="280">
        <v-color-picker
          v-model="valueProxy"
          :mode="mode"
          :modes="modes"
          show-swatches
          swatches-max="10"
          :hide-inputs="hidePickerInputs"
        />
        <v-card-actions class="pt-2">
          <v-spacer />
          <v-btn variant="text" @click="pickerOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ColorField",
  props: {
    modelValue: { type: String, default: "" },        // v-model
    disabled:   { type: Boolean, default: false },
    label:      { type: String, default: "Color" },
    /**
     * ColorPicker mode that dictates value format:
     * 'hexa' (e.g. #RRGGBB or #RRGGBBAA), 'rgba', 'hsla'
     */
    mode:       { type: String as () => "hexa"|"rgba"|"hsla", default: "hexa" },
    modes:      { type: Array as () => Array<"hexa"|"rgba"|"hsla">, default: () => ["hexa","rgba","hsla"] },
    /**
     * Validate and/or normalize hex strings. Only applies when mode === 'hexa'.
     */
    validateHex:     { type: Boolean, default: true },
    normalizeOnType: { type: Boolean, default: false },
    hidePickerInputs:{ type: Boolean, default: true },
    invalidMessage:  { type: String, default: "Use #RRGGBB or #RRGGBBAA" },
    allowEmpty:      { type: Boolean, default: true },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      pickerOpen: false as boolean,
      internal: this.modelValue as string,
    };
  },
  computed: {
    valueProxy: {
      get(): string {
        return this.internal;
      },
      set(v: string) {
        const next = this.normalizeOnType ? this.normalize(v) : v;
        this.internal = next;
        this.$emit("update:modelValue", next);
        this.$emit("change", next);
      },
    },

    isValid(): boolean {
      if (this.disabled) return true;
      if (this.mode !== "hexa" || !this.validateHex) return true;
      const v = (this.valueProxy || "").trim();
      if (!v) return this.allowEmpty;
      return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v);
    },

    invalidMessageList(): string[] {
      return this.isValid ? [] : [this.invalidMessage];
    },
  },
  watch: {
    modelValue(v: string) {
      // keep internal in sync if parent drives value
      if (v !== this.internal) this.internal = v ?? "";
    },
    disabled(v: boolean) {
      if (v) this.pickerOpen = false;
    },
  },
  methods: {
    normalize(v: string): string {
      if (this.mode !== "hexa") return v;           // only normalize hex strings
      let s = (v || "").trim();
      if (!s) return s;
      // ensure leading '#'
      if (!s.startsWith("#")) s = "#" + s;
      // expand #RGB or #RGBA to #RRGGBB / #RRGGBBAA
      if (/^#[0-9a-fA-F]{3,4}$/.test(s)) {
        const hex = s.slice(1);
        const exp = hex.split("").map(ch => ch + ch).join("");
        s = "#" + exp; // 6 or 8 chars
      }
      // uppercase is optional; Vuetify accepts mixed case
      return s;
    },
  },
});
</script>

<style scoped>
.v-avatar { box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
</style>
