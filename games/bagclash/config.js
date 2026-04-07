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
        match3: 10,
        match4: 20,
        match5: 50,
        bonus: 10
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
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CandyCrushConfig;
}
