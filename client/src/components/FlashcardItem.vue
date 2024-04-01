<template>
  <div class="flashcard-item" @click="flipCard">
    <div class="flashcard-content" :class="{ flipped: isFlipped }">
      <div class="flashcard-front">
        <h3>{{ flashcard.question }}</h3>
      </div>
      <div class="flashcard-back">
        <p>{{ flashcard.answer }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Directly use defineProps without importing it
const props = defineProps({
  flashcard: {
    type: Object,
    required: true
  }
})

const isFlipped = ref(false)

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}
</script>

<style scoped>
.flashcard-item {
  perspective: 1000px;
  height: fit-content;
  min-height: 35px;
  flex-basis: auto;
}

.flashcard-content {
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.flashcard-front,
.flashcard-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
}

.flashcard-back {
  transform: rotateY(180deg);
}

.flipped {
  transform: rotateY(180deg);
}
</style>
