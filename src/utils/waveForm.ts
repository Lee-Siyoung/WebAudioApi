import { Ref } from "vue";

export const waveForm = (
  audioBuffer: AudioBuffer,
  waveFromRef: HTMLCanvasElement
) => {
  if (!waveFromRef) return;
  const canvas = waveFromRef;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  console.log("as");
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / WIDTH);
  const amp = HEIGHT / 2;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.beginPath();

  for (let i = 0; i < WIDTH; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const value = data[i * step + j];
      if (value < min) min = value;
      if (value > max) max = value;
    }
    const yLow = (min + 1) * amp;
    const yHigh = (max + 1) * amp;

    ctx.moveTo(i, yLow);
    ctx.lineTo(i, yHigh);
  }

  ctx.strokeStyle = "#38f";
  ctx.stroke();
};
