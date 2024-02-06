import { reactive } from "vue";
import { AudioController } from "./AudioController";

export function useAudio(url: string) {
  const audioController = new AudioController();
  const state = reactive({
    volume: 1,
    playbackRate: 1,
    isLoaded: false,
    isCompressionActive: false,
    isMute: false,
  });

  audioController.loadAudio(url).then(() => {
    state.isLoaded = true;
  });

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

  const getAnalyser = () => {
    return audioController.getAnalyser();
  };

  const Compression = () => {
    audioController.Compression();
    state.isCompressionActive = !state.isCompressionActive;
  };

  return {
    play,
    pause,
    stop,
    mute,
    state,
    updateVolume,
    updatePlaybackRate,
    getAnalyser,
    Compression,
  };
}
