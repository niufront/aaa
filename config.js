/**
 * 游戏全局配置文件
 * 修改此文件可调整游戏数值、关卡参数、奖励规则等
 */

const GameConfig = {
  // ========== 游戏基础配置 ==========
  game: {
    title: '躲避跑酷',
    version: '1.0.0',
    fps: 60,
    canvasWidth: 400,
    canvasHeight: 600,
    // 无敌模式触发密码（用户不会轻易发现）
    godModeSecret: '↑↑↓↓←→←→BA',
    godModeClickPattern: [7, 7, 3, 3] // 连续点击位置：左上x7次, 右上x7次, 左下x3次, 右下x3次
  },

  // ========== 角色配置 ==========
  player: {
    width: 40,
    height: 40,
    speed: 5,
    initialLives: 3,
    maxLives: 5,
    invincibleDuration: 2000 // 无敌持续时间（毫秒）
  },

  // ========== 关卡配置 ==========
  levels: [
    {
      id: 1,
      name: '新手训练',
      targetScore: 100,
      obstacleSpeed: 2,
      obstacleFrequency: 0.02,
      coinFrequency: 0.03,
      background: '#87CEEB'
    },
    {
      id: 2,
      name: '速度提升',
      targetScore: 250,
      obstacleSpeed: 3,
      obstacleFrequency: 0.025,
      coinFrequency: 0.025,
      background: '#98D8E8'
    },
    {
      id: 3,
      name: '障碍密集',
      targetScore: 500,
      obstacleSpeed: 3.5,
      obstacleFrequency: 0.035,
      coinFrequency: 0.02,
      background: '#7EC8E3'
    },
    {
      id: 4,
      name: '精英挑战',
      targetScore: 800,
      obstacleSpeed: 4,
      obstacleFrequency: 0.04,
      coinFrequency: 0.02,
      background: '#5DADE2'
    },
    {
      id: 5,
      name: '极限生存',
      targetScore: 1200,
      obstacleSpeed: 5,
      obstacleFrequency: 0.05,
      coinFrequency: 0.015,
      background: '#3498DB'
    }
  ],

  // ========== 资源系统 ==========
  resources: {
    coinValue: 10,
    diamondValue: 1,
    // 体力系统
    maxEnergy: 30,
    energyRecoveryInterval: 300000, // 5分钟恢复1点
    energyPerLevel: 5
  },

  // ========== 道具配置 ==========
  items: {
    magnet: {
      name: '磁铁',
      duration: 5000,
      effect: 'attractCoins'
    },
    shield: {
      name: '护盾',
      duration: 3000,
      effect: 'blockOnce'
    },
    doubleScore: {
      name: '双倍积分',
      duration: 8000,
      effect: 'doubleScore'
    }
  },

  // ========== 任务系统 ==========
  tasks: {
    daily: [
      { id: 'd1', name: '完成3局游戏', target: 3, reward: { coins: 50 } },
      { id: 'd2', name: '收集50个金币', target: 50, reward: { coins: 30, diamonds: 5 } },
      { id: 'd3', name: '达到500分', target: 500, reward: { diamonds: 10 } },
      { id: 'd4', name: '通关第2关', target: 2, reward: { coins: 100 } }
    ],
    achievements: [
      { id: 'a1', name: '初出茅庐', desc: '完成第一局游戏', reward: { coins: 100, diamonds: 20 } },
      { id: 'a2', name: '分数达人', desc: '单局得分超过1000', reward: { diamonds: 50 } },
      { id: 'a3', name: '收集控', desc: '累计收集500个金币', reward: { coins: 200, diamonds: 30 } },
      { id: 'a4', name: '不死传说', desc: '单局不死亡通关', reward: { diamonds: 100 } }
    ]
  },

  // ========== 存档配置 ==========
  save: {
    autoSaveInterval: 30000, // 30秒自动存档
    localStorageKey: 'dodge_runner_save',
    serverSavePath: './save_data/'
  },

  // ========== 音效配置 ==========
  audio: {
    bgmVolume: 0.3,
    sfxVolume: 0.5,
    enabled: true
  }
};

module.exports = GameConfig;
