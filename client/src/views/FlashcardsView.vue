<template>
  <div class="flashcards">
    <h1>This is the flashcards page</h1>

    <TheFlashcard
      v-for="flashcard in flashcards"
      :key="flashcard.id"
      :question="flashcard.question"
      :answer="flashcard.answer"></TheFlashcard>

  </div> 
</template>

<script>
export default {
  props: ['question', 'answer'],
  data() {
    return {
      flipped: false,
    };
  },
  methods: {
    flipCard() {
      this.flipped = !this.flipped;
    },
  },
};
</script>
