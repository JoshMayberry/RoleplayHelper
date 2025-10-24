export type User = "player" | "gm";

export type Mode = 
	| "view" 
  | "file"
	| "edit" 
	| "discovery" 
	| "filter" 
	| "bonus" 
	| "simulation" 
	| "setting";

export type EditMode =
  | "none"
  | "add-free-node"
  | "add-snap-node"
  | "add-link"
  | "add-track"
  | "place-stashed-node"
  | "place-stashed-snap-node"
  | "drag-free-node"
  | "drag-snap-node"
  | "drag-track"
  | "drag-track-end"
  | "edit-selected-node"
  | "relink"
  | "add-calc-group"
	| "link-lasso"
	| "link-cutter";

export type GhostMode = "none"|"drag-node"|"add-free"|"place-staged";

export interface RSTransform { k:number; x:number; y:number; }

export type Unit = number | string;
export interface Point {
    x: number
    y: number
}
export interface Rect extends Point {
    w: number
    h: number
}

export type ViewPolicy = {
  canEditStructure: boolean;
  canDiscover: boolean;
  canInteract: boolean;
};
  