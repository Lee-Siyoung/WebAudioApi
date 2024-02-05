<template>
  <div>
    <button @click="play">Play</button>
    <button @click="stop">Stop</button>
    <input
      type="range"
      min="0"
      max="2"
      step="0.1"
      v-model="volume"
      @input="updateVolume(volume)"
    />
    <p>Volume: {{ volume }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAudio } from "@/utils/useAudio";

export default defineComponent({
  setup() {
    const { play, stop, volume, updateVolume } = useAudio("../assets/test.mp3");

    return { play, stop, volume, updateVolume };
  },
});
</script>
