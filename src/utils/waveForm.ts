import { ref, Ref } from "vue";
import { AudioController } from "./AudioController";
import { formatTime } from "./FormatTime";
export const waveForm = (
  audioController: AudioController,
  waveFromRef: Ref<HTMLCanvasElement | null>,
  timeScaleRef: Ref<HTMLCanvasElement | null>,
  timeLineRef: Ref<HTMLCanvasElement | null>
) => {
  const animationId = ref<number | null>(null);

  const drawWaveForm = () => {
    const waveFrom = waveFromRef.value;
    const timeScale = timeScaleRef.value;
    if (!waveFrom || !timeScale) return;
    const ctx = waveFrom.getContext("2d");
    const timeCtx = timeScale.getContext("2d");
    const audioBuffer = audioController.getAudioBuffer();
    if (!ctx || !timeCtx || !audioBuffer) return;
    const data = audioBuffer.getChannelData(0);
    const bufferLength = data.length;
    const duration = audioBuffer.duration;

    const timeScaleInterval = 5;
    const totalMarkers = Math.floor(duration / timeScaleInterval);
    const pixelPerSecond = 20;
    waveFrom.width = timeScale.width = 0;
    const totalWidth = Math.max(
      waveFrom.clientWidth,
      pixelPerSecond *
        (totalMarkers * timeScaleInterval + (duration % timeScaleInterval))
    );

    waveFrom.width = timeScale.width = totalWidth;

    const step = Math.ceil(bufferLength / waveFrom.width);
    const amp = waveFrom.height / 2;

    ctx.clearRect(0, 0, waveFrom.width, waveFrom.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, waveFrom.width, waveFrom.height);
    ctx.beginPath();

    for (let i = 0; i < waveFrom.width; i++) {
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
    // 시간 글자
    timeCtx.fillStyle = "black";
    timeCtx.font = "12px Arial";
    timeCtx.textAlign = "center";
    for (let i = 0; i <= totalMarkers; i++) {
      const marketTime = timeScaleInterval * i;
      const x = pixelPerSecond * marketTime;
      timeCtx.fillText(formatTime(marketTime), x, 10);
    }
  };

  const draw = () => {
    const waveFrom = waveFromRef.value;
    const timeLine = timeLineRef.value;
    if (!waveFrom || !timeLine) return;
    const timeLineCtx = timeLine.getContext("2d");
    const audioBuffer = audioController.getAudioBuffer();
    if (!timeLineCtx || !audioBuffer) return;
    const duration = audioBuffer.duration;
    timeLine.width = waveFrom.width;
    const currentTime = audioController.getCurrentTime();

    // 시간 선
    const x = (currentTime / duration) * timeLine.width;
    timeLineCtx.clearRect(0, 0, timeLine.width, timeLine.height);
    timeLineCtx.strokeStyle = "red";
    timeLineCtx.lineWidth = 2;
    timeLineCtx.beginPath();
    timeLineCtx.moveTo(x, 0);
    timeLineCtx.lineTo(x, timeLine.height);
    timeLineCtx.stroke();

    animationId.value = requestAnimationFrame(draw);
  };

  const startWave = () => {
    if (animationId.value !== null) {
      cancelAnimationFrame(animationId.value);
    }
    draw();
  };
  const pauseWave = () => {
    if (animationId.value !== null) {
      cancelAnimationFrame(animationId.value);
    }
  };
  return { startWave, pauseWave, drawWaveForm };
};
