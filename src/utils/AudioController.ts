export class AudioController {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private audioBuffer?: AudioBuffer;
  private sourceNode?: AudioBufferSourceNode;
  private analyser: AnalyserNode;
  private startTime: number;
  private pauseTime: number;
  private isPlaying: boolean;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.startTime = 0;
    this.pauseTime = 0;
    this.isPlaying = false;
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  async loadAudio(url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  play(): void {
    if (this.audioBuffer) {
      if (this.isPlaying) {
        return;
      }
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      this.sourceNode.connect(this.gainNode);
      this.sourceNode.start(0, this.pauseTime);
      this.startTime = this.audioContext.currentTime - this.pauseTime;
      this.isPlaying = true;
    }
  }

  pause(): void {
    if (this.isPlaying && this.sourceNode) {
      this.sourceNode.stop();
      this.pauseTime = this.audioContext.currentTime - this.startTime;
      this.isPlaying = false;
    }
  }

  stop(): void {
    if (this.isPlaying && this.sourceNode) {
      this.sourceNode.stop();
      this.pauseTime = 0;
      this.isPlaying = false;
    }
  }

  setVolume(volume: number): void {
    this.gainNode.gain.value = volume;
  }
  setPlaybackRate(rate: number): void {
    if (this.sourceNode) {
      this.sourceNode.playbackRate.value = rate;
    }
  }
}
