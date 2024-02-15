import { ref, Ref } from "vue";
import { AudioController } from "./AudioController";
import { formatTime } from "./FormatTime";
export const pcm = (
  audioController: AudioController,
  waveFromRef: Ref<HTMLCanvasElement | null>,
  timeScaleRef: Ref<HTMLCanvasElement | null>
) => {
  const animationId = ref<number | null>(null);

  const draw = () => {
    const waveFrom = waveFromRef.value;
    const timeScale = timeScaleRef.value;
    if (!waveFrom || !timeScale || !audioController.arrayBufferPcm) return;
    const ctx = waveFrom.getContext("2d");
    const timeCtx = timeScale.getContext("2d");

    const pcmData = audioController.arrayBufferPcm;
    const dataView = new DataView(pcmData);
    const numSamples = pcmData.byteLength / 2; // 파일에 포함된 샘플의 총 갯수. /2는 각 샘플이 2bite(16bit)로 표현됐기 때문
    const data = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      data[i] = int16 / 32768.0; // -1.0 ~ 1.0 사이로 정규화
    }

    const audioBuffer = audioController.getAudioBuffer();
    if (!ctx || !timeCtx || !audioBuffer) return;
    waveFrom.width = timeScale.width = 0;
    const bufferLength = data.length;
    const duration = audioBuffer.duration;
    const timeScaleInterval = 5;
    const totalMarkers = Math.floor(duration / timeScaleInterval);
    const pixelPerSecond = 20;
    const totalWidth = Math.max(
      waveFrom.clientWidth,
      pixelPerSecond *
        (totalMarkers * timeScaleInterval + (duration % timeScaleInterval))
    );

    waveFrom.width = timeScale.width = totalWidth;

    const step = Math.ceil(bufferLength / waveFrom.width);
    const amp = waveFrom.height / 2;
    const currentTime = audioController.getCurrentTime();

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

    // 시간 선
    const x = (currentTime / duration) * waveFrom.width;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, waveFrom.height);
    ctx.stroke();

    // 시간 글자
    timeCtx.clearRect(0, 0, timeScale.width, timeScale.height);
    timeCtx.fillStyle = "black";
    timeCtx.font = "12px Arial";
    timeCtx.textAlign = "center";
    for (let i = 0; i <= totalMarkers; i++) {
      const marketTime = timeScaleInterval * i;
      const x = pixelPerSecond * marketTime;
      timeCtx.fillText(formatTime(marketTime), x, 10);
    }
    animationId.value = requestAnimationFrame(draw);
  };

  const startWavePcm = () => {
    if (animationId.value !== null) {
      cancelAnimationFrame(animationId.value);
    }
    draw();
  };
  const pauseWavePcm = () => {
    if (animationId.value !== null) {
      cancelAnimationFrame(animationId.value);
    }
  };
  return { startWavePcm, pauseWavePcm };
};
