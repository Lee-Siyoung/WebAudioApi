<template>
  <div>
    <button
      v-for="item in items"
      :key="item.id"
      :id="`button${item.id}`"
      @click="changeSrc(item.src, item.pcm)"
    >
      Test {{ item.id }}
    </button>
  </div>
  <div>
    <button @click="handlePlay">Play</button>
    <button @click="handlePause">Pause</button>
    <button @click="handleStop">Stop</button>
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
    <h3>WebAudioApi로 만듬</h3>
    <div id="waveform-container" style="width: 100%; overflow-x: auto">
      <canvas ref="timeScale" height="20"></canvas>
      <canvas ref="waveform"></canvas>
    </div>
    <div>
      <h3>pcm파일로 만듬</h3>
      <div id="waveform-container" style="width: 100%; overflow-x: auto">
        <canvas ref="timeScale2" height="20"></canvas>
        <canvas ref="waveform2"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useAudio } from "@/utils/useAudio";
import { audioVisualizer } from "@/utils/audioVisualizer";
import { waveForm } from "@/utils/waveForm";
import { formatTime } from "@/utils/FormatTime";
import { AudioController } from "@/utils/AudioController";
import { pcm } from "@/utils/pcm";
import { ItemData } from "@/types/itemList";
import item from "@/utils/item";
export default defineComponent({
  setup() {
    const apiState = reactive({
      src: "../assets/video/video30s.mp4",
      pcm: "../assets/pcm/video30s.pcm",
    });
    const items = ref<ItemData[]>([]);
    const canvas = ref<HTMLCanvasElement | null>(null);
    const waveform = ref<HTMLCanvasElement | null>(null);
    const timeScale = ref<HTMLCanvasElement | null>(null);
    const waveform2 = ref<HTMLCanvasElement | null>(null);
    const timeScale2 = ref<HTMLCanvasElement | null>(null);

    const {
      play,
      pause,
      stop,
      mute,
      state,
      updateVolume,
      updatePlaybackRate,
      Compression,
      setCurrentTime,
      resetAudio,
      audioController,
    } = useAudio(apiState.src, apiState.pcm);
    const formatCurrentTime = computed(() => formatTime(state.currentTime));
    const formatTotalTime = computed(() => formatTime(state.totalTime));

    const { startVisualize, pauseVisualize } = audioVisualizer(
      audioController.value as AudioController,
      canvas
    );
    const { startWave, pauseWave } = waveForm(
      audioController.value as AudioController,
      waveform,
      timeScale
    );

    const { startWavePcm, pauseWavePcm } = pcm(
      audioController.value as AudioController,
      waveform2,
      timeScale2
    );

    const handleTimeChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newTime = parseFloat(target.value);
      setCurrentTime(newTime);
    };

    const changeSrc = async (src: string, pcm: string) => {
      await resetAudio("../assets/" + src, "../assets/" + pcm);
    };

    const handlePlay = () => {
      play();
      startVisualize();
      startWave();
      startWavePcm();
    };
    const handlePause = () => {
      pause();
      pauseVisualize();
      pauseWave();
      pauseWavePcm();
    };
    const handleStop = () => {
      stop();
      startVisualize();
      startWave();
      pauseVisualize();
      pauseWave();
      startWavePcm();
      pauseWavePcm();
    };

    watch(
      () => state.isLoaded,
      (isLoaded) => {
        if (isLoaded) {
          startVisualize();
          startWave();
          pauseVisualize();
          pauseWave();
          startWavePcm();
          pauseWavePcm();
        }
      }
    );

    onMounted(async () => {
      items.value = item.getItem();
    });

    return {
      apiState,
      items,
      mute,
      state,
      updateVolume,
      updatePlaybackRate,
      canvas,
      waveform,
      timeScale,
      waveform2,
      timeScale2,
      Compression,
      handleTimeChange,
      formatCurrentTime,
      formatTotalTime,
      handlePause,
      handlePlay,
      handleStop,
      changeSrc,
    };
  },
});
</script>

<style>
canvas {
  display: block;
}
</style>
