/**
 * 首页组件
 */

const HomeView = {
  name: 'HomeView',
  template: `
    <div class="home-view">
      <!-- 背景装饰 -->
      <div class="home-bg">
        <div class="floating-shape" v-for="i in 6" :key="i" :style="getShapeStyle(i)"></div>
      </div>

      <!-- 标题区域 -->
      <div class="home-header">
        <h1 class="game-title">
          <span class="title-icon">🎮</span>
          <span>躲避跑酷</span>
        </h1>
        <p class="game-subtitle">经典躲避 · 休闲闯关</p>
      </div>

      <!-- 玩家信息 -->
      <div class="player-info-card">
        <div class="info-row">
          <span class="info-label">💰 金币</span>
          <span class="info-value">{{ player.coins }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">💎 钻石</span>
          <span class="info-value">{{ player.diamonds }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🏆 最高分</span>
          <span class="info-value">{{ stats.highScore }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🎯 已通关</span>
          <span class="info-value">第 {{ player.maxLevel }} 关</span>
        </div>
      </div>

      <!-- 关卡选择 -->
      <div class="level-section">
        <h2 class="section-title">🗺️ 选择关卡</h2>
        <div class="level-grid">
          <button
            v-for="level in 5"
            :key="level"
            class="level-btn"
            :class="{
              'locked': level > player.maxLevel,
              'current': level === player.maxLevel,
              'completed': level < player.maxLevel
            }"
            @click="selectLevel(level)"
            :disabled="level > player.maxLevel"
          >
            <span class="level-number">{{ level }}</span>
            <span class="level-name">{{ getLevelName(level) }}</span>
            <span v-if="level < player.maxLevel" class="level-stars">⭐⭐⭐</span>
            <span v-else-if="level === player.maxLevel" class="level-badge">当前</span>
            <span v-else class="level-lock">🔒</span>
          </button>
        </div>
      </div>

      <!-- 功能按钮 -->
      <div class="action-buttons">
        <button class="btn btn-primary btn-large" @click="startGame">
          🎮 开始游戏
        </button>
        <div class="btn-row">
          <button class="btn btn-secondary" @click="$emit('show-tasks')">
            📋 每日任务
          </button>
          <button class="btn btn-secondary" @click="$emit('show-settings')">
            ⚙️ 设置
          </button>
        </div>
      </div>

      <!-- 每日任务预览 -->
      <div class="task-preview">
        <h3>📋 今日任务</h3>
        <div class="task-list-mini">
          <div
            v-for="task in dailyTasks.slice(0, 3)"
            :key="task.id"
            class="task-item-mini"
            :class="{ completed: task.current >= task.target }"
          >
            <span class="task-name">{{ task.name }}</span>
            <span class="task-progress">{{ task.current }}/{{ task.target }}</span>
          </div>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="version-info">
        v1.0.0 | 按 ↑↑↓↓←→←→BA 解锁隐藏内容
      </div>
    </div>
  `,

  props: {},

  emits: ['start-game', 'show-tasks', 'show-shop', 'show-settings'],

  setup(props, { emit }) {
    const store = useGameStore();

    const player = Vue.computed(() => store.player.value);
    const stats = Vue.computed(() => store.stats.value);
    const dailyTasks = Vue.computed(() => store.dailyTasks.value);

    const levelNames = {
      1: '新手训练',
      2: '速度提升',
      3: '障碍密集',
      4: '精英挑战',
      5: '极限生存'
    };

    const getLevelName = (level) => levelNames[level] || `关卡 ${level}`;

    const getShapeStyle = (index) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      return {
        background: colors[index - 1],
        left: `${(index * 15) % 80}%`,
        top: `${(index * 20) % 70}%`,
        animationDelay: `${index * 0.5}s`
      };
    };

    const selectLevel = (level) => {
      if (level <= player.value.maxLevel) {
        emit('start-game', level);
      }
    };

    const startGame = () => {
      emit('start-game', player.value.maxLevel);
    };

    return {
      player,
      stats,
      dailyTasks,
      getLevelName,
      getShapeStyle,
      selectLevel,
      startGame
    };
  }
};

window.HomeView = HomeView;
