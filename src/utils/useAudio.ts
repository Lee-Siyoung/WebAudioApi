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
    currentTime: 0,
    totalTime: 0,
  });

  setInterval(() => {
    state.currentTime = audioController.getCurrentTime();
  }, 100);

  const setCurrentTime = (time: number) => {
    audioController.setCurrentTime(time);
  };

  audioController.loadAudio(url).then(() => {
    state.isLoaded = true;
    state.totalTime = audioController.getTotalDuration();
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

  const getAudioBuffer = () => {
    return audioController.getAudioBuffer();
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
    getAudioBuffer,
    setCurrentTime,
  };
}
