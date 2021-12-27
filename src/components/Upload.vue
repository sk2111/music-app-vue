<template>
  <div class="col-span-1">
    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
      <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
        <span class="card-title">Upload</span>
        <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
      </div>
      <div class="p-6">
        <!-- Upload Dropbox -->
        <div
          class="
            w-full
            px-10
            py-20
            rounded
            text-center
            cursor-pointer
            border border-dashed border-gray-400
            text-gray-400
            transition
            duration-500
            hover:text-white
            hover:bg-green-400
            hover:border-green-400
            hover:border-solid
          "
          :class="{
            'bg-green-400 border-green-400 border-solid text-white': isDragOver,
          }"
          @drag.prevent.stop=""
          @dragStart.prevent.stop=""
          @dragend.prevent.stop="isDragOver = false"
          @dragover.prevent.stop="isDragOver = true"
          @dragenter.prevent.stop="isDragOver = true"
          @dragleave.prevent.stop="isDragOver = false"
          @drop.prevent.stop="upload($event.dataTransfer)"
        >
          <h5>Drop your files here</h5>
        </div>
        <input type="file" multiple @change="upload($event.target)" />
        <hr class="my-6" />
        <!-- Progess Bars -->
        <div class="mb-4" v-for="upload in uploads" :key="upload.name">
          <!-- File Name -->
          <div class="font-bold text-sm" :class="upload.textClass">
            <i class="mr-2" :class="upload.icon"></i>{{ upload.name }}
          </div>
          <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
            <!-- Inner Progress Bar -->
            <div
              class="transition-all progress-bar"
              :class="upload.variant"
              :style="{ width: upload.currentProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { uuid } from 'vue-uuid';
import { storage, auth, songsCollection } from '@/includes/firebase';

export default {
  name: 'Upload',
  data() {
    return {
      isDragOver: false,
      uploads: [],
    };
  },
  beforeUnmount() {
    this.uploads.forEach(({ task }) => task.cancel());
  },
  methods: {
    updateUpload(task, name) {
      return (
        this.uploads.push({
          task,
          name,
          currentProgress: 0,
          variant: 'bg-blue-400',
          icon: 'fas fa-spinner fa-spin',
          textClass: '',
        }) - 1
      );
    },
    updateProgressBarStyles(idx, variant, icon, textClass) {
      this.uploads[idx].variant = variant;
      this.uploads[idx].icon = icon;
      this.uploads[idx].textClass = textClass;
    },
    updateProgressBar({ bytesTransferred, totalBytes }, idx) {
      const progress = (bytesTransferred / totalBytes) * 100;
      this.uploads[idx].currentProgress = progress;
    },
    handleUploadError(error, idx) {
      this.updateProgressBarStyles(
        idx,
        'bg-red-400',
        'fa fa-times',
        'text-red-400',
      );
      console.log(error);
    },
    async handleUploadSucces(task, file, idx) {
      const song = {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        songStorageRef: task.snapshot.ref.name,
        originalSongName: file.name,
        modifiedSongName: file.name,
        genre: '',
        commentCount: 0,
        url: await task.snapshot.ref.getDownloadURL(),
      };
      const songRef = await songsCollection.add(song);
      this.updateProgressBarStyles(
        idx,
        'bg-green-400',
        'fa fa-check',
        'text-green-400',
      );
      this.$emit('upload-completed', { id: songRef.id, ...song });
    },
    upload({ files }) {
      this.isDragOver = false;
      const songFiles = [...files];
      songFiles.forEach((file) => {
        if (file.type.includes('audio')) {
          const storageRef = storage.ref();
          const songsRef = storageRef.child(`songs/${uuid.v1()}-${file.name}`);
          const task = songsRef.put(file);
          const uploadIdx = this.updateUpload(task, file.name);
          task.on(
            'state_changed',
            (snapshot) => this.updateProgressBar(snapshot, uploadIdx),
            (error) => this.handleUploadError(error, uploadIdx),
            () => this.handleUploadSucces(task, file, uploadIdx),
          );
        }
      });
    },
  },
};
</script>
