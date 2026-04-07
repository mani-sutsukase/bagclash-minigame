# Bagclash Minigame

背包消消乐小游戏 - 一个策略放置游戏

## 项目简介

背包消消乐是一款基于HTML5 Canvas的策略放置游戏。玩家需要在有限的背包空间内放置各种物品，利用物品的特性进行冲突乱斗。

## 游戏特色

- 🎮 **策略性强**: 空间约束是策略的核心来源
- 🎨 **清晰的逻辑层和表现层分离**: 易于扩展和维护
- 🌐 **纯前端实现**: 基于HTML5 Canvas和原生JavaScript
- 📱 **响应式设计**: 适配不同屏幕尺寸

## 项目结构

```
bagclash-minigame/
├── common/              # 公共组件
│   ├── GameEngine.js   # 游戏引擎基类
│   ├── UIController.js # UI控制器基类
│   └── styles.css      # 公共样式
├── games/              # 游戏列表
│   ├── bagclash/       # 背包乱斗游戏
│   │   ├── logic/      # 逻辑层
│   │   │   └── Game.js
│   │   ├── render/     # 表现层
│   │   │   ├── Renderer.js
│   │   │   ├── View.js
│   │   │   └── Animator.js
│   │   ├── config.js   # 游戏配置
│   │   └── index.html # 游戏页面
│   └── candycrush/     # 糖果消消乐游戏
│       ├── logic/      # 逻辑层
│       │   ├── Game.js
│       │   └── Item.js
│       └── render/     # 表现层
│           └── Renderer.js
└── games.json          # 游戏列表配置
```

## 快速开始

### 本地运行

1. 克隆项目
```bash
git clone https://github.com/mani-sutsukase/bagclash-minigame.git
cd bagclash-minigame
```

2. 打开游戏页面
```bash
# 使用任何HTTP服务器
python -m http.server 8000

# 或使用其他服务器
npx http-server -p 8000
```

3. 访问
```
http://localhost:8000/games/bagclash/index.html
```

### 部署到生产环境

本项目已集成到OpenClaw WebPortal，访问地址：
```
http://your-domain/minigame
```

## 开发指南

### 游戏架构

项目采用清晰的分层架构：

- **逻辑层**: 处理游戏规则、状态管理、碰撞检测
- **表现层**: 负责渲染、动画、用户交互
- **公共层**: 提供游戏引擎和UI控制器基类

### 添加新游戏

1. 在 `games/` 目录下创建新游戏目录
2. 实现逻辑层（继承游戏基类）
3. 实现表现层（继承渲染器、视图、动画器）
4. 在 `games.json` 中添加游戏配置
5. 在WebPortal中注册路由

## 技术栈

- **HTML5**: Canvas绘图
- **JavaScript (ES6+)**: 游戏逻辑
- **CSS3**: 样式和动画
- **无框架依赖**: 纯原生实现

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 作者

开发者: 程序员 (mani-sutsukase)
项目总指挥: 龙总工

---

**Enjoy the game! 🎮**
