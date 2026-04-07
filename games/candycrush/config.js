/**
 * 糖果消消乐游戏配置
 */
const CandyCrushConfig = {
    // 游戏设置
    game: {
        name: '糖果消消乐',
        version: '1.0.0',
        gridSize: {width: 15, height: 15},  // 15x15网格
        candyTypes: 5,                         // 5种糖果
        minMatch: 3,                            // 最小匹配数
    },

    // 糖果配置
    candy: {
        types: ['red', 'orange', 'yellow', 'green', 'blue'],
        names: {
            red: '草莓糖',
            orange: '橘子糖',
            yellow: '柠檬糖',
            green: '青柠糖',
            blue: '蓝莓糖'
        },
        emojis: {
            red: '🍓',
            orange: '🍊',
            yellow: '🍋',
            green: '🍏',
            blue: '🫐'
        },
        colors: {
            red: '#ff6b6b',
            orange: '#ffa502',
            yellow: '#ffd32a',
            green: '#26de81',
            blue: '#45aaf2'
        }
    },

    // 渲染配置
    render: {
        canvas: {
            leftWidth: 600,      // 左侧游戏区域宽度
            rightWidth: 300,     // 右侧信息区域宽度
            totalHeight: 600
        },
        cell: {
            size: 40,            // 每个格子大小
            padding: 2,           // 格子间距
            borderRadius: 8
        },
        colors: {
            background: '#2c3e50',
            grid: '#34495e',
            gridLine: '#3d566e',
            empty: '#2c3e50'
        }
    },

    // 分数配置
    score: {
        match3: 30,     // 3个：30分
        match4: 60,     // 4个：60分
        match5: 120,    // 5个及以上：120分
        bonus: 10       // 连消每次额外10分
    },

    // 动画配置
    animation: {
        match: {
            duration: 500,
            color: 'rgba(255, 215, 0, 0.5)'
        },
        fall: {
            duration: 300,
            color: 'rgba(255, 255, 255, 0.3)'
        },
        spawn: {
            duration: 400,
            color: 'rgba(255, 255, 255, 0.5)'
        }
    },

    // UI配置
    ui: {
        messages: {
            welcome: '欢迎来到糖果消消乐！',
            gameOver: '游戏结束！',
            newRecord: '新纪录！',
            match: '消除成功！',
            combo: '连消！'
        },
        buttons: {
            newGame: '🎮 新游戏',
            pause: '⏸️ 暂停',
            resume: '▶️ 继续',
            help: '❓ 帮助',
            back: '🔙 返回'
        }
    },

    // 背包配置
    backpack: {
        width: 4,     // 4列
        height: 7,    // 7行（竖向排列）
        cellSize: 50  // 格子大小（缩小以适应更多格子）
    },

    // 驱具配置
    items: {
        // 单格道具
        single: {
            id: 'single',
            name: '单格道具',
            emoji: '⭐',
            color: '#ffd700',
            shape: [{x: 0, y: 0}],
            effect: 'random_clear',
            description: '清除一个随机糖果'
        },

        // 横向2格
        horizontal2: {
            id: 'horizontal2',
            name: '横向炸弹',
            emoji: '💣',
            color: '#ff4757',
            shape: [{x: 0, y: 0}, {x: 1, y: 0}],
            effect: 'horizontal_clear',
            description: '消除一行'
        },

        // 纵向2格
        vertical2: {
            id: 'vertical2',
            name: '纵向炸弹',
            emoji: '🧨',
            color: '#ffa502',
            shape: [{x: 0, y: 0}, {x: 0, y: 1}],
            effect: 'vertical_clear',
            description: '消除一列'
        },

        // L形道具
        lShape: {
            id: 'lShape',
            name: 'L形道具',
            emoji: '🔱',
            color: '#3742fa',
            shape: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
            effect: 'l_clear',
            description: '消除L形区域'
        },

        // T形道具
        tShape: {
            id: 'tShape',
            name: 'T形道具',
            emoji: '⚡',
            color: '#2ed573',
            shape: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 1, y: 1}],
            effect: 't_clear',
            description: '消除T形区域'
        },

        // 2x2方块
        square2: {
            id: 'square2',
            name: '双倍方块',
            emoji: '💎',
            color: '#1e90ff',
            shape: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
            effect: 'area_clear',
            description: '清除2x2区域'
        },

        // 十字形道具
        crossShape: {
            id: 'crossShape',
            name: '十字炸弹',
            emoji: '🎯',
            color: '#ff6b81',
            shape: [{x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}],
            effect: 'cross_clear',
            description: '清除十字区域'
        }
    }
};

// 导出配置
if (typeof CandyCrushConfig !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = CandyCrushConfig;
}
