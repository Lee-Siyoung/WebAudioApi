<template>
  <div>
    <button @click="play">Play</button>
    <button @click="pause">Pause</button>
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
    <div>
      <canvas ref="waveform" width="1000" height="100"></canvas>
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
    const { startVisualization } = useAudioVisualizer(getAnalyser(), canvas);
    const formatCurrentTime = computed(() => formatTime(state.currentTime));
    const formatTotalTime = computed(() => formatTime(state.totalTime));
    const handleTimeChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newTime = parseFloat(target.value);
      setCurrentTime(newTime);
    };
    onMounted(() => {
      watch(
        () => state.isLoaded,
        (isLoaded) => {
          if (isLoaded) {
            if (canvas.value) {
              startVisualization();
            }
            const audioBuffer = getAudioBuffer();
            if (waveform.value && audioBuffer) {
              waveForm(audioController, audioBuffer, waveform.value);
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
      Compression,
      setCurrentTime,
      handleTimeChange,
      formatCurrentTime,
      formatTotalTime,
    };
  },
});
</script>

<style></style>
