<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div v-show="!showForm">
      <h4 class="inline-block text-1xl font-bold w-96 truncate">
        {{ song.modifiedName }}
      </h4>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
        @click.prevent="deleteSong"
      >
        <i class="fa fa-times"></i>
      </button>
      <button
        class="
          ml-1
          py-1
          px-2
          text-sm
          rounded
          text-white
          bg-blue-600
          float-right
        "
        @click.prevent="showForm = !showForm"
      >
        <i class="fa fa-pencil-alt"></i>
      </button>
    </div>
    <div
      class="text-white text-center font-bold p-4 mb-4"
      v-if="showAlert"
      :class="alertVariant"
    >
      {{ alertMessage }}
    </div>
    <div v-show="showForm">
      <vee-form
        :validation-schema="schema"
        :initial-values="song"
        @submit="handleSubmit"
      >
        <div class="mb-3">
          <label class="inline-block mb-2">{{ song.modifiedName }}</label>
          <vee-field
            name="modifiedName"
            type="text"
            class="
              block
              w-full
              py-1.5
              px-3
              text-gray-800
              border border-gray-300
              transition
              duration-500
              focus:outline-none focus:border-black
              rounded
            "
            @input="updateUnsavedFlag(true)"
            placeholder="Enter Song Title"
          />
          <ErrorMessage name="modifiedName" class="text-red-600 mt-4" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field
            name="genre"
            type="text"
            class="
              block
              w-full
              py-1.5
              px-3
              text-gray-800
              border border-gray-300
              transition
              duration-500
              focus:outline-none focus:border-black
              rounded
            "
            @input="updateUnsavedFlag(true)"
            placeholder="Enter Genre"
          />
          <ErrorMessage name="genre" class="text-red-600 mt-4" />
        </div>
        <button
          type="submit"
          class="py-1.5 px-3 rounded text-white bg-green-600"
          :disabled="inSubmission"
        >
          Submit
        </button>
        <button
          type="button"
          class="py-1.5 px-3 rounded text-white bg-gray-600 ml-3"
          :disabled="inSubmission"
          @click.prevent="handleFormClose"
        >
          Go Back
        </button>
      </vee-form>
    </div>
  </div>
</template>

<script>
import { songsCollection, storage } from '@/includes/firebase';

export default {
  name: 'CompositionItem',
  props: {
    song: {
      type: Object,
      required: true,
    },
    updateSong: {
      type: Function,
      required: true,
    },
    removeSong: {
      type: Function,
      required: true,
    },
    idx: {
      type: Number,
      required: true,
    },
    updateUnsavedFlag: {
      type: Function,
    },
  },
  data() {
    return {
      showForm: false,
      schema: {
        modifiedName: 'required',
        genre: 'alpha_spaces',
      },
      inSubmission: false,
      showAlert: false,
      alertVariant: 'bg-blue-500',
      alertMessage: 'Please wait! Updating song info..',
    };
  },
  methods: {
    updateAlertBox(inSubmission, showAlert, alertVariant, alertMessage) {
      this.inSubmission = inSubmission;
      this.showAlert = showAlert;
      this.alertVariant = alertVariant;
      this.alertMessage = alertMessage;
    },
    handleFormClose() {
      this.showForm = false;
      this.showAlert = false;
      this.updateUnsavedFlag(false);
    },
    handleSuccessUpdate(values) {
      this.updateAlertBox(false, true, 'bg-green-500', 'Success!');
      this.updateSong(this.idx, values);
      this.updateUnsavedFlag(false);
    },
    handleFailureUpdate() {
      this.updateAlertBox(
        false,
        true,
        'bg-red-500',
        'Something went wrong! Try again',
      );
    },
    async handleSubmit(values) {
      this.updateAlertBox(
        true,
        true,
        'bg-blue-500',
        'Please wait! Updating song info..',
      );
      songsCollection
        .doc(this.song.id)
        .update(values)
        .then(() => this.handleSuccessUpdate(values))
        .catch(this.handleFailureUpdate);
    },
    async deleteSong() {
      try {
        const storageRef = storage.ref();
        const songRef = storageRef.child(`/songs/${this.song.originalName}`);
        await songRef.delete();
        await songsCollection.doc(this.song.id).delete();
        this.removeSong(this.idx);
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>
