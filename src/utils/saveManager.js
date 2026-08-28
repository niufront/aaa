/**
 * 存档管理器
 * 处理游戏数据的本地存储和云端同步
 */

class SaveManager {
  constructor() {
    this.storageKey = 'dodge_runner_save';
    this.data = this.loadDefaultData();
  }

  // 获取默认存档数据
  loadDefaultData() {
    return {
      userId: 'player_' + Date.now(),
      createdAt: new Date().toISOString(),
      lastSaved: null,

      // 玩家数据
      player: {
        level: 1,
        maxLevel: 1,
        coins: 0,
        diamonds: 0,
        totalScore: 0,
        gamesPlayed: 0
      },

      // 任务数据
      tasks: {
        daily: {},
        achievements: {},
        lastReset: null
      },

      // 装扮数据
      cosmetics: {
        currentSkin: 'default',
        ownedSkins: ['default'],
        currentFrame: 'none',
        ownedFrames: ['none']
      },

      // 设置
      settings: {
        bgmEnabled: true,
        sfxEnabled: true,
        godMode: false
      },

      // 统计数据
      stats: {
        highScore: 0,
        totalCoinsCollected: 0,
        totalObstaclesDodged: 0,
        perfectGames: 0
      }
    };
  }

  // 从本地存储加载
  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = { ...this.loadDefaultData(), ...parsed };
        console.log('📂 存档加载成功');
        return true;
      }
    } catch (error) {
      console.error('加载存档失败:', error);
    }
    return false;
  }

  // 保存到本地存储
  save() {
    try {
      this.data.lastSaved = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      console.log('💾 存档已保存');
      return true;
    } catch (error) {
      console.error('保存存档失败:', error);
      return false;
    }
  }

  // 同步到服务器（可选）
  async syncToServer() {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.data.userId,
          data: this.data
        })
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.warn('云端同步失败:', error);
      return false;
    }
  }

  // 从服务器加载（可选）
  async loadFromServer() {
    try {
      const response = await fetch(`/api/save/${this.data.userId}`);
      const result = await response.json();
      if (result.success && result.data) {
        this.data = { ...this.loadDefaultData(), ...result.data };
        this.save();
        return true;
      }
    } catch (error) {
      console.warn('从云端加载失败:', error);
    }
    return false;
  }

  // 更新玩家数据
  updatePlayer(updates) {
    Object.assign(this.data.player, updates);
    this.save();
  }

  // 增加金币
  addCoins(amount) {
    this.data.player.coins += amount;
    this.data.stats.totalCoinsCollected += amount;
    this.save();
  }

  // 增加钻石
  addDiamonds(amount) {
    this.data.player.diamonds += amount;
    this.save();
  }

  // 更新最高分
  updateHighScore(score) {
    if (score > this.data.stats.highScore) {
      this.data.stats.highScore = score;
      this.save();
      return true;
    }
    return false;
  }

  // 解锁关卡
  unlockLevel(level) {
    if (level > this.data.player.maxLevel) {
      this.data.player.maxLevel = level;
      this.save();
    }
  }

  // 记录游戏次数
  addGamePlayed() {
    this.data.player.gamesPlayed++;
    this.save();
  }

  // 设置无敌模式
  setGodMode(enabled) {
    this.data.settings.godMode = enabled;
    this.save();
  }

  // 获取数据
  getData() {
    return { ...this.data };
  }

  // 重置存档
  reset() {
    this.data = this.loadDefaultData();
    this.save();
    console.log('🔄 存档已重置');
  }
}

// 创建全局实例
window.SaveManager = new SaveManager();
