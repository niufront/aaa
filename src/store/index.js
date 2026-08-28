/**
 * 游戏状态管理
 * 使用 Vue 的响应式系统管理全局状态
 */

function useGameStore() {
  // 从存档加载数据
  const savedData = window.SaveManager.getData();

  // 响应式状态
  const state = Vue.reactive({
    // 玩家数据
    player: { ...savedData.player },

    // 任务数据
    dailyTasks: [
      { id: 'd1', name: '完成3局游戏', target: 3, current: 0, reward: { coins: 50 }, claimed: false },
      { id: 'd2', name: '收集50个金币', target: 50, current: 0, reward: { coins: 30, diamonds: 5 }, claimed: false },
      { id: 'd3', name: '达到500分', target: 500, current: 0, reward: { diamonds: 10 }, claimed: false },
      { id: 'd4', name: '通关第2关', target: 2, current: 0, reward: { coins: 100 }, claimed: false }
    ],

    // 成就数据
    achievements: [
      { id: 'a1', name: '初出茅庐', desc: '完成第一局游戏', target: 1, current: 0, reward: { coins: 100, diamonds: 20 }, unlocked: false },
      { id: 'a2', name: '分数达人', desc: '单局得分超过1000', target: 1000, current: 0, reward: { diamonds: 50 }, unlocked: false },
      { id: 'a3', name: '收集控', desc: '累计收集500个金币', target: 500, current: 0, reward: { coins: 200, diamonds: 30 }, unlocked: false },
      { id: 'a4', name: '不死传说', desc: '单局不死亡通关', target: 1, current: 0, reward: { diamonds: 100 }, unlocked: false }
    ],

    // 设置
    settings: { ...savedData.settings },

    // 统计数据
    stats: { ...savedData.stats },

    // 无敌模式进度
    konamiProgress: 0,

    // 今日日期（用于每日任务重置）
    today: new Date().toDateString()
  });

  // 重置每日任务
  const checkDailyReset = () => {
    const today = new Date().toDateString();
    if (state.today !== today) {
      state.today = today;
      state.dailyTasks.forEach(task => {
        task.current = 0;
        task.claimed = false;
      });
      SaveManager.save();
    }
  };

  // 添加游戏次数
  const addGamePlayed = () => {
    state.player.gamesPlayed++;
    state.dailyTasks.find(t => t.id === 'd1').current++;

    checkAchievements();
    SaveManager.updatePlayer(state.player);
  };

  // 更新分数
  const updateScore = (score) => {
    state.player.totalScore += score;
    state.dailyTasks.find(t => t.id === 'd3').current = Math.max(
      state.dailyTasks.find(t => t.id === 'd3').current,
      score
    );

    if (score > state.stats.highScore) {
      state.stats.highScore = score;
    }

    checkAchievements();
    SaveManager.updatePlayer(state.player);
    SaveManager.updateHighScore(score);
  };

  // 收集金币
  const collectCoins = (amount) => {
    state.player.coins += amount;
    state.stats.totalCoinsCollected += amount;
    state.dailyTasks.find(t => t.id === 'd2').current += amount;

    checkAchievements();
    SaveManager.updatePlayer(state.player);
    SaveManager.addCoins(amount);
  };

  // 解锁关卡
  const unlockLevel = (level) => {
    if (level > state.player.maxLevel) {
      state.player.maxLevel = level;
      SaveManager.unlockLevel(level);
    }

    if (level >= 2) {
      state.dailyTasks.find(t => t.id === 'd4').current = Math.max(
        state.dailyTasks.find(t => t.id === 'd4').current,
        2
      );
    }
  };

  // 领取任务奖励
  const claimTaskReward = (taskId) => {
    const task = state.dailyTasks.find(t => t.id === taskId);
    if (task && !task.claimed && task.current >= task.target) {
      task.claimed = true;

      if (task.reward.coins) {
        state.player.coins += task.reward.coins;
        SaveManager.addCoins(task.reward.coins);
      }
      if (task.reward.diamonds) {
        state.player.diamonds += task.reward.diamonds;
        SaveManager.addDiamonds(task.reward.diamonds);
      }

      SaveManager.updatePlayer(state.player);
    }
  };

  // 检查成就
  const checkAchievements = () => {
    // 初出茅庐
    if (state.player.gamesPlayed >= 1) {
      state.achievements.find(a => a.id === 'a1').current = 1;
    }

    // 分数达人
    state.achievements.find(a => a.id === 'a2').current = state.stats.highScore;

    // 收集控
    state.achievements.find(a => a.id === 'a3').current = state.stats.totalCoinsCollected;
  };

  // 设置无敌模式
  const setGodMode = (enabled) => {
    state.settings.godMode = enabled;
    SaveManager.setGodMode(enabled);
  };

  // 初始化
  checkDailyReset();

  return {
    state,
    dailyTasks: Vue.computed(() => state.dailyTasks),
    achievements: Vue.computed(() => state.achievements),
    player: Vue.computed(() => state.player),
    stats: Vue.computed(() => state.stats),
    settings: Vue.computed(() => state.settings),
    konamiProgress: Vue.computed({
      get: () => state.konamiProgress,
      set: (val) => { state.konamiProgress = val; }
    }),
    addGamePlayed,
    updateScore,
    collectCoins,
    unlockLevel,
    claimTaskReward,
    setGodMode
  };
}

// 导出
window.useGameStore = useGameStore;
