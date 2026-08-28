/**
 * 游戏画布组件
 * 纯展示组件，游戏逻辑在 GameView 中处理
 */

const GameCanvas = {
  name: 'GameCanvas',
  template: `
    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      class="game-canvas"
    ></canvas>
  `,
  props: {
    width: { type: Number, default: 400 },
    height: { type: Number, default: 600 }
  },
  setup(props) {
    const canvas = Vue.ref(null);

    Vue.onMounted(() => {
      // 画布初始化逻辑
    });

    return { canvas };
  }
};

window.GameCanvas = GameCanvas;
