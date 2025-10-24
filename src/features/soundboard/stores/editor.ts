import { defineStore } from "pinia";
import type {
	EditSelection, FileNode, Group, SubGroup, Track,
	PartialGroup, PartialSubGroup, PartialTrack,
	Draft, Clipboard,
} from "@/features/soundboard/types";

import {
	albumArtCandidates,
	formatGroup, formatSubGroup, formatTrack,
	serializeFile, serializeGroup, serializeSubGroup, serializeTrack,
} from "@/features/soundboard/utils/formatting";

import { snakeCase } from "change-case"; // See: https://www.npmjs.com/package/change-case/v/5.1.2

import { useSoundboardStore } from "@/features/soundboard/stores/soundboard";

async function saveViaDownload(file: FileNode, fileName?: string) {
	const content = serializeFile(file);
	const json = JSON.stringify(content, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName || `${snakeCase(file.title || "unknown")}.json`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

async function saveViaApi(file: FileNode) {
	console.log("[soundboard editor] saving to api", file)
	const res = await fetch("/api/data", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			folder: "soundboard",
			filename: snakeCase(file.title || "unknown"),
			data: serializeFile(file),
		}),
	});
	console.log("[soundboard editor] saved", res)

	if (!res.ok) throw new Error(`save failed: ${res.status}`);
}

function arrayMove<T>(arr: T[], from: number, to: number) {
	if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
	const [it] = arr.splice(from, 1);
	arr.splice(to, 0, it);
}

/** Given a node, return its siblings list and parent container (and file). */
function siblingsOf(item: Group | SubGroup | Track): {
	list: (Group | SubGroup | Track)[],
	parent: FileNode | Group | SubGroup,
	file: FileNode
} {
	if (item.type === "group") {
		const parent = item.file;
		return { list: parent.children, parent, file: parent };
	}
	if (item.type === "subGroup") {
		const parent = item.group;
		return { list: parent.children, parent, file: item.file };
	}
	// track
	const parent = item.subGroup;
	return { list: parent.children, parent, file: item.file };
}

/** Inserts child into the right children array based on parent type */
function insertInto(
	targetParent: FileNode | Group | SubGroup,
	child: Group | SubGroup | Track,
	atIndex?: number
) {
	const list =
		targetParent.type === "file" ? targetParent.children :
		targetParent.type === "group" ? targetParent.children :
		targetParent.children; // subgroup
	const idx = typeof atIndex === "number" ? Math.max(0, Math.min(atIndex, list.length)) : list.length;
	list.splice(idx, 0, child as any);
}

export const useEditorStore = defineStore("editor", {
	state: () => ({
		isOpen: false,
		selection: null as EditSelection | { type: "file"; data: FileNode } | null,
		draft: null as Draft | null,
		persistence: "api" as "download" | "api",
		clipboard: null as Clipboard,
	}),
	getters: {
		fileOfSelection(state): FileNode | null {
			const sel = state.selection;
			if (!sel) return null;
			if (sel.type === "file") return sel.data as FileNode;
			if (sel.type === "group") return (sel.data as Group).file;
			if (sel.type === "subgroup") return (sel.data as SubGroup).file;
			if (sel.type === "track") return (sel.data as Track).file;
			return null;
		},
	},
	actions: {
		beginEdit(item: FileNode | Group | SubGroup | Track) {
			switch (item.type) {
				case "file": {
					const f = item as FileNode;
					this.draft = { type: "file", ref: f, data: { id: f.id, title: f.title } };
					this.selection = { type: "file", data: f } as any;
					break;
				}
				case "group": {
					const g = item as Group;
					this.draft = { type: "group", ref: g, data: { id: g.id, title: g.title } };
					this.selection = { type: "group", data: g };
					break;
				}
				case "subGroup": {
					const sg = item as SubGroup;
					this.draft = { type: "subgroup", ref: sg, data: { id: sg.id, title: sg.title } };
					this.selection = { type: "subgroup", data: sg };
					break;
				}
				case "track": {
					const t = item as Track;
					this.draft = {
						type: "track",
						ref: t,
						data: {
							id: t.id,
							title: t.title,
							url: t.url,
							useVolume: !!t.useVolume,
							volume: Number(t.volume ?? 100),
							isLoop: !!t.isLoop,
						},
					};
					this.selection = { type: "track", data: t };
					break;
				}
				default:
					throw new Error(`Unknown item type '${(item as any).type}'`);
			}
			this.isOpen = true;
		},
		updateDraft(patch: Record<string, any>) {
			if (!this.draft) return;
			Object.assign(this.draft.data as any, patch);
		},
		cancel() {
			this.isOpen = false;
			this.draft = null;
		},
		applyDraftToLive() {
			if (!this.draft) return;
			const { type, data, ref } = this.draft;
			switch (type) {
				case "file": {
					const f = ref as FileNode;
					f.title = data.title!;
					f.id = data.id!;
					break;
				}
				case "group": {
					const g = ref as Group;
					g.title = data.title!;
					g.id = data.id!;
					break;
				}
				case "subgroup": {
					const sg = ref as SubGroup;
					sg.title = data.title!;
					sg.id = data.id!;
					break;
				}
				case "track": {
					const t = ref as Track;
					t.title = data.title!;
					t.id = data.id!;
					t.url = data.url!;
					t.useVolume = !!data.useVolume;
					t.volume = Number(data.volume ?? 100);
					t.isLoop = !!data.isLoop;
					t.thumbnailCandidates = albumArtCandidates(t.url);
					break;
				}
				default:
					throw new Error(`Unknown draft type '${type}'`);
			}
		},
		async save() {
			this.applyDraftToLive();

			const owner = this.fileOfSelection;
			if (!owner) {
				console.warn("[editor] No owning file to persist.");
				this.isOpen = false;
				return;
			}

			if (this.persistence === "api") {
				await saveViaApi(owner);
			} else {
				await saveViaDownload(owner);
			}

			this.isOpen = false;
			this.draft = null;
		},

		addGroup(file: FileNode, title = "New Group"): Group {
			const g = formatGroup(file, { title, children: [] });
			file.children.push(g);
			return g;
		},
		addSubGroup(group: Group, title = "New Subgroup"): SubGroup {
			const sg = formatSubGroup(group.file, group, { title, children: [] });
			group.children.push(sg);
			return sg;
		},
		addTrack(subGroup: SubGroup, payload?: PartialTrack): Track {
			const t = formatTrack(subGroup.file, subGroup.group, subGroup, {
				title: payload?.title || "New Track",
				url: payload?.url || "",
				useVolume: !!payload?.useVolume,
				volume: payload?.volume ?? 100,
				isLoop: !!payload?.isLoop,
			});
			subGroup.children.push(t);
			return t;
		},

		removeItem(item: Group | SubGroup | Track) {
			const { list } = siblingsOf(item);
			const idx = list.indexOf(item as any);
			if (idx < 0) return;

			// if removing currently playing track, stop it
			const sb = useSoundboardStore();
			if (item.type === "track" && sb.currentTrack?.id === item.id) {
				sb.stop();
				sb.selectTrack(null as any); // or clear selection if you expose such an action
			}
			else if (item.type === "subGroup" && sb.currentSubGroup?.id === item.id) {
				sb.stop(); sb.selectSubGroup(null as any);
			}
			else if (item.type === "group" && sb.currentGroup?.id === item.id) {
				sb.stop(); sb.selectGroup(null as any);
			}

			list.splice(idx, 1);
			// also clear editor selection if it pointed at this item
			if (this.selection && (this.selection as any).data?.id === (item as any).id) {
				this.selection = null;
				this.isOpen = false;
				this.draft = null;
			}
		},

		moveWithinParent(item: Group | SubGroup | Track, newIndex: number) {
			const { list } = siblingsOf(item);
			const from = list.indexOf(item as any);
			if (from < 0) return;
			const to = Math.max(0, Math.min(newIndex, list.length - 1));
			arrayMove(list, from, to);
		},
		moveSubGroupTo(sg: SubGroup, targetGroup: Group, atIndex?: number) {
			if (sg.file !== targetGroup.file) throw new Error("Cross-file moves are disabled");
			// remove from old parent
			const { list, parent } = siblingsOf(sg);
			const fromIdx = list.indexOf(sg);
			if (fromIdx < 0) return;
			list.splice(fromIdx, 1);

			// fix references
			sg.group = targetGroup;
			sg.file = targetGroup.file;

			insertInto(targetGroup, sg, atIndex);
		},
		moveTrackTo(track: Track, targetSubGroup: SubGroup, atIndex?: number) {
			if (track.file !== targetSubGroup.file) throw new Error("Cross-file moves are disabled");
			const { list } = siblingsOf(track);
			const fromIdx = list.indexOf(track);
			if (fromIdx < 0) return;
			list.splice(fromIdx, 1);

			// fix refs
			track.subGroup = targetSubGroup;
			track.group = targetSubGroup.group;
			track.file = targetSubGroup.file;

			insertInto(targetSubGroup, track, atIndex);
		},

		copy(item: Group | SubGroup | Track, opts?: { withChildren?: boolean }) {
			const deep = opts?.withChildren !== false;
			if (item.type === "group") {
				this.clipboard = { kind: "group", data: serializeGroup(item, deep) };
			} else if (item.type === "subGroup") {
				this.clipboard = { kind: "subgroup", data: serializeSubGroup(item, deep) };
			} else {
				this.clipboard = { kind: "track", data: serializeTrack(item) };
			}
		},

		/** Paste into a container. Returns the newly created node. */
		pasteInto(target: FileNode | Group | SubGroup, atIndex?: number) {
			if (!this.clipboard) return null;

			// Prevent cross-file by construction: we only allow paste into the live file of the target.
			let created: Group | SubGroup | Track | null = null;

			if (this.clipboard.kind === "group" && target.type === "file") {
				created = formatGroup(target, this.clipboard.data as PartialGroup);
				insertInto(target, created, atIndex);
				return created;
			}

			if (this.clipboard.kind === "subgroup" && target.type === "group") {
				created = formatSubGroup(target.file, target, this.clipboard.data as PartialSubGroup);
				insertInto(target, created, atIndex);
				return created;
			}

			if (this.clipboard.kind === "track" && target.type === "subGroup") {
				created = formatTrack(target.file, target.group, target, this.clipboard.data as PartialTrack);
				insertInto(target, created, atIndex);
				return created;
			}

			console.warn("[editor] Clipboard type not compatible with target");
			return null;
		},

		/** Convenience: paste *attributes only* (no children) */
		pasteAttrsInto(target: FileNode | Group | SubGroup, atIndex?: number) {
			if (!this.clipboard) return null;
			const kind = this.clipboard.kind;
			const shallow = (k: typeof kind) =>
				k === "group" ? { ...this.clipboard!.data, children: [] as PartialSubGroup[] } as PartialGroup :
				k === "subgroup" ? { ...this.clipboard!.data, children: [] as PartialTrack[] } as PartialSubGroup :
				{ ...this.clipboard!.data } as PartialTrack;

			const data = shallow(kind);

			if (kind === "group" && target.type === "file") {
				const created = formatGroup(target, data as PartialGroup);
				insertInto(target, created, atIndex);
				return created;
			}
			if (kind === "subgroup" && target.type === "group") {
				const created = formatSubGroup(target.file, target, data as PartialSubGroup);
				insertInto(target, created, atIndex);
				return created;
			}
			if (kind === "track" && target.type === "subGroup") {
				const created = formatTrack(target.file, target.group, target, data as PartialTrack);
				insertInto(target, created, atIndex);
				return created;
			}
			console.warn("[editor] Clipboard (attrs) not compatible with target");
			return null;
		},
	},
});
