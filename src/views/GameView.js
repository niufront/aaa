/**
 * 游戏主场景组件
 */

const GameView = {
  name: 'GameView',
  template: `
    <div class="game-view">
      <!-- 游戏顶部信息栏 -->
      <div class="game-header">
        <button class="btn-icon" @click="pauseGame">⏸️</button>
        <div class="game-info">
          <span class="score">分数: {{ score }}</span>
          <span class="level">第 {{ level }} 关</span>
        </div>
        <div class="lives">
          <span v-for="i in lives" :key="i" class="heart">❤️</span>
        </div>
      </div>

      <!-- 游戏画布 -->
      <canvas
        ref="gameCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
        class="game-canvas"
        @click="handleCanvasClick"
      ></canvas>

      <!-- 游戏内提示 -->
      <div v-if="showTip" class="game-tip">
        {{ tipText }}
      </div>

      <!-- 暂停弹窗 -->
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-modal">
          <h2>⏸️ 游戏暂停</h2>
          <div class="pause-stats">
            <p>当前分数: {{ score }}</p>
            <p>目标分数: {{ targetScore }}</p>
          </div>
          <div class="pause-buttons">
            <button class="btn btn-primary" @click="resumeGame">▶️ 继续</button>
            <button class="btn btn-secondary" @click="restartGame">🔄 重新开始</button>
            <button class="btn btn-secondary" @click="goHome">🏠 返回首页</button>
          </div>
        </div>
      </div>

      <!-- 移动端控制区域 -->
      <div class="mobile-controls">
        <button class="control-btn left" @touchstart="moveLeft" @touchend="stopMove">◀</button>
        <button class="control-btn right" @touchstart="moveRight" @touchend="stopMove">▶</button>
      </div>
    </div>
  `,

  props: {
    level: {
      type: Number,
      default: 1
    }
  },

  emits: ['game-over', 'game-win', 'pause'],

  setup(props, { emit }) {
    const gameCanvas = Vue.ref(null);
    const score = Vue.ref(0);
    const lives = Vue.ref(3);
    const isPaused = Vue.ref(false);
    const showTip = Vue.ref(false);
    const tipText = Vue.ref('');

    const canvasWidth = 400;
    const canvasHeight = 600;

    let engine = null;
    let moveInterval = null;

    // 获取关卡目标分数
    const targetScore = Vue.computed(() => {
      const config = window.GameConfig || { levels: [{ targetScore: 100 }] };
      const levelConfig = config.levels[props.level - 1] || config.levels[0];
      return levelConfig.targetScore;
    });

    // 初始化游戏引擎
    const initGame = () => {
      const canvas = gameCanvas.value;
      if (!canvas) return;

      const config = window.GameConfig || getDefaultConfig();
      engine = new GameEngine(canvas, config);

      // 设置回调
      engine.onScoreChange = (newScore) => {
        score.value = newScore;
      };

      engine.onLivesChange = (newLives) => {
        lives.value = newLives;
      };

      engine.onGameOver = (result) => {
        emit('game-over', result);
      };

      engine.onLevelComplete = (result) => {
        emit('game-win', result);
      };

      // 检查无敌模式
      const store = useGameStore();
      if (store.settings.value.godMode) {
        engine.setGodMode(true);
      }

      // 开始游戏
      engine.start(props.level);
      score.value = 0;
      lives.value = config.player?.initialLives || 3;

      // 显示关卡提示
      showLevelTip();
    };

    // 显示关卡提示
    const showLevelTip = () => {
      const levelNames = ['新手训练', '速度提升', '障碍密集', '精英挑战', '极限生存'];
      tipText.value = `第 ${props.level} 关: ${levelNames[props.level - 1] || '挑战'}`;
      showTip.value = true;
      setTimeout(() => {
        showTip.value = false;
      }, 2000);
    };

    // 暂停游戏
    const pauseGame = () => {
      if (engine) {
        engine.pause();
        isPaused.value = true;
      }
    };

    // 继续游戏
    const resumeGame = () => {
      if (engine) {
        engine.resume();
        isPaused.value = false;
      }
    };

    // 重新开始
    const restartGame = () => {
      isPaused.value = false;
      if (engine) {
        engine.stop();
      }
      initGame();
    };

    // 返回首页
    const goHome = () => {
      if (engine) {
        engine.stop();
      }
      emit('game-over', { score: score.value, level: props.level, earlyExit: true });
    };

    // 移动端控制
    const moveLeft = () => {
      if (engine) {
        engine.keys['ArrowLeft'] = true;
      }
    };

    const moveRight = () => {
      if (engine) {
        engine.keys['ArrowRight'] = true;
      }
    };

    const stopMove = () => {
      if (engine) {
        engine.keys['ArrowLeft'] = false;
        engine.keys['ArrowRight'] = false;
      }
    };

    // 处理画布点击（用于音效恢复）
    const handleCanvasClick = () => {
      if (window.AudioManager) {
        window.AudioManager.resumeContext();
      }
    };

    // 获取默认配置（如果GameConfig未加载）
    const getDefaultConfig = () => ({
      canvasWidth: 400,
      canvasHeight: 600,
      player: { width: 40, height: 40, speed: 5, initialLives: 3, invincibleDuration: 2000 },
      levels: [
        { id: 1, name: '新手训练', targetScore: 100, obstacleSpeed: 2, obstacleFrequency: 0.02, coinFrequency: 0.03, background: '#87CEEB' },
        { id: 2, name: '速度提升', targetScore: 250, obstacleSpeed: 3, obstacleFrequency: 0.025, coinFrequency: 0.025, background: '#98D8E8' },
        { id: 3, name: '障碍密集', targetScore: 500, obstacleSpeed: 3.5, obstacleFrequency: 0.035, coinFrequency: 0.02, background: '#7EC8E3' },
        { id: 4, name: '精英挑战', targetScore: 800, obstacleSpeed: 4, obstacleFrequency: 0.04, coinFrequency: 0.02, background: '#5DADE2' },
        { id: 5, name: '极限生存', targetScore: 1200, obstacleSpeed: 5, obstacleFrequency: 0.05, coinFrequency: 0.015, background: '#3498DB' }
      ],
      resources: { coinValue: 10 }
    });

    // 组件挂载后初始化游戏
    Vue.onMounted(() => {
      initGame();
    });

    // 组件卸载时停止游戏
    Vue.onUnmounted(() => {
      if (engine) {
        engine.stop();
      }
    });

    return {
      gameCanvas,
      score,
      lives,
      isPaused,
      showTip,
      tipText,
      canvasWidth,
      canvasHeight,
      targetScore,
      pauseGame,
      resumeGame,
      restartGame,
      goHome,
      moveLeft,
      moveRight,
      stopMove,
      handleCanvasClick
    };
  }
};

window.GameView = GameView;
