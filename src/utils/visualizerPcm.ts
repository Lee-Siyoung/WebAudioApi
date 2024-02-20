import { ref, Ref } from "vue";
import { AudioController } from "./AudioController";
import { State } from "@/types/State";
export const visualizerPcm = (
  audioController: AudioController,
  canvasPcm: Ref<HTMLCanvasElement | null>,
  state: State
) => {
  const animationId = ref<number | null>(null);
  const draw = (samplerate: number) => {
    if (!canvasPcm.value) return;
    const canvas = canvasPcm.value;
    const ctx = canvas.getContext("2d");
    const pcmData = audioController.arrayBufferPcm;
    if (!ctx || !pcmData) return;

    const dataView = new DataView(pcmData);
    const numSamples = pcmData.byteLength / 2; // 파일에 포함된 샘플의 총 갯수. /2는 각 샘플이 2bite(16bit)로 표현됐기 때문
    const pcmDataArray = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      pcmDataArray[i] = int16 / 32768.0; // -1.0 ~ 1.0 사이로 정규화
    }
    const bufferLength = 2048;
    const currentTime = state.currentTime;
    let startIndex = Math.floor(currentTime * samplerate - bufferLength / 2);
    startIndex = Math.max(startIndex, 0);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 123, 255)";
    ctx.beginPath();

    const sliceWidth = WIDTH / bufferLength;
    let x = 0;
    for (
      let i = startIndex;
      i < startIndex + bufferLength && i < pcmDataArray.length;
      i++
    ) {
      const v = (pcmDataArray[i] + 1) / 2;
      const y = v * HEIGHT;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.quadraticCurveTo(x - sliceWidth / 2, y, x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();
    animationId.value = requestAnimationFrame(() => draw(samplerate));
  };

  const startVisualizePcm = (samplerate: number) => {
    if (animationId.value !== null) {
      cancelAnimationFrame(animationId.value);
    }
    draw(samplerate);
  };
  const pauseVisualizePcm = () => {
    if (animationId.value !== null) {
      cancelAnimationFrame(animationId.value);
    }
  };

  return { startVisualizePcm, pauseVisualizePcm };
};
