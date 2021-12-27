<template>
  <!-- Music Header -->
  <section class="w-full mb-8 py-14 text-center text-white relative">
    <div
      class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
      style="background-image: url(/assets/img/song-header.png)"
    ></div>
    <div class="container mx-auto flex items-center">
      <!-- Play/Pause Button -->
      <button
        type="button"
        class="
          z-50
          h-24
          w-24
          text-3xl
          bg-white
          text-black
          rounded-full
          focus:outline-none
          ml-5
        "
        @click.prevent="newSong(song)"
      >
        <i class="fas fa-play"></i>
      </button>
      <div class="z-50 text-left ml-8">
        <!-- Song Info -->
        <div class="text-3xl font-bold">{{ song.modifiedSongName }}</div>
        <div>{{ song.genre }}</div>
      </div>
    </div>
  </section>
  <!-- Form -->
  <section class="container mx-auto mt-6">
    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
      <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
        <!-- Comment Count -->
        <span class="card-title">Comments ({{ sortedComments.length }})</span>
        <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
      </div>
      <div class="p-6">
        <vee-form
          :validation-schema="schema"
          @submit="handleCommentSubmit"
          v-if="userLoggedIn"
        >
          <vee-field
            as="textarea"
            name="comment"
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
              mb-4
            "
            placeholder="Your comment here..."
          ></vee-field>
          <ErrorMessage name="comment" class="text-red-600" />
          <button
            type="submit"
            class="py-1.5 px-3 rounded text-white bg-green-600 block mb-2 mt-2"
            :disabled="commentInSubmission"
          >
            Submit
          </button>
        </vee-form>
        <!-- Sort Comments -->
        <select
          class="
            block
            mt-4
            py-1.5
            px-3
            text-gray-800
            border border-gray-300
            transition
            duration-500
            focus:outline-none focus:border-black
            rounded
          "
          v-model="sort"
        >
          <option value="1">Latest</option>
          <option value="2">Oldest</option>
        </select>
      </div>
    </div>
  </section>
  <!-- Comments -->
  <ul class="container mx-auto">
    <li
      class="p-6 bg-gray-50 border border-gray-200"
      v-for="comment in sortedComments"
      :key="comment.id"
    >
      <!-- Comment Author -->
      <div class="mb-5">
        <div class="font-bold">{{ comment.name }}</div>
        <time>{{ comment.updatedAt }}</time>
      </div>

      <p>
        {{ comment.content }}
      </p>
    </li>
  </ul>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import {
  songsCollection,
  commentsCollection,
  timestamp,
  auth,
} from '@/includes/firebase';

export default {
  name: 'Song',
  data() {
    return {
      song: {},
      comments: [],
      sort: '1',
      schema: {
        comment: 'required|min:3',
      },
      commentInSubmission: false,
    };
  },
  computed: {
    ...mapGetters(['playing']),
    ...mapState(['userLoggedIn']),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        if (this.sort === '1') {
          return b.updatedAt.toDate() - a.updatedAt.toDate();
        }
        return a.updatedAt.toDate() - b.updatedAt.toDate();
      });
    },
  },
  watch: {
    sort(newVal) {
      if (newVal === this.$route.query.sort) {
        return;
      }
      this.$router.push({
        query: {
          sort: newVal,
        },
      });
    },
  },
  async created() {
    const snapshot = await songsCollection.doc(this.$route.params.id).get();
    if (!snapshot.exists) {
      this.$router.push({ name: 'home' });
      return;
    }
    const { sort } = this.$route.query;
    this.sort = sort === '1' || sort === '2' ? sort : '1';
    this.song = snapshot.data();
    this.getComments();
  },
  methods: {
    ...mapActions(['newSong']),
    async getComments() {
      const snapshots = await commentsCollection
        .where('sid', '==', this.$route.params.id)
        .get();
      this.comments = [];
      snapshots.forEach((doc) => {
        this.comments.push({ id: doc.id, ...doc.data() });
      });
    },
    async handleCommentSubmit(values, { resetForm }) {
      this.commentInSubmission = true;
      const comment = {
        content: values.comment,
        updatedAt: timestamp.now(),
        sid: this.$route.params.id,
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
      };
      await commentsCollection.add(comment);
      this.getComments();
      this.commentInSubmission = false;
      resetForm();
    },
  },
};
</script>
