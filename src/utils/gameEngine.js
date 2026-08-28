/**
 * 游戏引擎核心
 * 处理游戏循环、碰撞检测、物理模拟
 */

class GameEngine {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.animationId = null;
    this.lastTime = 0;
    this.deltaTime = 0;

    // 游戏状态
    this.state = {
      running: false,
      paused: false,
      score: 0,
      lives: config.player.initialLives,
      level: 1,
      godMode: false
    };

    // 玩家对象
    this.player = {
      x: canvas.width / 2 - config.player.width / 2,
      y: canvas.height - config.player.height - 20,
      width: config.player.width,
      height: config.player.height,
      speed: config.player.speed,
      isInvincible: false,
      invincibleTimer: 0
    };

    // 游戏对象数组
    this.obstacles = [];
    this.coins = [];
    this.items = [];
    this.particles = [];

    // 输入状态
    this.keys = {};
    this.touchStartX = 0;
    this.isTouching = false;

    // 回调函数
    this.onScoreChange = null;
    this.onLivesChange = null;
    this.onGameOver = null;
    this.onLevelComplete = null;

    // 绑定事件
    this.bindEvents();
  }

  // 绑定输入事件
  bindEvents() {
    // 键盘事件
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchStartX = e.touches[0].clientX;
      this.isTouching = true;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isTouching) {
        const touchX = e.touches[0].clientX;
        const diff = touchX - this.touchStartX;
        this.player.x += diff * 0.5;
        this.touchStartX = touchX;
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.isTouching = false;
    });

    // 鼠标事件（PC端）
    this.canvas.addEventListener('mousemove', (e) => {
      if (e.buttons === 1) {
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = e.clientX - rect.left - this.player.width / 2;
      }
    });
  }

  // 开始游戏
  start(level = 1) {
    this.state.level = level;
    this.state.running = true;
    this.state.paused = false;
    this.state.score = 0;

    // 根据关卡配置调整难度
    const levelConfig = this.config.levels[level - 1] || this.config.levels[0];
    this.currentLevelConfig = levelConfig;

    // 重置玩家位置
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - this.player.height - 20;

    // 清空对象数组
    this.obstacles = [];
    this.coins = [];
    this.items = [];
    this.particles = [];

    // 开始游戏循环
    this.lastTime = performance.now();
    this.gameLoop();
  }

  // 游戏主循环
  gameLoop(currentTime = performance.now()) {
    if (!this.state.running) return;

    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (!this.state.paused) {
      this.update();
    }

    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  // 更新游戏状态
  update() {
    // 更新玩家位置
    this.updatePlayer();

    // 生成障碍物
    this.spawnObstacles();

    // 生成金币
    this.spawnCoins();

    // 生成道具
    this.spawnItems();

    // 更新所有对象
    this.updateObjects();

    // 碰撞检测
    this.checkCollisions();

    // 更新粒子效果
    this.updateParticles();

    // 检查关卡完成
    this.checkLevelComplete();

    // 更新无敌状态
    if (this.player.isInvincible) {
      this.player.invincibleTimer -= this.deltaTime * 1000;
      if (this.player.invincibleTimer <= 0) {
        this.player.isInvincible = false;
      }
    }
  }

  // 更新玩家位置
  updatePlayer() {
    const speed = this.player.speed;

    // 键盘控制
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.player.x -= speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.player.x += speed;
    }

    // 边界检测
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.canvas.width - this.player.width) {
      this.player.x = this.canvas.width - this.player.width;
    }
  }

  // 生成障碍物
  spawnObstacles() {
    if (Math.random() < this.currentLevelConfig.obstacleFrequency) {
      const width = 30 + Math.random() * 40;
      this.obstacles.push({
        x: Math.random() * (this.canvas.width - width),
        y: -width,
        width: width,
        height: width,
        speed: this.currentLevelConfig.obstacleSpeed + Math.random(),
        type: Math.random() > 0.7 ? 'fast' : 'normal'
      });
    }
  }

  // 生成金币
  spawnCoins() {
    if (Math.random() < this.currentLevelConfig.coinFrequency) {
      this.coins.push({
        x: Math.random() * (this.canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        speed: 2 + Math.random(),
        collected: false
      });
    }
  }

  // 生成道具
  spawnItems() {
    if (Math.random() < 0.005) { // 低概率生成道具
      const types = ['magnet', 'shield', 'doubleScore'];
      const type = types[Math.floor(Math.random() * types.length)];

      this.items.push({
        x: Math.random() * (this.canvas.width - 25),
        y: -25,
        width: 25,
        height: 25,
        speed: 2,
        type: type
      });
    }
  }

  // 更新所有对象
  updateObjects() {
    // 更新障碍物
    this.obstacles.forEach(obs => {
      obs.y += obs.speed;
    });
    this.obstacles = this.obstacles.filter(obs => obs.y < this.canvas.height);

    // 更新金币
    this.coins.forEach(coin => {
      coin.y += coin.speed;
    });
    this.coins = this.coins.filter(coin => coin.y < this.canvas.height && !coin.collected);

    // 更新道具
    this.items.forEach(item => {
      item.y += item.speed;
    });
    this.items = this.items.filter(item => item.y < this.canvas.height);
  }

  // 碰撞检测
  checkCollisions() {
    const player = this.player;

    // 检测障碍物碰撞
    this.obstacles.forEach(obs => {
      if (this.isColliding(player, obs)) {
        if (this.state.godMode) {
          // 无敌模式：销毁障碍物
          this.createDestroyEffect(obs.x, obs.y);
          obs.y = this.canvas.height + 100;
          this.state.score += 5;
        } else if (!player.isInvincible) {
          // 正常模式：扣血
          this.playerHit();
        }
      }
    });

    // 检测金币收集
    this.coins.forEach(coin => {
      if (!coin.collected && this.isColliding(player, coin)) {
        coin.collected = true;
        this.state.score += this.config.resources.coinValue;
        this.createCollectEffect(coin.x, coin.y);
        if (this.onScoreChange) this.onScoreChange(this.state.score);
      }
    });

    // 检测道具收集
    this.items.forEach((item, index) => {
      if (this.isColliding(player, item)) {
        this.activateItem(item.type);
        this.items.splice(index, 1);
      }
    });
  }

  // 碰撞检测算法
  isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  // 玩家受伤
  playerHit() {
    this.state.lives--;
    this.player.isInvincible = true;
    this.player.invincibleTimer = this.config.player.invincibleDuration;

    // 创建受伤效果
    this.createHitEffect(this.player.x, this.player.y);

    if (this.onLivesChange) this.onLivesChange(this.state.lives);

    if (this.state.lives <= 0) {
      this.gameOver();
    }
  }

  // 激活道具效果
  activateItem(type) {
    // 道具效果实现
    console.log('获得道具:', type);
  }

  // 游戏结束
  gameOver() {
    this.state.running = false;
    cancelAnimationFrame(this.animationId);

    if (this.onGameOver) {
      this.onGameOver({
        score: this.state.score,
        level: this.state.level,
        coinsCollected: this.coins.filter(c => c.collected).length
      });
    }
  }

  // 检查关卡完成
  checkLevelComplete() {
    if (this.state.score >= this.currentLevelConfig.targetScore) {
      this.state.running = false;
      cancelAnimationFrame(this.animationId);

      if (this.onLevelComplete) {
        this.onLevelComplete({
          score: this.state.score,
          level: this.state.level,
          perfect: this.state.lives === this.config.player.initialLives
        });
      }
    }
  }

  // 创建收集效果
  createCollectEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        color: '#FFD700',
        size: 3
      });
    }
  }

  // 创建受伤效果
  createHitEffect(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + this.player.width / 2,
        y: y + this.player.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color: '#FF4444',
        size: 4
      });
    }
  }

  // 创建销毁效果
  createDestroyEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1,
        color: '#00FF00',
        size: 4
      });
    }
  }

  // 更新粒子
  updateParticles() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.size *= 0.98;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  // 渲染游戏
  render() {
    const ctx = this.ctx;
    const levelConfig = this.currentLevelConfig || this.config.levels[0];

    // 清空画布
    ctx.fillStyle = levelConfig.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制背景网格
    this.drawGrid();

    // 绘制金币
    this.coins.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // 绘制障碍物
    this.obstacles.forEach(obs => {
      ctx.fillStyle = obs.type === 'fast' ? '#FF6B6B' : '#E74C3C';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeStyle = '#C0392B';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });

    // 绘制道具
    this.items.forEach(item => {
      const colors = {
        magnet: '#9B59B6',
        shield: '#3498DB',
        doubleScore: '#E67E22'
      };
      ctx.fillStyle = colors[item.type] || '#95A5A6';
      ctx.fillRect(item.x, item.y, item.width, item.height);
    });

    // 绘制玩家
    this.drawPlayer();

    // 绘制粒子
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 绘制UI
    this.drawUI();
  }

  // 绘制背景网格
  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  // 绘制玩家
  drawPlayer() {
    const ctx = this.ctx;
    const p = this.player;

    // 无敌模式闪光效果
    if (this.state.godMode) {
      ctx.fillStyle = `hsl(${Date.now() % 360}, 100%, 70%)`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FFD700';
    } else if (p.isInvincible) {
      // 受伤无敌闪烁
      ctx.globalAlpha = Math.sin(Date.now() / 50) > 0 ? 1 : 0.3;
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = '#4CAF50';
    }

    // 绘制玩家方块
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // 绘制边框
    ctx.strokeStyle = this.state.godMode ? '#FFD700' : '#388E3C';
    ctx.lineWidth = 3;
    ctx.strokeRect(p.x, p.y, p.width, p.height);

    // 重置
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // 绘制表情
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.state.godMode ? '😎' : '😊', p.x + p.width / 2, p.y + p.height / 2 + 5);
  }

  // 绘制UI
  drawUI() {
    const ctx = this.ctx;

    // 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`分数: ${this.state.score}`, 10, 30);

    // 关卡
    ctx.textAlign = 'center';
    ctx.fillText(`第 ${this.state.level} 关`, this.canvas.width / 2, 30);

    // 生命值
    ctx.textAlign = 'right';
    let hearts = '';
    for (let i = 0; i < this.state.lives; i++) hearts += '❤️';
    ctx.font = '16px Arial';
    ctx.fillText(hearts, this.canvas.width - 10, 30);

    // 目标分数
    ctx.fillStyle = '#FFD700';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`目标: ${this.currentLevelConfig?.targetScore || 100}`, this.canvas.width / 2, 55);

    // 无敌模式标识
    if (this.state.godMode) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('✨ 无敌模式', 10, 55);
    }
  }

  // 暂停游戏
  pause() {
    this.state.paused = true;
  }

  // 恢复游戏
  resume() {
    this.state.paused = false;
  }

  // 停止游戏
  stop() {
    this.state.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  // 设置无敌模式
  setGodMode(enabled) {
    this.state.godMode = enabled;
  }

  // 获取游戏状态
  getState() {
    return { ...this.state };
  }
}

// 导出
window.GameEngine = GameEngine;
