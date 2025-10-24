<template>
	<div class="soundboard-page">
		<Dresser side="left" :initial-index="0" >
			<Drawer :drawer="{ icon: 'mdi-menu', label: 'Navigation' }">
				<v-treeview
					:items="fileNodes"
					item-value="id"
					item-title="title"
					item-children="children"
					activatable
					open-on-click
					color="primary"
					@update:activated="onSelect"
					:activated="[]"
					:return-object="true"
				>
					<template #prepend="{ item }">
						<v-icon v-if="item.type==='file'" :color="item.id == selectedFile?.id ? 'info' : ''">mdi-file-music</v-icon>
						<v-icon v-else-if="item.type==='group'" :color="item.id == selectedGroup?.id ? 'info' : ''">mdi-archive-music</v-icon>
						<v-icon v-else-if="item.type==='subGroup'" :color="item.id == selectedSubGroup?.id ? 'info' : ''">mdi-playlist-music</v-icon>
						<v-icon v-else :color="item.id == selectedTrack?.id ? 'info' : ''">mdi-music</v-icon>
					</template>
					<template #append="{ item }">
						<v-btn
						class="edit-button"
						icon
						small
						:title="`Edit '${item.title}'`"
						@click.stop="editItem(item)"
						>
						<v-icon class="material-symbols-outlined notranslate"
							>mdi-pencil</v-icon
						>
						</v-btn>
					</template>
				</v-treeview>
			</Drawer>
		</Dresser>

		<v-container class="content" fluid>
			<v-sheet class="subgroup-toolbar" elevation="2">
				<v-breadcrumbs :items="[
					{ title: selectedFile?.title || 'Select Group', disabled: !selectedFile },
					{ title: selectedGroup?.title || 'Select Group', disabled: !selectedGroup },
					{ title: selectedSubGroup?.title || 'Select SubGroup', disabled: !selectedSubGroup },
					{ title: selectedTrack?.title || 'Select Track', disabled: !selectedTrack },
				]" divider="chevron-right">
					<template v-slot:divider>
						<v-icon icon="mdi-chevron-right"></v-icon>
					</template>
				</v-breadcrumbs>
			</v-sheet>
			<v-slide-group v-if="selectedSubGroup" show-arrows >
				<v-slide-group-item
					v-for="track in selectedSubGroup.children"
					:key="track.id"
					:value="track.id"
					v-slot="{ isSelected, toggle }"
				>
					<v-card
						class="ma-4 track-card"
						:class="{
							playing: track.id === selectedTrack?.id && isPlaying,
							selected: isSelected
						}"
						height="160"
						width="140"
						@click="onTrackClick(track, toggle)"
					>
						<div class="art-wrap">
							<img
								:src="track.thumbnailCandidates?.[0] || ''"
								:data-fallbacks="track.thumbnailCandidates?.join('|') || ''"
								@error="onThumbnailError"
								alt=""
							/>
						</div>

						<!-- play/pause overlay -->
						<v-fade-transition>
							<div
								v-if="track.id === selectedTrack?.id"
								class="play-overlay"
								:aria-label="isPlaying ? 'Pause' : 'Play'"
							>
								<v-icon size="48" class="play-icon">
									{{ isPlaying ? 'mdi-pause-circle' : 'mdi-play-circle' }}
								</v-icon>
							</div>
						</v-fade-transition>

						<div class="title-overlay">
							{{ track.title }}
						</div>
					</v-card>
				</v-slide-group-item>
			</v-slide-group>
			<v-spacer />
		</v-container>

		<Dresser side="right" :initial-index="0" >
			<Drawer :drawer="{ icon: 'mdi-pencil', label: 'Navigation' }">
				<EditorPanel></EditorPanel>
			</Drawer>
		</Dresser>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Dresser from "@shared/components/layout/Dresser.vue";
import Drawer from "@shared/components/layout/Drawer.vue";
import { SelectMixin } from "../mixins/SoundboardPage/selectMixin";
import { PlayMixin } from "../mixins/SoundboardPage/playMixin";
import { LoadFilesMixin } from "../mixins/SoundboardPage/loadFilesMixin";
import { EditMixin } from "../mixins/PlayerDrawer/editMixin";
import EditorPanel from "../components/EditorPanel.vue";
import { onThumbnailError } from "../utils/formatting";

export default defineComponent({
	name: "SoundboardPage",
	components: { Dresser, Drawer, EditorPanel },
	mixins: [SelectMixin, PlayMixin, LoadFilesMixin, EditMixin],
	methods: {
		onThumbnailError,
	}
});
</script>

<style scoped lang="scss">
.soundboard-page {
	position: relative;
	display: grid;
	grid-template-columns: auto 1fr auto;
	gap: 0;
	max-width: 100vw;
	width: 100%;

	.edit-button {
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.12s ease;
	}
	.v-list-item:hover .edit-button {
		opacity: 1;
		pointer-events: auto;
	}
}

.content {
	display: flex;
	flex-direction: column;
	padding: 16px;
	
	.subgroup-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		border-radius: 12px;
	}
}

.track-card {
	position: relative;
	overflow: hidden;

	width: 140px;
	height: 160px;
	display: flex;
	align-items: center;
	justify-content: center;

	&.playing {
		outline: 2px solid rgba(var(--v-theme-primary));
	}
	&.selected:not(.playing) {
		outline: 2px dashed rgba(var(--v-theme-primary), 0.6);
	}

	.play-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		background: radial-gradient(ellipse at center, rgba(0,0,0,.20), transparent 60%);

		.play-icon {
			filter:
				drop-shadow(0 1px 1px rgba(0,0,0,.85))
				drop-shadow(0 4px 12px rgba(0,0,0,.45));

			text-shadow:
				0 1px 2px rgba(0,0,0,.9),
				0 0 2px rgba(0,0,0,.7);
		}
	}

	.art-wrap {
		position: absolute;
		inset: 0;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
		}
	}

	.title-overlay {
		position: absolute;
		left: 0; right: 0; bottom: 0;
		padding: 6px 8px;
		font-size: 12px;
		line-height: 1.2;
		color: white;
		background: linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,0.55));
	}
}
</style>
