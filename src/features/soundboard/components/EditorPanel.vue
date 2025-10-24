<template>
	<v-toolbar density="comfortable" elevation="0">
		<v-toolbar-title>{{ headerTitle }}</v-toolbar-title>
		<v-spacer />
		<v-btn icon @click="editor.cancel()" title="Close"><v-icon>mdi-close</v-icon></v-btn>
	</v-toolbar>
	<v-divider />

	<div class="editor-scroll">
		<v-alert
			v-if="!editor.draft"
			type="info"
			class="ma-4"
			variant="tonal"
		>Select something to edit.</v-alert>

		<div v-else-if="editor.draft.type==='file'" class="pa-4">
			<v-text-field v-model="draftFile.title" label="Title" density="comfortable" />
		</div>

		<div v-else-if="editor.draft.type==='group'" class="pa-4">
			<v-text-field v-model="draftGroup.title" label="Title" density="comfortable" />
		</div>

		<div v-else-if="editor.draft.type==='subgroup'" class="pa-4">
			<v-text-field v-model="draftSubGroup.title" label="Title" density="comfortable" />
		</div>

		<div v-else-if="editor.draft.type==='track'" class="pa-4">
			<v-text-field v-model="draftTrack.title" label="Title" density="comfortable" class="mb-2" />
			<v-text-field v-model="draftTrack.url" label="YouTube / YT Music URL or ID" density="comfortable" />
			<v-switch v-model="draftTrack.useVolume" inset hide-details label="Use custom volume" class="mr-4" style="min-width: 100px;" />
			<v-slider
				v-model="draftTrack.volume"
				:disabled="!draftTrack.useVolume"
				min="0" max="100" step="1" hide-details
				style="min-width: 100px; padding-left: 3rem;"
			/>
			<v-switch v-model="draftTrack.isLoop" inset hide-details label="Loop this track" class="mt-2" />

			<div class="thumbs mt-4">
				<div class="caption mb-1">Album art preview</div>
				<img
					:src="albumArtCandidates(draftTrack?.url)?.[0] || ''"
					:data-fallbacks="albumArtCandidates(draftTrack?.url)?.join('|') || ''"
					@error="onThumbnailError"
					alt=""
				/>
			</div>
		</div>
	</div>

	<div class="editor-actions">
		<template v-if="editor?.draft">
			<!-- FILE actions -->
			<template v-if="editor.draft.type==='file'">
				<v-btn size="small" @click="onAddGroup"><v-icon start>mdi-folder-plus</v-icon>Add group</v-btn>
			</template>

			<!-- GROUP actions -->
			<template v-else-if="editor.draft.type==='group'">
				<v-btn size="small" @click="onAddSubGroup"><v-icon start>mdi-playlist-plus</v-icon>Add subgroup</v-btn>
				<v-btn size="small" color="error" variant="text" @click="onRemoveGroup"><v-icon start>mdi-delete</v-icon>Delete</v-btn>
				<v-spacer />
				<v-select
					v-model="moveIndex"
					:items="orderIndexItems"
					:label="orderLabel"
					density="compact"
					style="max-width: 280px"
					@update:model-value="onReorderIndex"
				/>
			</template>

			<!-- SUBGROUP actions -->
			<template v-else-if="editor.draft.type==='subgroup'">
				<v-btn size="small" @click="onAddTrack"><v-icon start>mdi-music-note-plus</v-icon>Add track</v-btn>
				<v-btn size="small" color="error" variant="text" @click="onRemoveSubGroup"><v-icon start>mdi-delete</v-icon>Delete</v-btn>
				<v-spacer />
				<v-select
					v-model="targetGroupId"
					:items="groupTargetItems"
					label="Move to group"
					density="compact"
					style="max-width: 260px"
				/>
				<v-btn
					size="small"
					:disabled="!targetGroupId || targetGroupId===liveGroup?.id"
					@click="onMoveSubGroupToTarget"
				>
					<v-icon start>mdi-arrow-right</v-icon>Move
				</v-btn>
				<v-select
					v-model="moveIndex"
					:items="orderIndexItems"
					:label="orderLabel"
					density="compact"
					style="max-width: 280px"
					class="ml-2"
					@update:model-value="onReorderIndex"
				/>
			</template>

			<!-- TRACK actions -->
			<template v-else-if="editor.draft.type==='track'">
				<v-btn size="small" color="error" variant="text" @click="onRemoveTrack"><v-icon start>mdi-delete</v-icon>Delete</v-btn>
				<v-spacer />
				<v-select
					v-model="targetGroupId"
					:items="groupTargetItems"
					label="Target group"
					density="compact"
					style="min-width: 240px"
					@update:model-value="targetSubGroupId = ''"
				/>
				<v-select
					v-model="targetSubGroupId"
					:items="subGroupTargetItems"
					label="Target subgroup"
					density="compact"
					style="min-width: 280px"
					class="ml-2"
				/>
				<v-btn
					size="small"
					:disabled="!targetSubGroupId || targetSubGroupId===liveSubGroup?.id"
					@click="onMoveTrackToTarget"
				>
					<v-icon start>mdi-arrow-right</v-icon>Move
				</v-btn>
				<v-select
					v-model="moveIndex"
					:items="orderIndexItems"
					:label="orderLabel"
					density="compact"
					style="max-width: 280px"
					class="ml-2"
					@update:model-value="onReorderIndex"
				/>
			</template>

			<v-divider />
		</template>

		<v-spacer />
		<v-btn variant="text" @click="editor.cancel()">Cancel</v-btn>
		<v-btn color="primary" @click="editor.save()">Save</v-btn>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useEditorStore } from "@/features/soundboard/stores/editor";
import type { FileNode, Group, SubGroup, Track } from "@/features/soundboard/types";
import {
	formatGroup, formatSubGroup, formatTrack,
	extractYouTubeId,
	onThumbnailError,
	albumArtCandidates,
} from "@/features/soundboard/utils/formatting";
import {
	rebaseSubGroup, rebaseTrack,
	renameGroup, renameSubGroup, renameTrack,
} from "@/features/soundboard/utils/ids";

export default defineComponent({
	name: "EditorPanel",
	data() {
		return {
			editor: useEditorStore(),

			// move targets (subgroup/track)
			targetGroupId: "" as string,
			targetSubGroupId: "" as string,

			// single reorder control for all three types
			moveIndex: null as number | null,
		};
	},

	computed: {
		headerTitle(): string {
			const d = this.editor.draft;
			if (!d) return "Editor";
			return d.type === "track" ? "Edit Track"
				: d.type === "subgroup" ? "Edit Subgroup"
				: d.type === "group" ? "Edit Group"
				: "Edit File";
		},

		// convenience – owning file & live refs
		ownerFile(): FileNode | null {
			return this.editor.fileOfSelection;
		},
		liveItem(): FileNode | Group | SubGroup | Track | null {
			return (this.editor.draft as any)?.ref || null;
		},
		liveGroup(): Group | null {
			const d = this.editor.draft;
			if (!d) return null;
			if (d.type === "group") return d.ref as Group;
			if (d.type === "subgroup") return (d.ref as SubGroup).group;
			if (d.type === "track") return (d.ref as Track).group;
			return null;
		},
		liveSubGroup(): SubGroup | null {
			const d = this.editor.draft;
			if (!d) return null;
			if (d.type === "subgroup") return d.ref as SubGroup;
			if (d.type === "track") return (d.ref as Track).subGroup;
			return null;
		},

		// draft proxies (keep titles→ids in sync through rename helpers)
		draftFile: {
			get(): any { return (this.editor.draft as any)?.data || {}; },
			set(v: any) { this.editor.updateDraft(v); },
		},
		draftGroup: {
			get(): any { return (this.editor.draft as any)?.data || {}; },
			set(v: any) {
				const current = (this.editor.draft as any)?.ref as Group;
				if (current && v?.title != null && v.title !== current.title) renameGroup(current, v.title);
				this.editor.updateDraft(v);
			},
		},
		draftSubGroup: {
			get(): any { return (this.editor.draft as any)?.data || {}; },
			set(v: any) {
				const current = (this.editor.draft as any)?.ref as SubGroup;
				if (current && v?.title != null && v.title !== current.title) renameSubGroup(current, v.title);
				this.editor.updateDraft(v);
			},
		},
		draftTrack: {
			get(): any { return (this.editor.draft as any)?.data || {}; },
			set(v: any) {
				const current = (this.editor.draft as any)?.ref as Track;
				if (current && v?.title != null && v.title !== current.title) renameTrack(current, v.title);
				this.editor.updateDraft(v);
			},
		},

		// move targets
		groupTargetItems(): Array<{ title: string; value: string }> {
			const file = this.ownerFile;
			if (!file) return [];
			return file.children.map(g => ({ title: `${g.file.title} > ${g.title}`, value: g.id }));
		},
		subGroupTargetItems(): Array<{ title: string; value: string }> {
			const file = this.ownerFile;
			if (!file || !this.targetGroupId) return [];
			const group = file.children.find(x => x.id === this.targetGroupId);
			if (!group) return [];
			return group.children.map(subGroup => ({
				title: `${subGroup.file.title} > ${subGroup.group.title} > ${subGroup.title}`,
				value: subGroup.id
			}));
		},

		// reorder UI (one select reused for all types)
		orderIndexItems(): Array<{ title: string; value: number }> {
			const d = this.editor.draft;
			if (!d) return [];
			if (d.type === "group") {
				const file = this.ownerFile;
				if (!file) return [];
				return file.children.map((g, i) => ({ title: `${i + 1} (${g.title})`, value: i }));
			} else if (d.type === "subgroup") {
				const group = this.liveGroup;
				if (!group) return [];
				return group.children.map((subGroup, i) => ({ title: `${i + 1} (${subGroup.title})`, value: i }));
			} else if (d.type === "track") {
				const subGroup = this.liveSubGroup;
				if (!subGroup) return [];
				return subGroup.children.map((track, i) => ({ title: `${i + 1} (${track.title})`, value: i }));
			}
			return [];
		},
		orderLabel(): string {
			const t = this.editor.draft?.type;
			return t === "group" ? "Reorder within file"
				: t === "subgroup" ? "Reorder within group"
				: t === "track" ? "Reorder within subgroup"
				: "Reorder";
		},

		// thumb preview for track URL
		previewThumbs(): string[] {
			const d = this.editor.draft;
			if (!d || d.type !== "track") return [];
			const id = extractYouTubeId(d.data.url || "");
			return id ? [
				`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
				`https://i.ytimg.com/vi/${id}/sddefault.jpg`,
				`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
			] : [];
		},
	},

	watch: {
		// initialize reorder index & default move targets on selection change
		"editor.draft"(d) {
			// default move targets
			if (d?.type === "subgroup") {
				this.targetGroupId = (d.ref as SubGroup).group.id;
			} else if (d?.type === "track") {
				this.targetGroupId = (d.ref as Track).group.id;
				this.targetSubGroupId = (d.ref as Track).subGroup.id;
			} else {
				this.targetGroupId = "";
				this.targetSubGroupId = "";
			}

			// set initial order index
			if (d?.type === "group" && this.ownerFile) {
				const i = this.ownerFile.children.indexOf(d.ref as Group);
				this.moveIndex = i >= 0 ? i : null;
			} else if (d?.type === "subgroup" && this.liveGroup) {
				const i = this.liveGroup.children.indexOf(d.ref as SubGroup);
				this.moveIndex = i >= 0 ? i : null;
			} else if (d?.type === "track" && this.liveSubGroup) {
				const i = this.liveSubGroup.children.indexOf(d.ref as Track);
				this.moveIndex = i >= 0 ? i : null;
			} else {
				this.moveIndex = null;
			}
		},
	},

	methods: {
		// ---------- helpers ----------
		moveWithin<T>(arr: T[], item: T, to: number) {
			const from = arr.indexOf(item);
			if (from < 0 || to == null || from === to) return;
			arr.splice(from, 1);
			arr.splice(Math.max(0, Math.min(to, arr.length)), 0, item);
		},

		// ---------- add ----------
		onAddGroup() {
			const file = this.ownerFile;
			if (!file) return;
			const group = formatGroup(file, { title: "New Group", children: [] });
			file.children.push(group);
			this.editor.beginEdit(group);
		},
		onAddSubGroup() {
			const group = this.liveGroup;
			if (!group) return;
			const subGroup = formatSubGroup(group.file, group, { title: "New Subgroup", children: [] });
			group.children.push(subGroup);
			this.editor.beginEdit(subGroup);
		},
		onAddTrack() {
			const subGroup = this.liveSubGroup;
			if (!subGroup) return;
			const track = formatTrack(subGroup.file, subGroup.group, subGroup, { title: "New Track", url: "" });
			subGroup.children.push(track);
			this.editor.beginEdit(track);
		},

		// ---------- remove ----------
		onRemoveGroup() {
			const file = this.ownerFile;
			const group = this.liveGroup;
			if (!file || !group) return;
			const i = file.children.indexOf(group);
			if (i >= 0) file.children.splice(i, 1);
			this.editor.cancel();
		},
		onRemoveSubGroup() {
			const subGroup = this.liveSubGroup;
			const group = this.liveGroup;
			if (!group || !subGroup) return;
			const i = group.children.indexOf(subGroup);
			if (i >= 0) group.children.splice(i, 1);
			this.editor.cancel();
		},
		onRemoveTrack() {
			const track = this.liveItem as Track | null;
			const subGroup = this.liveSubGroup;
			if (!track || !subGroup) return;
			const i = subGroup.children.indexOf(track);
			if (i >= 0) subGroup.children.splice(i, 1);
			this.editor.cancel();
		},

		// ---------- reorder ----------
		onReorderIndex() {
			const d = this.editor.draft;
			const to = this.moveIndex;
			if (!d || to == null) return;

			if (d.type === "group" && this.ownerFile) {
				this.moveWithin(this.ownerFile.children, d.ref as Group, to);
			} else if (d.type === "subgroup" && this.liveGroup) {
				this.moveWithin(this.liveGroup.children, d.ref as SubGroup, to);
			} else if (d.type === "track" && this.liveSubGroup) {
				this.moveWithin(this.liveSubGroup.children, d.ref as Track, to);
			}
		},

		// ---------- move (containers) ----------
		onMoveSubGroupToTarget() {
			const file = this.ownerFile;
			const subGroup = this.liveSubGroup;
			if (!file || !subGroup || !this.targetGroupId) return;

			const toGroup = file.children.find(g => g.id === this.targetGroupId);
			if (!toGroup || toGroup === subGroup.group) return;

			const oldList = subGroup.group.children;
			const idx = oldList.indexOf(subGroup);
			if (idx >= 0) oldList.splice(idx, 1);

			rebaseSubGroup(subGroup, toGroup);
			toGroup.children.push(subGroup);

			// update reorder index UI after move
			this.moveIndex = toGroup.children.indexOf(subGroup);
		},

		onMoveTrackToTarget() {
			const file = this.ownerFile;
			const track = this.liveItem as Track | null;
			if (!file || !track || !this.targetSubGroupId) return;

			const toGroup = file.children.find(g => g.id === this.targetGroupId);
			if (!toGroup) return;
			const toSubGroup = toGroup.children.find(sg => sg.id === this.targetSubGroupId);
			if (!toSubGroup || toSubGroup === track.subGroup) return;

			const oldList = track.subGroup.children;
			const idx = oldList.indexOf(track);
			if (idx >= 0) oldList.splice(idx, 1);

			rebaseTrack(track, toSubGroup);
			toSubGroup.children.push(track);

			// update reorder index UI after move
			this.moveIndex = toSubGroup.children.indexOf(track);
		},

		albumArtCandidates,
		onThumbnailError,
	},
});
</script>

<style scoped lang="scss">
.editor-panel { display: flex; flex-direction: column; }
.editor-scroll { flex: 1 1 auto; overflow: auto; }
.editor-actions {
	display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px;
	border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, .12));
}
.thumbs .thumb-grid {
	display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
.thumbs img { width: 100%; border-radius: 8px; background: #000; }
</style>
