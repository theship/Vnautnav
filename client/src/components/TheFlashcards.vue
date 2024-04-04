<template>
  <div class="flashcards-app">
    <div class="flashcard-container">
      <FlashcardItem v-if="flashcards.length > 0" :flashcard="flashcards[currentIndex]"
        :key="flashcards[currentIndex].id" @update-response="handleFlashcardResponse" />
    </div>
    <div class="nextprevnav">
      <button @click="previousFlashcard" :disabled="currentIndex <= 0">Previous</button>
      <button @click="nextFlashcard" :disabled="currentIndex >= flashcards.length - 1">Next</button>
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
import { ref, onMounted } from 'vue'

const flashcards = ref([])
const currentIndex = ref(0)

// Track if user has gotten or needs more practice on any flashcards
const responsesStored = ref(false);

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

const loadFlashcards = (filter = null) => {
  let url = 'http://localhost:3000/flashcards';
  if (filter !== null) {
    url += `?filter=${filter}`;
  }
  const token = localStorage.getItem('token'); // Token might be null if not logged in

  // Adjust the headers to include the token if it exists, otherwise, send without Authorization header
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  fetch(url, { headers })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      flashcards.value = data.data;
      currentIndex.value = 0; // Reset to the first flashcard
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
};

// Use loadFlashcards within onMounted to load the initial set of flashcards
onMounted(() => {
  loadFlashcards();
});

const handleFlashcardResponse = ({ flashcardId, gotIt }) => {
  const user = localStorage.getItem('username'); // Fetch the username from localStorage
  if (!user) {
    console.error("User is not logged in.");
    return;
  }

  fetch('http://localhost:3000/flashcardResponse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: user,
      flashcardId,
      gotIt
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      responsesStored.value = true; 
    })
    .catch((error) => console.error('Error:', error));
    
};

// Handle response updates
const updateFlashcardResponse = ({ flashcardId, gotIt }) => {
  const index = flashcards.value.findIndex(card => card.id === flashcardId);
  if (index !== -1) {
    flashcards.value[index].gotIt = gotIt; // 'gotIt' is a boolean property in flashcard db model
  }
};

// Filtering functions that utilize loadFlashcards with specific filters
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
