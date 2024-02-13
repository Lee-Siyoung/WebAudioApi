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
  private totalDuration: number;
  private playbackRate: number;
  public isPlaying: boolean;
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
    ); // 압축이 적용되기 시작하는 데시벨 값을 나타내는 k-rate
    this.compressor.knee.setValueAtTime(40, this.audioContext.currentTime); // 곡선이 압축된 부분으로 원활하게 전환되는 임계값 위의 범위를 나타내는 데시벨 값이 포함된 k-rate
    this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime); // 출력이 1dB 변경되는 데 필요한 입력에 필요한 변경량(dB)을 나타내는 k-rate
    this.compressor.attack.setValueAtTime(0, this.audioContext.currentTime); // 게인을 10dB만큼 줄이는 데 필요한 시간(초)을 나타내는 k-rate
    this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime); // 이득을 10dB 증가시키는 데 필요한 시간(초)을 나타내는 k-rate

    this.isCompressionActive = false;

    // 압축기를 경로에 추가하지 않고, 기본 연결 유지
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.totalDuration = 0;
    this.playbackRate = 1;
    this.startTime = 0;
    this.pauseTime = 0;
    this.lastVolume = 1;
    this.isPlaying = false;
  }

  getAudioBuffer(): AudioBuffer | undefined {
    return this.audioBuffer;
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
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer); // 오디오 파일을 생성
      this.totalDuration = this.audioBuffer.duration;
    } catch (error) {
      console.error("오디오 로딩 오류: ", error);
    }
  }

  play(): void {
    if (this.audioBuffer) {
      if (this.isPlaying && this.sourceNode) {
        this.pause();
      }
      this.sourceNode = this.audioContext.createBufferSource(); //오디오 데이터를 재생하는 데 사용
      this.sourceNode.buffer = this.audioBuffer;
      this.sourceNode.connect(this.gainNode);
      this.sourceNode.start(0, this.pauseTime);
      this.startTime = this.audioContext.currentTime;
      this.isPlaying = true;
    }
  }

  pause(): void {
    if (this.isPlaying && this.sourceNode) {
      this.sourceNode.stop();
      this.pauseTime += this.audioContext.currentTime - this.startTime;
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
    this.playbackRate = rate;
    if (this.sourceNode) {
      this.sourceNode.playbackRate.value = rate;
    }
  }
  getCurrentTime(): number {
    if (this.isPlaying && this.sourceNode && this.audioContext) {
      const elapsedTime =
        (this.audioContext.currentTime - this.startTime) * this.playbackRate;
      return this.pauseTime + elapsedTime;
    }
    return this.pauseTime;
  }

  setCurrentTime(time: number): void {
    const wasPlaying = this.isPlaying;
    this.pauseTime = time;
    if (wasPlaying) {
      if (this.sourceNode) {
        this.sourceNode.stop();
      }
      this.play();
    }
  }

  getTotalDuration(): number {
    return this.totalDuration;
  }
}
