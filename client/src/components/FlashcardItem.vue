<template>
  <div class="flashcard-item" @click="flipCard">
    <div class="flashcard-content" :class="{ flipped: isFlipped }">
      <div class="flashcard-front">
        <h3>{{ flashcard.question }}</h3>
      </div>
      <div class="flashcard-back">
        <p>{{ flashcard.answer }}</p>
        <!-- Response buttons, shown only if the user is logged in and the card is flipped -->
        <button v-if="isFlipped && isLoggedIn" @click.stop="handleResponse(true)">Got it!</button>
        <button v-if="isFlipped && isLoggedIn" @click.stop="handleResponse(false)">More practice, please.</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  flashcard: {
    type: Object,
    required: true
  }
})

const isFlipped = ref(false)
const emit = defineEmits(['update-response'])

// Computed property to determine if the user is logged in
const isLoggedIn = computed(() => {
  return localStorage.getItem('username') !== null;
});

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

// Handle user response
const handleResponse = (gotIt) => {
  emit('update-response', { flashcardId: props.flashcard.id, gotIt });
}
</script>

<style scoped>
.flashcard-item {
  perspective: 1000px;
  height: fit-content;
  min-height: 35px;
  flex-basis: auto;
  margin: 0 auto;
  min-width: 100%;
  max-width: 25vh;
}

.flashcard-content {
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  position: relative;
}

.flashcard-front,
.flashcard-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  padding: 20px;
  border: 1px solid hsla(160, 100%, 37%, 1);
  border-radius: 10px;
  top: 0;
  left: 0;
  background-color: hsla(160, 100%, 98%, 1);
  cursor: pointer;
}

.flashcard-back {
  transform: rotateY(180deg);
  height: fit-content;
}

.flipped {
  transform: rotateY(180deg);
}

.flashcard-back button {
  display: block;
  width: calc(100% - 40px);
  margin: 5px auto;
  padding: 5px;
  background-color: hsla(160, 100%, 40%, 1);
  color: white;
  border: none;
  border-radius: 10px;
  transition: background-color 0.3s;
}

.flashcard-back button:active {
  background-color: hsla(160, 100%, 87%, 1);
}

.flashcard-back button:nth-child(3) {
  background-color: hsla(4.11, 89.62%, 66%, 1);
}

.flashcard-back button:nth-child(3):active {
  background-color: hsla(4.11, 89.62%, 87%, 1);
}

.flashcard-back button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.flashcard-back {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: fit-content;
}
</style>
