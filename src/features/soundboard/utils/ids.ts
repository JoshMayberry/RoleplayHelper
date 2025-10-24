// src/features/soundboard/utils/ids.ts
import { snakeCase } from "change-case";
import type {
	FileNode, Group, SubGroup, Track,
	PartialGroup, PartialSubGroup, PartialTrack,
} from "@/features/soundboard/types";

export function randomId(): string {
	return Math.random().toString(36).slice(2);
}

export function fileId(slug: string): string {
  return snakeCase(slug || randomId());
}

export function groupId(file: FileNode, partialGroup: PartialGroup): string {
  return `${file.id}__${snakeCase(partialGroup.title || randomId())}`;
}

export function subGroupId(group: Group, partialSubGroup: PartialSubGroup): string {
  return `${group.id}__${snakeCase(partialSubGroup.title || randomId())}`;
}

export function trackId(subGroup: SubGroup, partialTrack: PartialTrack): string {
  return `${subGroup.id}__${snakeCase(partialTrack.title || randomId())}`;
}

export function rebaseGroup(g: Group, file: FileNode) {
  g.file = file;
  g.id = groupId(file, g);
  g.children.forEach(sg => rebaseSubGroup(sg, g));
}

export function rebaseSubGroup(sg: SubGroup, group: Group) {
  sg.group = group;
  sg.file = group.file;
  sg.id = subGroupId(group, sg);
  sg.children.forEach(t => rebaseTrack(t, sg));
}

export function rebaseTrack(t: Track, sg: SubGroup) {
  t.subGroup = sg;
  t.group = sg.group;
  t.file = sg.file;
  t.id = trackId(sg, t);
}

export function renameGroup(g: Group, newTitle: string) {
  g.title = newTitle;
  rebaseGroup(g, g.file);
}

export function renameSubGroup(sg: SubGroup, newTitle: string) {
  sg.title = newTitle;
  rebaseSubGroup(sg, sg.group);
}

export function renameTrack(t: Track, newTitle: string) {
  t.title = newTitle;
  rebaseTrack(t, t.subGroup);
}
