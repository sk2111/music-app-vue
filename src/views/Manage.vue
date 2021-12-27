<template>
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <Upload @upload-completed="addSong" />
      <div class="col-span-2">
        <div
          class="bg-white rounded border border-gray-200 relative flex flex-col"
        >
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">My Songs</span>
            <i
              class="fa fa-compact-disc float-right text-green-400 text-2xl"
            ></i>
          </div>
          <div class="p-6">
            <!-- Composition Items -->
            <composition-item
              :song="song"
              v-for="(song, idx) in songs"
              :key="song.id"
              :idx="idx"
              :updateSong="updateSong"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import Upload from '@/components/Upload.vue';
import { songsCollection, auth } from '@/includes/firebase';
import CompositionItem from '@/components/CompositionItem.vue';

export default {
  name: 'Manage',
  components: {
    Upload,
    CompositionItem,
  },
  data() {
    return {
      songs: [],
      unsavedFlag: false,
    };
  },
  created() {
    this.fetchSongList();
  },
  beforeRouteLeave(to, from, next) {
    if (!this.unsavedFlag) {
      next();
    } else {
      // eslint-disable-next-line no-alert, no-restricted-globals
      const leave = confirm(
        'You have unsaved changes. Are you sure you want to leave?',
      );
      next(leave);
    }
  },
  methods: {
    addSong(songInfo) {
      this.songs.push(songInfo);
    },
    updateSong(idx, values) {
      this.songs[idx] = { ...this.songs[idx], ...values };
    },
    removeSong(idx) {
      this.songs.splice(idx, 1);
    },
    async fetchSongList() {
      const snapshot = await songsCollection
        .where('uid', '==', auth.currentUser.uid)
        .get();
      snapshot.forEach((doc) => {
        this.addSong({ id: doc.id, ...doc.data() });
      });
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value;
    },
  },
};
</script>
