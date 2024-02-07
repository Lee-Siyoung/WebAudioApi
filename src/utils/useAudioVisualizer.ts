import { Ref, ref } from "vue";

export const useAudioVisualizer = (
  analyser: AnalyserNode,
  canvasRef: Ref<HTMLCanvasElement | null>
) => {
  const animationId = ref<number | null>(null);
  const draw = () => {
    if (!canvasRef.value) return;
    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 123, 255)";
    ctx.beginPath();

    const sliceWidth = WIDTH / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 4;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 4);
    ctx.stroke();

    analyser.getByteFrequencyData(dataArray);
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let z = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      ctx.fillRect(z, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
      z += barWidth + 1;
    }

    animationId.value = requestAnimationFrame(draw);
  };

  const startVisualization = () => {
    draw();
  };

  const stopVisualization = () => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value);
    }
  };

  return { startVisualization, stopVisualization };
};
