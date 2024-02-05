import { ref } from "vue";
import { AudioController } from "./AudioController";

export function useAudio(url: string) {
  const audioController = new AudioController();
  const isLoaded = ref(false);
  const volume = ref(1);

  audioController.loadAudio(url).then(() => {
    isLoaded.value = true;
  });

  const play = () => {
    if (isLoaded.value) {
      audioController.play();
    }
  };

  const stop = () => {
    audioController.stop();
  };

  const updateVolume = (newVolume: number) => {
    volume.value = newVolume;
    audioController.setVolume(volume.value);
  };

  return { play, stop, volume, updateVolume };
}
