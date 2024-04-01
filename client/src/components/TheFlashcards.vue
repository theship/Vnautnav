<template>
  <div class="flashcards-app">
    <div class="flashcard-container">
      <FlashcardItem v-if="flashcards.length > 0" :flashcard="flashcards[currentIndex]"
        :key="flashcards[currentIndex].id" />
    </div>
    <div class="navigation">
      <button @click="previousFlashcard" :disabled="currentIndex <= 0">Previous</button>
      <button @click="nextFlashcard" :disabled="currentIndex >= flashcards.length - 1">Next</button>
    </div>
  </div>
</template>

<script setup>
import FlashcardItem from './FlashcardItem.vue'
import { ref, onMounted } from 'vue'

const flashcards = ref([])
const currentIndex = ref(0)

const nextFlashcard = () => {
  if (currentIndex.value < flashcards.value.length - 1) {
    currentIndex.value++
  }
}

const previousFlashcard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

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
.flashcards-app {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 25vh;
  padding: 20px 0;
}

.flashcard-container {
  display: flex;
  justify-content: center;
  width: 100%;
  flex-grow: 1;
}

.navigation {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
  padding: 10px 0;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  color: hsla(160, 100%, 37%, 1);
  background-color: hsla(160, 100%, 97%, 1);
  min-width: 15vw;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
