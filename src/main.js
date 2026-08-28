/**
 * Vue 应用入口
 */

const { createApp } = Vue;

// 创建并挂载应用
const app = createApp(App);

// 挂载到 DOM
app.mount('#app');

console.log('🎮 游戏应用已启动');
