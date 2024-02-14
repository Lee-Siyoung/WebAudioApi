<template>
  <div>
    <input type="file" @change="handleFileChange" accept=".pcm" />
  </div>
  <div>
    <button @click="handlePlay">Play</button>
    <button @click="handlePause">Pause</button>
    <button @click="handleStop">Stop</button>
  </div>
  <div id="waveform-container" style="width: 100%; overflow-x: auto">
    <canvas ref="timeScale2" height="20"></canvas>
    <canvas ref="waveform2"></canvas>
  </div>
</template>

<script lang="ts">
import { pcm } from "@/utils/pcm";
import { defineComponent, ref } from "vue";
import { AudioController } from "@/utils/AudioController";
import { useAudio } from "@/utils/useAudio";
export default defineComponent({
  name: "notApi",
  setup() {
    const audioController = new AudioController();
    const { play, pause, stop } = useAudio(
      "../assets/video30s.mp4",
      audioController
    );
    const waveform2 = ref<HTMLCanvasElement | null>(null);
    const timeScale2 = ref<HTMLCanvasElement | null>(null);
    const handleFileChange = async (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files) return;

      const file = files[0];
      const data = await file.arrayBuffer();
      pcm(audioController, waveform2, timeScale2, data);
    };

    const handlePlay = () => {
      play();
    };
    const handlePause = () => {
      pause();
    };
    const handleStop = () => {
      stop();
    };
    return { handleFileChange, handlePlay, handlePause, handleStop };
  },
});
</script>

<style></style>
