import * as d3 from "d3"
import { defineComponent } from "vue";
import { CommonMixin } from "../commonMixin";

export const ZoomMixin = defineComponent({
	mixins: [CommonMixin],
  emits: ["zoom"],
  props: {
    minZoom: { type:Number, default: 0.25 },
    maxZoom: { type:Number, default: 3 },
    zoomStep: { type:Number, default: 0.08 },
  },
	data() {
		return {
      zoomBehavior: null as d3.ZoomBehavior<SVGSVGElement, unknown> | null,
		};
	},
	methods: {
		initZoom() {
			if (!this.svgElement) return;
      const _this = this;
      this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([this.minZoom, this.maxZoom])
        .filter(function(event: MouseEvent) {
					switch (event.type) {
						case "mousedown":
							if (_this.currentEditMode_usesDragBehavior || _this.currentEditMode_isDragging || (_this.store.drag.isDragging !== false)) {
								return false; // Disable background drag-pan while Link Lasso or Link Cutter active
							}

							if (event.button !== 0) {
								return false; // Do not drag when the button is not pressed?
							}
							break;
					}

          if ((event.target as HTMLElement).closest(".stash-zone")) {
						return false; // Do not drag in the stash zone?
					}

          return true;
        })
        .on("zoom", function(ev){
          const transform = ev.transform;
          _this.rsTransform = { k: transform.k, x: transform.x, y: transform.y };
          _this.$emit("zoom", { ..._this.rsTransform });
        });

      d3.select(this.svgElement)
        .call(this.zoomBehavior as any)
        .on("dblclick.zoom", null); // Do not zoom in on double click
		},
	}
});