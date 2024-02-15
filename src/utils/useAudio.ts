import { reactive } from "vue";
import { AudioController } from "./AudioController";

export function useAudio(src: string, audioController: AudioController) {
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
    state.currentTime = audioController.getCurrentTime();
  }, 100);

  const setCurrentTime = (time: number) => {
    audioController.setCurrentTime(time);
  };

  const loadAudio = async (newSrc: string) => {
    await audioController.loadAudio(newSrc);
    state.isLoaded = true;
    state.totalTime = audioController.getTotalDuration();
  };

  const play = () => {
    if (state.isLoaded) {
      audioController.play();
    }
  };

  const pause = () => {
    audioController.pause();
  };

  const stop = () => {
    audioController.stop();
  };

  const mute = () => {
    audioController.mute();
    state.isMute = !state.isMute;
  };

  const updateVolume = (newVolume: number) => {
    state.volume = newVolume;
    audioController.setVolume(state.volume);
  };

  const updatePlaybackRate = (newRate: number) => {
    state.playbackRate = newRate;
    audioController.setPlaybackRate(state.playbackRate);
  };

  const Compression = () => {
    audioController.Compression();
    state.isCompressionActive = !state.isCompressionActive;
  };

  loadAudio(src);

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
    loadAudio,
  };
}
