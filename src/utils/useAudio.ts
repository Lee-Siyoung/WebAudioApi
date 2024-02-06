import { reactive } from "vue";
import { AudioController } from "./AudioController";

export function useAudio(url: string) {
  const audioController = new AudioController();
  const state = reactive({
    isLoaded: false,
    volume: 1,
    playbackRate: 1,
  });

  audioController.loadAudio(url).then(() => {
    state.isLoaded = true;
  });

  const play = () => {
    if (state.isLoaded) {
      audioController.play();
    }
  };

  const stop = () => {
    audioController.stop();
  };

  const updateVolume = (newVolume: number) => {
    state.volume = newVolume;
    audioController.setVolume(state.volume);
  };

  const updatePlaybackRat = (newRate: number) => {
    state.playbackRate = newRate;
    audioController.setPlaybackRate(state.playbackRate);
  };

  return { play, stop, state, updateVolume, updatePlaybackRat };
}
