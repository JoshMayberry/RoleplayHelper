import { defineStore } from "pinia";
import { EditMode, HelpReactionType, HelpType, Mode, Point, RSTransform, User } from "@features/investigation-web/types"
import { Snapshot } from "../types/snapshot";
import { NodeAny } from "../types/node";
import { LinkAny } from "../types/links";
import { TrackAny } from "../types/track";

export const useMainStore = defineStore("investigation-web", {
	state: () => ({
		currentUser: "player" as User,
		currentMode: "view" as Mode,
		currentEditMode: "none" as EditMode,

		isDirty: false,
		
		svgElement: null as SVGSVGElement | null,
		worldElement: null as SVGGElement | null,
		rsTransform: { k:1, x:0, y:0 } as RSTransform,
		
		settings: {
			help: {
				left: {
					text: "current-mode" as HelpType,
					otherOnChange: "update" as HelpReactionType,
				},
				right: {
					text: "current-sub-mode" as HelpType,
					otherOnChange: "none" as HelpReactionType,
				},
			},
			gridOverlay: {
				enabled: true,
				alwaysVisible: false,
				size: 40,
			},
			overlapPadding: {
				radius: 16,
				enable: false,
				show: false,
			},
			drag: {
				startThreshold: 3,
			},
			linkHitRadius: 10,
		},
		snapshotList: [] as Snapshot[],
		currentSnapshotIndex: 0,

		selected: {
			node: undefined as NodeAny | undefined,
			link: undefined as LinkAny | undefined,
			track: undefined as TrackAny | undefined,
		},
		drag: {
			isValid: false,
			isDragging: false as boolean | undefined, // Use undefiend for "maybe"
			startClient: { x:0, y:0 } as Point,
			currentPosition: { x:0, y:0 } as Point,
		},
	}),
	getters: {
		currentSnapshot(): Snapshot | undefined {
			return this.snapshotList?.[this.currentSnapshotIndex];
		},
		nodeMap(): Record<string, NodeAny> {
			return Object.fromEntries(
				(this.currentSnapshot?.nodes || []).map((node) => [node.id, node]),
			);
		},
		linkMap(): Record<string, LinkAny> {
			return Object.fromEntries(
				(this.currentSnapshot?.links || []).map((link) => [link.id, link]),
			);
		},
	},
	actions: {
		init(svgElement: SVGSVGElement, worldElement:SVGGElement) {
			this.svgElement = svgElement;
			this.worldElement = worldElement;
		},
		cancel() {
			this.selected.node = undefined;
			this.selected.link = undefined;
			this.selected.track = undefined;

			this.currentEditMode = "none";
			this.drag.isDragging = false;
		},
		dragStart(clientX: number, clientY: number) {
			this.drag.isValid = true;
			this.drag.isDragging = undefined; // We might start dragging, so pannign shoudl be disabled
      this.drag.startClient = {
				x: clientX,
				y: clientY,
			};
			this.drag.currentPosition = this.drag.startClient;
		},
		dragUpdate(clientX: number, clientY: number, checkStartThreshold: boolean) {
			if (this.drag.isDragging === false) {
				return;
			}

			const dx = clientX - this.drag.startClient.x;
			const dy = clientY - this.drag.startClient.y;
			if (checkStartThreshold && (this.drag.isDragging === undefined)) {
				const startThreshold = this.settings.drag.startThreshold;
				if ((Math.abs(dx) < startThreshold) && (Math.abs(dy) < startThreshold)) {
					return; // Wait for it to move enough to count as an actual move and not just a click.
				}
			}

			switch (this.currentEditMode) {
				case "drag-free-node":
					this.drag.currentPosition.x += dx;
					this.drag.currentPosition.y += dy;
					break;

				default:
					throw new Error(`Unknown drag mode '${this.currentEditMode}'`);
			}

			this.drag.isDragging = true;
		},
		dragEnd() {
			this.drag.isDragging = false;
		},
		moveNode(nodeId: string, position: Point): boolean {
			const node = this.nodeMap[nodeId];
			if (!node) {
				return false;
			}

			node.x = position.x;
			node.y = position.y;
			this.isDirty = true;

			return true;
		},
		updateSelectedNode<K extends keyof NodeAny>(key: K, value: NodeAny[K]) {
			if (!this.selected.node) {
				throw new Error("No selected node");
			}
			
			this.selected.node[key] = value
			this.isDirty = true
		},
	},
});
