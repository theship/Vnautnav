<template>
  <div class="flashcards-container">
    <FlashcardItem v-for="flashcard in flashcards" :key="flashcard.id" :flashcard="flashcard" />
  </div>
</template>

<script setup>
import FlashcardItem from './FlashcardItem.vue'
import { ref, onMounted } from 'vue'

const flashcards = ref([])

onMounted(() => {
  fetch('http://localhost:3000/flashcards')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      flashcards.value = data.data;
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
      // Handle the error appropriately in a real app
    });
});
</script>

<style scoped>
.flashcards-container {
  display: flex;
  flex-direction: column;
  gap: 125px;
}
</style>
