<template>
  <div>
    <button
      v-for="item in items"
      :key="item.id"
      :id="`button${item.id}`"
      @click="changeSrc(item.src, item.pcm, item.duration, item.samplerate)"
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
        ref="canvas"
        width="400"
        height="200"
        style="margin-left: 100px"
      ></canvas>
      <canvas ref="canvasPcm" width="400" height="200"></canvas>
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
      <canvas ref="timeScalePcm" height="20"></canvas>
      <canvas ref="waveformPcm" height="100"></canvas>
      <canvas
        ref="timeLinePcm"
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
import { visualizerPcm } from "@/utils/visualizerPcm";
export default defineComponent({
  setup() {
    const initAudio = reactive({
      src: "../assets/video/video30s.mp4",
      pcm: "../assets/pcm/video30s.pcm",
      duration: 29.4895,
      samplerate: 44100,
    });
    const items = ref<ItemData[]>([]);
    const canvas = ref<HTMLCanvasElement | null>(null);
    const canvasPcm = ref<HTMLCanvasElement | null>(null);
    const waveform = ref<HTMLCanvasElement | null>(null);
    const timeScale = ref<HTMLCanvasElement | null>(null);
    const timeLine = ref<HTMLCanvasElement | null>(null);
    const timeLinePcm = ref<HTMLCanvasElement | null>(null);
    const waveformPcm = ref<HTMLCanvasElement | null>(null);
    const timeScalePcm = ref<HTMLCanvasElement | null>(null);

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
    } = useAudio(initAudio.src, initAudio.pcm);
    const formatCurrentTime = computed(() => formatTime(state.currentTime));
    const formatTotalTime = computed(() => formatTime(state.totalTime));

    const { startVisualize, pauseVisualize } = audioVisualizer(
      audioController.value as AudioController,
      canvas
    );
    const { startVisualizePcm, pauseVisualizePcm } = visualizerPcm(
      audioController.value as AudioController,
      canvasPcm,
      state
    );
    const { startWave, pauseWave, drawWaveForm } = waveForm(
      audioController.value as AudioController,
      waveform,
      timeScale,
      timeLine
    );

    const { startWavePcm, pauseWavePcm, drawWavePcm } = pcm(
      audioController.value as AudioController,
      waveformPcm,
      timeScalePcm,
      timeLinePcm
    );

    const handleTimeChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newTime = parseFloat(target.value);
      setCurrentTime(newTime);
    };

    const changeSrc = async (
      src: string,
      pcm: string,
      duration: number,
      samplerate: number
    ) => {
      await resetAudio("../assets/" + src, "../assets/" + pcm);
      initAudio.duration = duration;
      initAudio.samplerate = samplerate;
      drawWaveForm();
      drawWavePcm(initAudio.duration);
      //startVisualizePcm(initAudio.samplerate);
    };

    const handlePlay = () => {
      play();
      startVisualize();
      //startVisualizePcm(initAudio.samplerate);
      startWave();
      startWavePcm(initAudio.duration);
    };
    const handlePause = () => {
      pause();
      pauseVisualize();
      //pauseVisualizePcm();
    };
    const handleStop = () => {
      stop();
      startVisualize();
      //startVisualizePcm(initAudio.samplerate);
      startWave();
      //pauseVisualize();
      pauseWave();
      startWavePcm(initAudio.duration);
      pauseWavePcm();
    };

    watch(
      () => state.isLoaded,
      (isLoaded) => {
        if (isLoaded) {
          startVisualize();
          //startVisualizePcm(initAudio.samplerate);
          pauseVisualize();
          pauseVisualizePcm();
          drawWaveForm();
          drawWavePcm(initAudio.duration);
        }
      }
    );
    watch(
      [() => state.currentTime, () => state.totalTime],
      ([currentTime, totalTime]) => {
        if (Math.abs(currentTime - totalTime) < 0.1) {
          handleStop();
        }
      }
    );

    onMounted(async () => {
      items.value = item.getItem();
    });

    return {
      initAudio,
      items,
      mute,
      state,
      updateVolume,
      updatePlaybackRate,
      canvas,
      canvasPcm,
      waveform,
      timeScale,
      waveformPcm,
      timeScalePcm,
      timeLine,
      timeLinePcm,
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
