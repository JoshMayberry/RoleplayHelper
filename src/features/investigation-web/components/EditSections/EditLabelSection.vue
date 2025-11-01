<!-- NodeLabelStylePanel.vue -->
<template>
	<v-expansion-panels>
		<v-expansion-panel>
			<v-expansion-panel-title>
				<v-text-field label="Label"
					density="comfortable" variant="solo-filled" inset
					:disabled="store.selected.node === undefined"
					:model-value="store.selected.node?.label ?? ''"
					@update:model-value="val => store.updateSelectedNode('label', val)"
				/>
			</v-expansion-panel-title>

			<v-expansion-panel-text>
				<div style="display: flex; flex-direction: column;">
					<v-select
						label="Label mode"
						density="comfortable"
						:items="['angle','free','hidden']"
						v-model="modeProxy"
						style="min-width: 220px"
					/>
					<template v-if="modeProxy === 'angle'">
						<v-text-field
							label="Angle (°)"
							type="number"
							density="comfortable"
							v-model.number="angleProxy"
							style="min-width: 160px"
						/>
						<v-text-field
							label="Margin"
							type="number"
							density="comfortable"
							v-model.number="marginProxy"
							style="min-width: 160px"
						/>
					</template>
					<template v-else-if="modeProxy === 'free'">
						<v-text-field
							label="Offset X"
							type="number"
							density="comfortable"
							v-model.number="offsetXProxy"
							style="min-width: 160px"
						/>
						<v-text-field
							label="Offset Y"
							type="number"
							density="comfortable"
							v-model.number="offsetYProxy"
							style="min-width: 160px"
						/>
						<v-text-field
							label="Rotation (°)"
							type="number"
							density="comfortable"
							v-model.number="rotationProxy"
							style="min-width: 160px"
						/>
					</template>
					<v-text-field
						label="Font size"
						type="number"
						density="comfortable"
						v-model.number="fontSizeProxy"
						style="min-width: 160px"
					/>
					<v-text-field
						label="Font weight"
						density="comfortable"
						v-model="fontWeightProxy"
						style="min-width: 160px"
					/>
					<v-text-field
						label="Font style"
						density="comfortable"
						v-model="fontStyleProxy"
						style="min-width: 160px"
					/>
					<v-text-field
						label="Color"
						density="comfortable"
						v-model="colorProxy"
						style="min-width: 200px"
					/>
				</div>
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "EditLabelSection",
	props: {
		store: { type: Object, required: true }, // pass your Pinia store instance
	},
	computed: {
		// ----- helpers -----
		node(): any {
			return this.store?.selected?.node;
		},
		label(): any {
			return this.node?.labelStyle ?? {};
		},
		// merge patch helper; also ensures labelStyle object exists
		patchLabel() {
			return (patch: Record<string, any>) => {
				const next = { ...(this.node?.labelStyle ?? {}), ...patch };
				this.store.updateSelectedNode("labelStyle", next);
			};
		},

		// ----- ID in header -----
		idProxy: {
			get(): string {
				return this.node?.id ?? "";
			},
			set(v: string) {
				if (!this.node) return;
				this.store.updateSelectedNode("id", v);
			},
		},

		// ----- labelStyle fields -----
		modeProxy: {
			get(): "angle" | "free" | "hidden" {
				return (this.label.mode ?? "angle") as any;
			},
			set(v: "angle" | "free" | "hidden") {
				this.patchLabel({ mode: v });
			},
		},
		angleProxy: {
			get(): number | undefined {
				return this.label.angle;
			},
			set(v: number | undefined) {
				this.patchLabel({ angle: v });
			},
		},
		marginProxy: {
			get(): number | undefined {
				return this.label.margin;
			},
			set(v: number | undefined) {
				this.patchLabel({ margin: v });
			},
		},
		offsetXProxy: {
			get(): number | undefined {
				return this.label.offsetX;
			},
			set(v: number | undefined) {
				this.patchLabel({ offsetX: v });
			},
		},
		offsetYProxy: {
			get(): number | undefined {
				return this.label.offsetY;
			},
			set(v: number | undefined) {
				this.patchLabel({ offsetY: v });
			},
		},
		rotationProxy: {
			get(): number | undefined {
				return this.label.rotation;
			},
			set(v: number | undefined) {
				this.patchLabel({ rotation: v });
			},
		},
		fontSizeProxy: {
			get(): number | undefined {
				return this.label.fontSize;
			},
			set(v: number | undefined) {
				this.patchLabel({ fontSize: v });
			},
		},
		fontWeightProxy: {
			get(): string | undefined {
				return this.label.fontWeight;
			},
			set(v: string | undefined) {
				this.patchLabel({ fontWeight: v });
			},
		},
		fontStyleProxy: {
			get(): string | undefined {
				return this.label.fontStyle;
			},
			set(v: string | undefined) {
				this.patchLabel({ fontStyle: v });
			},
		},
		colorProxy: {
			get(): string | undefined {
				return this.label.color;
			},
			set(v: string | undefined) {
				this.patchLabel({ color: v });
			},
		},
	},
});
</script>

<style lang="scss" scoped>
.v-expansion-panel-title,
.v-expansion-panel-text,
:deep(.v-expansion-panel-text__wrapper) {
	padding: 0;
}
</style>