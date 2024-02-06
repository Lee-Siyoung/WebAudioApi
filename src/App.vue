<template>
  <div>
    <button @click="play">Play</button>
    <button @click="stop">Stop</button>
    <div>
      <label for="volumeControl">볼륨</label>
      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        v-model="state.volume"
        @input="updateVolume(state.volume)"
      />
      <p>Volume: {{ state.volume }}</p>
      <label for="playbackRate">재생 속도</label>
      <input
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        v-model="state.playbackRate"
        @input="updatePlaybackRat(state.playbackRate)"
      />
      <p>PlayRate: {{ state.playbackRate }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAudio } from "@/utils/useAudio";

export default defineComponent({
  setup() {
    const { play, stop, state, updateVolume, updatePlaybackRat } =
      useAudio("../assets/test.mp3");

    return { play, stop, state, updateVolume, updatePlaybackRat };
  },
});
</script>

<style></style>
