/**
 * 结算页面组件
 */

const ResultView = {
  name: 'ResultView',
  template: `
    <div class="result-view">
      <!-- 结果标题 -->
      <div class="result-header" :class="{ win: result.isWin }">
        <h1>{{ result.isWin ? '🎉 恭喜通关！' : '💀 游戏结束' }}</h1>
        <p class="result-subtitle">
          {{ result.isWin ? '你成功完成了挑战！' : '再接再厉，下次一定能行！' }}
        </p>
      </div>

      <!-- 结果统计 -->
      <div class="result-stats">
        <div class="stat-item">
          <span class="stat-icon">🏆</span>
          <span class="stat-label">最终得分</span>
          <span class="stat-value">{{ result.score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <span class="stat-label">关卡</span>
          <span class="stat-value">第 {{ result.level }} 关</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">💰</span>
          <span class="stat-label">收集金币</span>
          <span class="stat-value">{{ coinsEarned }}</span>
        </div>
        <div class="stat-item" v-if="isNewRecord">
          <span class="stat-icon">🌟</span>
          <span class="stat-label">新纪录！</span>
          <span class="stat-value highlight">超越历史最高</span>
        </div>
      </div>

      <!-- 奖励预览 -->
      <div class="reward-section">
        <h3>🎁 获得奖励</h3>
        <div class="reward-list">
          <div class="reward-item">
            <span class="reward-icon">💰</span>
            <span class="reward-amount">+{{ coinsEarned }}</span>
          </div>
          <div class="reward-item" v-if="result.isWin">
            <span class="reward-icon">💎</span>
            <span class="reward-amount">+{{ diamondsEarned }}</span>
          </div>
        </div>
      </div>

      <!-- 任务进度更新 -->
      <div class="task-update">
        <h3>📋 任务进度</h3>
        <div class="task-list">
          <div
            v-for="task in updatedTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <span class="task-name">{{ task.name }}</span>
            <span class="task-progress">{{ task.current }}/{{ task.target }}</span>
            <span v-if="task.completed" class="task-check">✅</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="result-buttons">
        <button class="btn btn-primary btn-large" @click="$emit('restart')">
          🔄 再来一局
        </button>
        <button
          v-if="result.isWin"
          class="btn btn-success btn-large"
          @click="$emit('next-level')"
        >
          ➡️ 下一关
        </button>
        <button class="btn btn-secondary" @click="$emit('go-home')">
          🏠 返回首页
        </button>
      </div>

      <!-- 分享按钮 -->
      <div class="share-section">
        <p>分享成绩给好友</p>
        <div class="share-buttons">
          <button class="btn-share" @click="copyResult">
            📋 复制成绩
          </button>
        </div>
      </div>
    </div>
  `,

  props: {
    result: {
      type: Object,
      required: true,
      default: () => ({
        score: 0,
        level: 1,
        isWin: false,
        coinsCollected: 0
      })
    }
  },

  emits: ['restart', 'go-home', 'next-level'],

  setup(props) {
    const store = useGameStore();

    // 计算奖励
    const coinsEarned = Vue.computed(() => {
      const base = props.result.coinsCollected || 0;
      const bonus = props.result.isWin ? 50 : 10;
      return base + bonus;
    });

    const diamondsEarned = Vue.computed(() => {
      return props.result.isWin ? props.result.level * 5 : 0;
    });

    // 是否新纪录
    const isNewRecord = Vue.computed(() => {
      return props.result.score > (store.stats.value.highScore || 0);
    });

    // 更新任务进度
    const updatedTasks = Vue.computed(() => {
      return store.dailyTasks.value.map(task => ({
        ...task,
        completed: task.current >= task.target
      }));
    });

    // 更新数据
    Vue.onMounted(() => {
      // 更新分数
      store.updateScore(props.result.score);

      // 收集金币
      store.collectCoins(coinsEarned.value);

      // 如果通关，解锁下一关
      if (props.result.isWin) {
        store.unlockLevel(props.result.level + 1);
      }

      // 更新成就：不死传说
      if (props.result.isWin && props.result.lives === 3) {
        // 完美通关
      }
    });

    // 复制成绩
    const copyResult = () => {
      const text = `🎮 躲避跑酷 - 第${props.result.level}关\n` +
                   `🏆 得分: ${props.result.score}\n` +
                   `${props.result.isWin ? '✅ 通关成功！' : '❌ 挑战失败'}\n` +
                   `来挑战我吧！`;

      navigator.clipboard?.writeText(text).then(() => {
        alert('成绩已复制到剪贴板！');
      }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('成绩已复制到剪贴板！');
      });
    };

    return {
      coinsEarned,
      diamondsEarned,
      isNewRecord,
      updatedTasks,
      copyResult
    };
  }
};

window.ResultView = ResultView;
