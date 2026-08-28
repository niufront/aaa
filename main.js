/**
 * Node.js 入口文件
 * 启动本地开发服务器，提供静态文件服务和存档API
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const GameConfig = require('./config');

const app = express();
const PORT = 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// 确保存档目录存在
const saveDir = path.join(__dirname, 'save_data');
if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

// ========== 存档 API ==========

// 保存游戏数据
app.post('/api/save', (req, res) => {
  try {
    const { userId, data } = req.body;
    const filename = `save_${userId || 'default'}.json`;
    const filepath = path.join(saveDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, message: '存档成功' });
  } catch (error) {
    console.error('存档失败:', error);
    res.status(500).json({ success: false, message: '存档失败' });
  }
});

// 读取游戏数据
app.get('/api/save/:userId?', (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const filename = `save_${userId}.json`;
    const filepath = path.join(saveDir, filename);

    if (fs.existsSync(filepath)) {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      res.json({ success: true, data });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error('读取存档失败:', error);
    res.status(500).json({ success: false, message: '读取存档失败' });
  }
});

// 获取排行榜（本地模拟）
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = [
    { rank: 1, name: '玩家A', score: 5000 },
    { rank: 2, name: '玩家B', score: 4200 },
    { rank: 3, name: '玩家C', score: 3800 },
    { rank: 4, name: '玩家D', score: 3100 },
    { rank: 5, name: '玩家E', score: 2500 }
  ];
  res.json({ success: true, data: leaderboard });
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║                                                  ║');
  console.log('║   🎮 躲避跑酷 - 网页游戏服务器已启动             ║');
  console.log('║                                                  ║');
  console.log(`║   访问地址: http://localhost:${PORT}               ║`);
  console.log('║                                                  ║');
  console.log('║   按 Ctrl+C 停止服务器                           ║');
  console.log('║                                                  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
