import { reactive, ref } from "vue";
import { AudioController } from "./AudioController";

export function useAudio(src: string, pcm: string) {
  const audioController = ref(new AudioController());
  const state = reactive({
    volume: 1,
    playbackRate: 1,
    isLoaded: false,
    isCompressionActive: false,
    isMute: false,
    currentTime: 0,
    totalTime: 0,
  });

  setInterval(() => {
    state.currentTime = audioController.value.getCurrentTime();
  }, 100);

  const setCurrentTime = (time: number) => {
    audioController.value.setCurrentTime(time);
  };

  const loadAudio = async (newSrc: string, newPcm: string) => {
    await audioController.value.loadAudio(newSrc, newPcm);
    state.isLoaded = true;
    state.totalTime = audioController.value.getTotalDuration();
  };

  const resetAudio = async (src: string, pcm: string) => {
    await audioController.value.resetAudio(src, pcm);
    state.totalTime = audioController.value.getTotalDuration();
  };
  const play = () => {
    if (state.isLoaded) {
      audioController.value.play();
    }
  };

  const pause = () => {
    audioController.value.pause();
  };

  const stop = () => {
    audioController.value.stop();
  };

  const mute = () => {
    audioController.value.mute();
    state.isMute = !state.isMute;
  };

  const updateVolume = (newVolume: number) => {
    state.volume = newVolume;
    audioController.value.setVolume(state.volume);
  };

  const updatePlaybackRate = (newRate: number) => {
    state.playbackRate = newRate;
    audioController.value.setPlaybackRate(state.playbackRate);
  };

  const Compression = () => {
    audioController.value.Compression();
    state.isCompressionActive = !state.isCompressionActive;
  };

  loadAudio(src, pcm);

  return {
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
  };
}
