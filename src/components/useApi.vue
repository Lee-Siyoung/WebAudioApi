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
      <p>재생 바</p>
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
    <div class="Control-Container">
      <div>
        <label for="volumeControl">볼륨</label>
        <div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            v-model="state.volume"
            @input="updateVolume(state.volume)"
            :disabled="state.isMute"
          />
        </div>
        <p>Volume: {{ state.volume }}</p>
        <label for="playbackRate">재생 속도</label>
        <div>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            v-model="state.playbackRate"
            @input="updatePlaybackRate(state.playbackRate)"
          />
        </div>
        <p>PlayRate: {{ state.playbackRate }}</p>
      </div>
      <canvas
        class="canvasRef"
        ref="canvas"
        width="400"
        height="200"
        style="margin-left: 100px"
      ></canvas>
    </div>
    <h3>WebAudioApi로 만듬</h3>
    <div
      class="waveform-container"
      style="width: 70%; overflow-x: auto; position: relative"
    >
      <canvas ref="timeScale" height="20"></canvas>
      <canvas ref="waveform" height="100"></canvas>
      <canvas
        ref="timeLine"
        height="100"
        style="position: absolute; z-index: 10; left: 0; bottom: 0"
      ></canvas>
    </div>
    <h3>pcm파일로 만듬</h3>
    <div
      class="waveform-container"
      style="width: 70%; overflow-x: auto; position: relative"
    >
      <canvas ref="timeScale2" height="20"></canvas>
      <canvas ref="waveform2" height="100"></canvas>
      <canvas
        ref="timeLine2"
        height="100"
        style="position: absolute; z-index: 10; left: 0; bottom: 0"
      ></canvas>
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
    const timeLine = ref<HTMLCanvasElement | null>(null);
    const timeLine2 = ref<HTMLCanvasElement | null>(null);
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
    const { startWave, pauseWave, drawWaveForm } = waveForm(
      audioController.value as AudioController,
      waveform,
      timeScale,
      timeLine
    );

    const { startWavePcm, pauseWavePcm, drawWavePcm } = pcm(
      audioController.value as AudioController,
      waveform2,
      timeScale2,
      timeLine2
    );

    const handleTimeChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newTime = parseFloat(target.value);
      setCurrentTime(newTime);
    };

    const changeSrc = async (src: string, pcm: string) => {
      await resetAudio("../assets/" + src, "../assets/" + pcm);
      drawWaveForm();
      drawWavePcm();
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
          pauseVisualize();
          drawWaveForm();
          drawWavePcm();
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
      timeLine,
      timeLine2,
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
.waveform-container {
  position: relative;
  display: block;
}
.Control-Container {
  display: flex;
}
</style>
