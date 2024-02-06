export class AudioController {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private compressor: DynamicsCompressorNode;
  private audioBuffer?: AudioBuffer;
  private sourceNode?: AudioBufferSourceNode;
  private analyser: AnalyserNode;
  private startTime: number;
  private pauseTime: number;
  private lastVolume: number;
  private isPlaying: boolean;
  private isCompressionActive: boolean;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    // 압축기 설정
    this.compressor.threshold.setValueAtTime(
      -50,
      this.audioContext.currentTime
    );
    this.compressor.knee.setValueAtTime(40, this.audioContext.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
    this.compressor.attack.setValueAtTime(0, this.audioContext.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);

    this.isCompressionActive = false;

    // 압축기를 경로에 추가하지 않고, 기본 연결 유지
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.startTime = 0;
    this.pauseTime = 0;
    this.lastVolume = 1;
    this.isPlaying = false;
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  Compression() {
    if (this.isCompressionActive) {
      // 압축 비활성화
      this.gainNode.disconnect();
      this.compressor.disconnect();
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } else {
      // 압축 활성화
      this.gainNode.disconnect();
      this.gainNode.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
    this.isCompressionActive = !this.isCompressionActive;
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
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.pauseTime = 0;
      this.isPlaying = false;
    }
  }

  mute(): void {
    if (this.gainNode.gain.value > 0) {
      this.lastVolume = this.gainNode.gain.value;
      this.gainNode.gain.value = 0;
    } else {
      this.gainNode.gain.value = this.lastVolume;
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
