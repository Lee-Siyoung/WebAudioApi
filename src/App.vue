<template>
  <div>
    <button @click="handlePlay">Play</button>
    <button @click="handlePause">Pause</button>
    <button @click="stop">Stop</button>
    <button @click="mute">
      {{ state.isMute ? "음소거 중" : "음소거 안함" }}
    </button>

    <button @click="Compression">
      {{ state.isCompressionActive ? "압축" : "압축 품" }}
    </button>
    <div>
      <input
        type="range"
        min="0"
        :max="state.totalTime"
        step="0.1"
        v-model="state.currentTime"
        @input="handleTimeChange"
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
    <div id="waveform-container" style="width: 100%; overflow-x: auto">
      <canvas ref="timeScale" height="20"></canvas>
      <canvas ref="waveform"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useAudio } from "@/utils/useAudio";
import { useAudioVisualizer } from "./utils/useAudioVisualizer";
import { waveForm } from "./utils/waveForm";
import { formatTime } from "@/utils/FormatTime";
import { AudioController } from "./utils/AudioController";
export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const waveform = ref<HTMLCanvasElement | null>(null);
    const timeScale = ref<HTMLCanvasElement | null>(null);
    const audioController = new AudioController();
    const {
      play,
      pause,
      stop,
      mute,
      state,
      updateVolume,
      updatePlaybackRate,
      getAnalyser,
      getAudioBuffer,
      Compression,
      setCurrentTime,
    } = useAudio("../assets/test.mp3", audioController);
    const { startVisualization, stopVisualization } = useAudioVisualizer(
      getAnalyser(),
      canvas
    );
    const formatCurrentTime = computed(() => formatTime(state.currentTime));
    const formatTotalTime = computed(() => formatTime(state.totalTime));

    const handleTimeChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newTime = parseFloat(target.value);
      setCurrentTime(newTime);
    };

    const handlePlay = () => {
      play();
      startVisualization();
    };
    const handlePause = () => {
      pause();
      stopVisualization();
    };

    onMounted(() => {
      watch(
        () => state.isLoaded,
        (isLoaded) => {
          if (isLoaded) {
            const audioBuffer = getAudioBuffer();
            if (waveform.value && timeScale.value && audioBuffer) {
              waveForm(
                audioController,
                audioBuffer,
                waveform.value,
                timeScale.value
              );
            }
          }
        }
      );
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
      waveform,
      timeScale,
      Compression,
      setCurrentTime,
      handleTimeChange,
      formatCurrentTime,
      formatTotalTime,
      handlePause,
      handlePlay,
    };
  },
});
</script>

<style>
canvas {
  display: block;
}
</style>
