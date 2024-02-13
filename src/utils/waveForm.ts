import { ref } from "vue";
import { AudioController } from "./AudioController";
import { formatTime } from "./FormatTime";
export const waveForm = (
  audioController: AudioController,
  waveFromRef: HTMLCanvasElement,
  timeScaleRef: HTMLCanvasElement
) => {
  if (!waveFromRef || !timeScaleRef) return;
  const ctx = waveFromRef.getContext("2d");
  const timeCtx = timeScaleRef.getContext("2d");
  const audioBuffer = audioController.getAudioBuffer();
  if (!ctx || !timeCtx || !audioBuffer) return;
  const animationId = ref<number | null>(null);
  const data = audioBuffer.getChannelData(0);
  const bufferLength = data.length;
  const duration = audioBuffer.duration;

  const timeScaleInterval = 5;
  const totalMarkers = Math.floor(duration / timeScaleInterval);
  const pixelPerSecond = 20;
  const totalWidth = Math.max(
    waveFromRef.clientWidth,
    pixelPerSecond *
      (totalMarkers * timeScaleInterval + (duration % timeScaleInterval))
  );

  waveFromRef.width = timeScaleRef.width = totalWidth;

  const drawTimeScale = () => {
    timeCtx.clearRect(0, 0, timeScaleRef.width, timeScaleRef.height);
    timeCtx.fillStyle = "black";
    timeCtx.font = "12px Arial";
    timeCtx.textAlign = "center";
    for (let i = 0; i <= totalMarkers; i++) {
      const marketTime = timeScaleInterval * i;
      const x = pixelPerSecond * marketTime;
      timeCtx.fillText(formatTime(marketTime), x, 10);
    }
    // const lastMarkerX = pixelPerSecond * duration;
    // timeCtx.textAlign = "end";
    // timeCtx.fillText(formatTime(duration), lastMarkerX, 10);
  };

  const draw = () => {
    const step = Math.ceil(bufferLength / waveFromRef.width);
    const amp = waveFromRef.height / 2;
    const currentTime = audioController.getCurrentTime();

    ctx.clearRect(0, 0, waveFromRef.width, waveFromRef.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, waveFromRef.width, waveFromRef.height);
    ctx.beginPath();

    for (let i = 0; i < waveFromRef.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
      ctx.fillStyle = "#38f";
    }
    drawTimeScale();
    timeLine(currentTime); // 시간 선

    animationId.value = requestAnimationFrame(draw);
  };

  const timeLine = (currentTime: number) => {
    const x = (currentTime / duration) * waveFromRef.width;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, waveFromRef.height);
    ctx.stroke();
  };

  draw();
};
