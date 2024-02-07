import { AudioController } from "./AudioController";
export const waveForm = (
  audioController: AudioController,
  audioBuffer: AudioBuffer,
  waveFromRef: HTMLCanvasElement
) => {
  if (!waveFromRef) return;
  const canvas = waveFromRef;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let animationFrameId: number;
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const data = audioBuffer.getChannelData(0);
  const bufferLength = data.length;
  const duration = audioBuffer.duration;

  const draw = () => {
    const step = Math.ceil(bufferLength / WIDTH);
    const amp = HEIGHT / 2;
    const currentTime = audioController.getCurrentTime();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.beginPath();

    for (let i = 0; i < WIDTH; i++) {
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
    timeLine(currentTime); // 시간 선
    animationFrameId = requestAnimationFrame(draw);
  };

  const timeLine = (currentTime: number) => {
    const x = (currentTime / duration) * WIDTH;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  };

  draw();
};
