/**
 * 任务卡片组件
 */

const TaskCard = {
  name: 'TaskCard',
  template: `
    <div class="task-card">
      <h2 class="task-title">📋 每日任务</h2>
      <p class="task-subtitle">完成任务获得丰厚奖励</p>

      <div class="task-list">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-item"
          :class="{
            completed: task.current >= task.target,
            claimed: task.claimed
          }"
        >
          <div class="task-info">
            <span class="task-name">{{ task.name }}</span>
            <div class="task-progress-bar">
              <div
                class="progress-fill"
                :style="{ width: getProgress(task) + '%' }"
              ></div>
            </div>
            <span class="task-progress-text">
              {{ task.current }} / {{ task.target }}
            </span>
          </div>

          <div class="task-reward">
            <span v-if="task.reward.coins" class="reward-item">
              💰 {{ task.reward.coins }}
            </span>
            <span v-if="task.reward.diamonds" class="reward-item">
              💎 {{ task.reward.diamonds }}
            </span>
          </div>

          <button
            class="btn btn-small"
            :class="{
              'btn-success': task.current >= task.target && !task.claimed,
              'btn-disabled': task.claimed || task.current < task.target
            }"
            @click="claimReward(task)"
            :disabled="task.claimed || task.current < task.target"
          >
            {{ task.claimed ? '已领取' : (task.current >= task.target ? '领取' : '未完成') }}
          </button>
        </div>
      </div>

      <div class="task-tip">
        <p>💡 每日任务每天0点重置</p>
      </div>
    </div>
  `,

  props: {
    tasks: {
      type: Array,
      default: () => []
    }
  },

  emits: ['claim'],

  setup(props, { emit }) {
    const getProgress = (task) => {
      return Math.min(100, (task.current / task.target) * 100);
    };

    const claimReward = (task) => {
      if (task.current >= task.target && !task.claimed) {
        emit('claim', task.id);
      }
    };

    return {
      getProgress,
      claimReward
    };
  }
};

window.TaskCard = TaskCard;
