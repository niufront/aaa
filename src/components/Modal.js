/**
 * 通用弹窗组件
 */

const Modal = {
  name: 'Modal',
  template: `
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content" :class="size">
        <button class="modal-close" @click="$emit('close')">✕</button>
        <slot></slot>
      </div>
    </div>
  `,
  props: {
    size: {
      type: String,
      default: 'medium' // small, medium, large
    }
  },
  emits: ['close']
};

window.Modal = Modal;
