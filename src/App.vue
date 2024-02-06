<template>
  <div>
    <button @click="play">Play</button>
    <button @click="pause">Pause</button>
    <button @click="stop">Stop</button>
    <button @click="mute">{{ state.isMute ? "음소거해제" : "음소거" }}</button>

    <button @click="Compression">
      {{ state.isCompressionActive ? "압축" : "압축품" }}
    </button>
    <div>
      <input
        type="range"
        min="0"
        :max="state.totalTime"
        step="1"
        v-model="state.currentTime"
        @input="setCurrentTime(state.currentTime)"
      />
      <p>{{ formatCurrentTime }} / {{ formatTotalTime }}</p>
    </div>
    <div>
      <label for="volumeControl">볼륨</label>
      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        v-model="state.volume"
        @input="updateVolume(state.volume)"
        :disabled="state.isMute"
      />
      <p>Volume: {{ state.volume }}</p>
      <label for="playbackRate">재생 속도</label>
      <input
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        v-model="state.playbackRate"
        @input="updatePlaybackRate(state.playbackRate)"
      />
      <p>PlayRate: {{ state.playbackRate }}</p>
    </div>
    <canvas ref="canvas" width="400" height="200"></canvas>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useAudio } from "@/utils/useAudio";
import { useAudioVisualizer } from "./utils/useAudioVisualizer";
import { formatTime } from "@/utils/FormatTime";
export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const {
      play,
      pause,
      stop,
      mute,
      state,
      updateVolume,
      updatePlaybackRate,
      getAnalyser,
      Compression,
      setCurrentTime,
    } = useAudio("../assets/video30s.mp4");
    const { startVisualization } = useAudioVisualizer(getAnalyser(), canvas);
    const formatCurrentTime = computed(() => formatTime(state.currentTime));
    const formatTotalTime = computed(() => formatTime(state.totalTime));
    onMounted(() => {
      if (canvas.value) {
        startVisualization();
      }
    });

    return {
      play,
      pause,
      stop,
      mute,
      state,
      updateVolume,
      updatePlaybackRate,
      canvas,
      Compression,
      setCurrentTime,
      formatCurrentTime,
      formatTotalTime,
    };
  },
});
</script>

<style></style>
