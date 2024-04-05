<template>
  <div class="flashcards-app">
    <div class="flashcard-container">
      <FlashcardItem v-if="flashcards.length > 0" :flashcard="flashcards[currentIndex]"
        :key="flashcards[currentIndex].id" @update-response="handleFlashcardResponse" />
    </div>
    <div class="nextprevnav">
      <button @click="navigateFlashcard(-1)" :disabled="currentIndex <= 0">Previous</button>
      <button @click="navigateFlashcard(1)" :disabled="currentIndex >= flashcards.length - 1">Next</button>
    </div>
    <div class="filter-buttons" v-if="responsesStored">
      <button @click="loadGotItFlashcards">Load 'Got it' flashcards</button>
      <button @click="loadMorePracticeFlashcards">Load 'More practice' flashcards</button>
      <button @click="loadAllFlashcards">Load the full set of flashcards</button>
    </div>
  </div>
</template>

<script setup>
import FlashcardItem from './FlashcardItem.vue'
import { ref, onMounted, computed } from 'vue'
import { fetchFlashcards, postFlashcardResponse } from '../services/flashcardService' 

const flashcards = ref([])
const currentIndex = ref(0)
const responsesStored = ref(false);

// Computed properties for button disable state
const isPreviousDisabled = computed(() => currentIndex.value <= 0);
const isNextDisabled = computed(() => currentIndex.value >= flashcards.value.length - 1);

const navigateFlashcard = (direction) => {
  const newIndex = currentIndex.value + direction;
  if (newIndex >= 0 && newIndex < flashcards.value.length) {
    currentIndex.value = newIndex;
  }
}

const loadFlashcards = async (filter = null) => {
  try {
    const data = await fetchFlashcards(filter);
    flashcards.value = data.data;
    currentIndex.value = 0;
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
  }
};

onMounted(() => loadFlashcards());

const handleFlashcardResponse = async ({ flashcardId, gotIt }) => {
  try {
    const data = await postFlashcardResponse({ flashcardId, gotIt });
    console.log(data);
    responsesStored.value = true;
  } catch (error) {
    console.error('Error:', error);
  }
};

const updateFlashcardResponse = ({ flashcardId, gotIt }) => {
  const index = flashcards.value.findIndex(card => card.id === flashcardId);
  if (index !== -1) {
    // Ensuring reactivity; Vue should automatically handle this, but using spread for complex scenarios
    const updatedFlashcards = [...flashcards.value];
    updatedFlashcards[index] = { ...updatedFlashcards[index], gotIt };
    flashcards.value = updatedFlashcards;
  }
};

const loadGotItFlashcards = () => loadFlashcards('gotIt');
const loadMorePracticeFlashcards = () => loadFlashcards('morePractice');
const loadAllFlashcards = () => loadFlashcards();
</script>

<style scoped>
.flashcards-app {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 50vh;
  padding: 20px 0;
}

.flashcard-container {
  display: flex;
  justify-content: center;
  width: 100%;
  flex-grow: 1;
}

.nextprevnav {
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
