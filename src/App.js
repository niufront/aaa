/**
 * 主应用组件
 * 管理页面路由和全局状态
 */

const App = {
  name: 'App',
  template: `
    <div class="app-container" @click="handleGlobalClick" @keydown="handleKeydown">
      <!-- 首页 -->
      <HomeView
        v-if="currentPage === 'home'"
        @start-game="startGame"
        @show-tasks="showTasks"
        @show-shop="showShop"
        @show-settings="showSettings"
      />

      <!-- 游戏页 -->
      <GameView
        v-if="currentPage === 'game'"
        :level="currentLevel"
        @game-over="handleGameOver"
        @game-win="handleGameWin"
        @pause="handlePause"
      />

      <!-- 结算页 -->
      <ResultView
        v-if="currentPage === 'result'"
        :result="gameResult"
        @restart="restartGame"
        @go-home="goHome"
        @next-level="nextLevel"
      />

      <!-- 任务弹窗 -->
      <Modal v-if="showTaskModal" @close="showTaskModal = false">
        <TaskCard :tasks="dailyTasks" @claim="claimTaskReward" />
      </Modal>

      <!-- 设置弹窗 -->
      <Modal v-if="showSettingsModal" @close="showSettingsModal = false">
        <div class="settings-panel">
          <h2>⚙️ 设置</h2>
          <div class="setting-item">
            <span>背景音乐</span>
            <button @click="toggleBgm" :class="{ active: bgmEnabled }">
              {{ bgmEnabled ? '开启' : '关闭' }}
            </button>
          </div>
          <div class="setting-item">
            <span>音效</span>
            <button @click="toggleSfx" :class="{ active: sfxEnabled }">
              {{ sfxEnabled ? '开启' : '关闭' }}
            </button>
          </div>
          <div class="setting-item">
            <span>当前版本</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </Modal>

      <!-- 无敌模式提示（隐藏） -->
      <div v-if="godModeHint" class="god-mode-hint">
        ✨ 已激活无敌模式 ✨
      </div>
    </div>
  `,

  setup() {
    const store = useGameStore();
    const currentPage = Vue.ref('home');
    const currentLevel = Vue.ref(1);
    const gameResult = Vue.ref(null);
    const showTaskModal = Vue.ref(false);
    const showSettingsModal = Vue.ref(false);
    const bgmEnabled = Vue.ref(true);
    const sfxEnabled = Vue.ref(true);
    const godModeHint = Vue.ref(false);

    // 隐藏的无敌模式追踪
    const clickHistory = Vue.ref([]);
    const secretSequence = [7, 7, 3, 3]; // 点击模式：左上x7, 右上x7, 左下x3, 右下x3

    // 全局点击处理 - 用于检测无敌模式触发
    const handleGlobalClick = (event) => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const x = event.clientX;
      const y = event.clientY;

      // 判断点击区域（屏幕分为4个象限）
      let quadrant;
      if (x < screenW / 2 && y < screenH / 2) quadrant = 1; // 左上
      else if (x >= screenW / 2 && y < screenH / 2) quadrant = 2; // 右上
      else if (x < screenW / 2 && y >= screenH / 2) quadrant = 3; // 左下
      else quadrant = 4; // 右下

      clickHistory.value.push({
        quadrant,
        time: Date.now()
      });

      // 只保留最近的20次点击
      if (clickHistory.value.length > 20) {
        clickHistory.value = clickHistory.value.slice(-20);
      }

      // 检测是否触发无敌模式
      checkGodMode();
    };

    // 检测无敌模式
    const checkGodMode = () => {
      const clicks = clickHistory.value;
      if (clicks.length < 20) return;

      // 检查最近20次点击的模式
      const recentClicks = clicks.slice(-20);
      const quadrantCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

      recentClicks.forEach(click => {
        quadrantCounts[click.quadrant]++;
      });

      // 检查是否符合隐藏模式（左上7次, 右上7次, 左下3次, 右下3次）
      if (quadrantCounts[1] === 7 && quadrantCounts[2] === 7 &&
          quadrantCounts[3] === 3 && quadrantCounts[4] === 3) {
        activateGodMode();
      }
    };

    // 激活无敌模式
    const activateGodMode = () => {
      store.setGodMode(true);
      godModeHint.value = true;
      clickHistory.value = []; // 重置点击历史

      // 3秒后隐藏提示
      setTimeout(() => {
        godModeHint.value = false;
      }, 3000);

      console.log('🎮 无敌模式已激活！（这是一个隐藏功能）');
    };

    // 键盘事件处理 - 用于另一种触发方式
    const handleKeydown = (event) => {
      // Konami Code: ↑↑↓↓←→←→BA
      const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                          'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                          'KeyB', 'KeyA'];

      if (!store.konamiProgress) {
        store.konamiProgress = 0;
      }

      if (event.code === konamiCode[store.konamiProgress]) {
        store.konamiProgress++;
        if (store.konamiProgress === konamiCode.length) {
          activateGodMode();
          store.konamiProgress = 0;
        }
      } else {
        store.konamiProgress = 0;
      }
    };

    // 开始游戏
    const startGame = (level) => {
      currentLevel.value = level || 1;
      currentPage.value = 'game';
    };

    // 游戏结束
    const handleGameOver = (result) => {
      gameResult.value = { ...result, isWin: false };
      currentPage.value = 'result';
      store.addGamePlayed();
    };

    // 游戏胜利
    const handleGameWin = (result) => {
      gameResult.value = { ...result, isWin: true };
      currentPage.value = 'result';
      store.addGamePlayed();
      store.unlockLevel(currentLevel.value + 1);
    };

    // 暂停
    const handlePause = () => {
      // 暂停逻辑在 GameView 内部处理
    };

    // 重新开始
    const restartGame = () => {
      currentPage.value = 'game';
    };

    // 下一关
    const nextLevel = () => {
      currentLevel.value++;
      currentPage.value = 'game';
    };

    // 返回首页
    const goHome = () => {
      currentPage.value = 'home';
    };

    // 显示任务
    const showTasks = () => {
      showTaskModal.value = true;
    };

    // 显示设置
    const showSettings = () => {
      showSettingsModal.value = true;
    };

    // 领取任务奖励
    const claimTaskReward = (taskId) => {
      store.claimTaskReward(taskId);
    };

    // 切换音乐
    const toggleBgm = () => {
      bgmEnabled.value = !bgmEnabled.value;
      AudioManager.toggleBgm(bgmEnabled.value);
    };

    // 切换音效
    const toggleSfx = () => {
      sfxEnabled.value = !sfxEnabled.value;
      AudioManager.toggleSfx(sfxEnabled.value);
    };

    return {
      currentPage,
      currentLevel,
      gameResult,
      showTaskModal,
      showSettingsModal,
      bgmEnabled,
      sfxEnabled,
      godModeHint,
      dailyTasks: Vue.computed(() => store.dailyTasks),
      handleGlobalClick,
      handleKeydown,
      startGame,
      handleGameOver,
      handleGameWin,
      handlePause,
      restartGame,
      nextLevel,
      goHome,
      showTasks,
      showSettings,
      claimTaskReward,
      toggleBgm,
      toggleSfx
    };
  }
};
