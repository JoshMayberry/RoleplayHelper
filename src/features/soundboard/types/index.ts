export type SoundboardMode = "view" | "edit";
export type SidebarOptions = "tree" | "player" | "edit" | null;
export type TrackState = "stopped" | "playing" | "paused" | "editing";

export type FileNode = {
  type: "file";
  id: string;
  title: string;
  children: Group[];
};

export type Group = {
  type: "group";
  id: string;
  file: FileNode;

  title: string; 
  children: SubGroup[];
};

export type SubGroup = {
  type: "subGroup";
  id: string;
  group: Group;
  file: FileNode;

  title: string; 
  children: Track[];
};

export type Track = {
  type: "track";
  id: string;
  subGroup: SubGroup;
  group: Group;
  file: FileNode;

  title: string;
  url: string;
  thumbnailCandidates?: string[];
  useVolume?: boolean;
  volume?: number;
  isLoop?: boolean;
};

export type PartialGroup = Omit<Partial<Group>, "children" | "file" | "id"> & {
  children: PartialSubGroup[];
};

export type PartialSubGroup = Omit<Partial<SubGroup>, "children" | "group" | "file" | "id"> & {
  group?: PartialGroup;
  children: PartialTrack[];
};

export type PartialTrack = Omit<Partial<Track>, "subGroup" | "group" | "file" | "id"> & {
  subGroup?: PartialSubGroup;
  group?: PartialGroup;
};

export type EditSelection =
  | { type: "track"; data: Track }
  | { type: "subgroup"; data: SubGroup }
  | { type: "group"; data: Group }
  | null;

export type Draft =
  | { type: "track"; data: Pick<Track, "id" | "title" | "url" | "useVolume" | "volume" | "isLoop">; ref: Track }
  | { type: "subgroup"; data: Pick<SubGroup, "id" | "title">; ref: SubGroup }
  | { type: "group"; data: Pick<Group, "id" | "title">; ref: Group }
  | { type: "file"; data: Pick<FileNode, "id" | "title">; ref: FileNode };

export type Clipboard =
  | { kind: "group"; data: PartialGroup }
  | { kind: "subgroup"; data: PartialSubGroup }
  | { kind: "track"; data: PartialTrack }
  | null;