import type {
  FileNode, Group, SubGroup, Track,
  PartialGroup, PartialSubGroup, PartialTrack
} from "@/features/soundboard/types";

import { capitalCase, snakeCase } from "change-case"; // See: https://www.npmjs.com/package/change-case/v/5.1.2
import { fileId, groupId, subGroupId, trackId } from "./ids";

export function extractYouTubeId(url: string): string | null {
  if (!url) {
		return "";
	}

	try {
		const u = new URL(url);
		if (u.hostname.includes('youtu.be')) {
			return u.pathname.slice(1) || ""; // youtu.be/<id>
		}
		
		if (u.searchParams.has('v')) {
			return u.searchParams.get('v') || ""; // youtube.com / music.youtube.com watch?v=<id>
		}
		
		const m = u.pathname.match(/\/shorts\/([^/]+)/);
		if (m) {
			return m[1] || ""; // shorts/<id>
		}
	} catch (error) {
		console.error("Error extracting YouTube ID:", error);
	}

	return "";
}

export function albumArtCandidates(url: string): string[] {
  const id = extractYouTubeId(url);
	if (!id) {
		return [];
	}

	return [
		`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
		`https://i.ytimg.com/vi/${id}/sddefault.jpg`,
		`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
		`https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
		`https://i.ytimg.com/vi/${id}/default.jpg`,
	];
}

export function onThumbnailError(e: Event) {
	const img = e.target as HTMLImageElement;
	const list = (img.dataset.fallbacks || "").split("|").filter(Boolean);

	// advance to the next candidate
	const idx = list.indexOf(img.src);
	const next = list[idx + 1];
	if (next) img.src = next;
}

export function filePathToTitle(path: string): string {
	const file = path.split("/").pop() || path;
	const base = file.replace(/\.json$/i, "");
	return capitalCase(base);
}

export function filePathToSlug(path: string): string {
	const file = path.split("/").pop() || path;
	return snakeCase(file.replace(/\.json$/i, ""));
}

export function formatFile(filePath: string, partialGroupList: PartialGroup[]): FileNode {
	const file: FileNode = {
		type: "file",
		id: fileId(filePathToSlug(filePath)),
		title: filePathToTitle(filePath) || "Unknown File",
		children: [],
	};
	file.children = partialGroupList.map(group => formatGroup(file, group));
	return file;
}

export function formatGroup(file: FileNode, partialGroup: PartialGroup): Group {
	const group: Group = {
		type: "group",
		id: groupId(file, partialGroup),
		file,

		title: partialGroup.title || "Unknown Group",
		children: [],
	};
	group.children = partialGroup.children.map(subGroup => formatSubGroup(file, group, subGroup));
	return group;
}

export function formatSubGroup(file: FileNode, group: Group, partialSubGroup: PartialSubGroup): SubGroup {
	const subGroup: SubGroup = {
		type: "subGroup",
		id: subGroupId(group, partialSubGroup),
		file,
		group,

		title: partialSubGroup.title || "Unknown SubGroup",
		children: [],
	};
	subGroup.children = partialSubGroup.children.map(track => formatTrack(file, group, subGroup, track));
	return subGroup
}

export function formatTrack(file: FileNode, group: Group, subGroup: SubGroup, partialTrack: PartialTrack): Track {
	const track: Track = {
		type: "track",
		id: trackId(subGroup, partialTrack),
		file,
		group,
		subGroup,

		title: partialTrack.title || "Unknown Track",
		url: partialTrack.url || "",
		thumbnailCandidates: albumArtCandidates(partialTrack.url || ""),
		useVolume: !!partialTrack.useVolume,
		volume: partialTrack.volume || 100,
		isLoop: !!partialTrack.isLoop,
	};
	return track;
}

export function serializeTrack(t: Track): PartialTrack {
  return {
    title: t.title,
    url: t.url,
    useVolume: t.useVolume,
    volume: t.volume,
    isLoop: t.isLoop,
  };
}
export function serializeSubGroup(sg: SubGroup, withChildren = true): PartialSubGroup {
  return {
    title: sg.title,
    children: withChildren ? sg.children.map(serializeTrack) : [],
  };
}
export function serializeGroup(g: Group, withChildren = true): PartialGroup {
  return {
    title: g.title,
    children: withChildren ? g.children.map(sg => serializeSubGroup(sg, withChildren)) : [],
  };
}

export function serializeFile(file: FileNode): PartialGroup[] {
  return file.children.map<PartialGroup>((group) => serializeGroup(group, true));
}
