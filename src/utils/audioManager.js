/**
 * 音效管理器
 * 处理背景音乐和游戏音效
 */

class AudioManagerClass {
  constructor() {
    this.bgmEnabled = true;
    this.sfxEnabled = true;
    this.bgmVolume = 0.3;
    this.sfxVolume = 0.5;
    this.currentBgm = null;
    this.audioContext = null;

    // 初始化音频上下文
    this.initAudioContext();
  }

  // 初始化音频上下文
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('音频上下文初始化失败:', e);
    }
  }

  // 播放简单音效（使用Web Audio API生成）
  playTone(frequency, duration, type = 'sine') {
    if (!this.sfxEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      // 静默处理
    }
  }

  // 播放金币收集音效
  playCoinSound() {
    this.playTone(880, 0.1);
    setTimeout(() => this.playTone(1100, 0.1), 50);
  }

  // 播放受伤音效
  playHitSound() {
    this.playTone(200, 0.2, 'sawtooth');
  }

  // 播放通关音效
  playWinSound() {
    this.playTone(523, 0.15);
    setTimeout(() => this.playTone(659, 0.15), 150);
    setTimeout(() => this.playTone(784, 0.15), 300);
    setTimeout(() => this.playTone(1047, 0.3), 450);
  }

  // 播放游戏结束音效
  playGameOverSound() {
    this.playTone(400, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(300, 0.3, 'sawtooth'), 200);
  }

  // 播放点击音效
  playClickSound() {
    this.playTone(600, 0.05);
  }

  // 切换背景音乐
  toggleBgm(enabled) {
    this.bgmEnabled = enabled;
    if (enabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  // 切换音效
  toggleSfx(enabled) {
    this.sfxEnabled = enabled;
  }

  // 开始背景音乐（简单循环）
  startBgm() {
    if (!this.bgmEnabled) return;
    // BGM实现可以后续添加音频文件
  }

  // 停止背景音乐
  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm = null;
    }
  }

  // 恢复音频上下文（需要用户交互后调用）
  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// 创建全局实例
window.AudioManager = new AudioManagerClass();
