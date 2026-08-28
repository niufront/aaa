/**
 * 游戏UI组件
 * 显示分数、生命值、关卡信息等
 */

const GameUI = {
  name: 'GameUI',
  template: `
    <div class="game-ui">
      <div class="ui-left">
        <div class="score-display">
          <span class="score-label">分数</span>
          <span class="score-value">{{ score }}</span>
        </div>
      </div>
      <div class="ui-center">
        <div class="level-display">
          第 {{ level }} 关
        </div>
        <div class="target-display" v-if="targetScore">
          目标: {{ targetScore }}
        </div>
      </div>
      <div class="ui-right">
        <div class="lives-display">
          <span v-for="i in lives" :key="i" class="heart-icon">❤️</span>
          <span v-for="i in (maxLives - lives)" :key="'empty-' + i" class="heart-icon empty">🖤</span>
        </div>
      </div>
    </div>
  `,
  props: {
    score: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lives: { type: Number, default: 3 },
    maxLives: { type: Number, default: 3 },
    targetScore: { type: Number, default: 0 }
  }
};

window.GameUI = GameUI;
