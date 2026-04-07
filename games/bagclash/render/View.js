/**
 * 视图组件基类
 * 负责管理游戏UI元素的显示和交互
 */
class BagclashView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.elements = {};
        this.visible = true;
    }

    /**
     * 初始化视图
     * @param {Object} game - 游戏逻辑实例
     */
    init(game) {
        this.game = game;
        this.cacheElements();
        this.bindEvents();
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        // 缓存常用的DOM元素
        this.elements = {
            score: document.getElementById('score'),
            turn: document.getElementById('turn'),
            newBtn: document.getElementById('new-game-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resumeBtn: document.getElementById('resume-btn'),
            helpBtn: document.getElementById('help-btn')
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新游戏按钮
        if (this.elements.newBtn) {
            this.elements.newBtn.addEventListener('click', () => {
                this.emit('newGame');
            });
        }

        // 暂停按钮
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => {
                this.emit('pause');
            });
        }

        // 恢复按钮
        if (this.elements.resumeBtn) {
            this.elements.resumeBtn.addEventListener('click', () => {
                this.emit('resume');
            });
        }

        // 帮助按钮
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }
    }

    /**
     * 更新视图
     * @param {Object} game - 游戏逻辑实例
     */
    update(game) {
        this.game = game;
        this.updateScore();
        this.updateTurn();
    }

    /**
     * 更新分数显示
     */
    updateScore() {
        if (this.elements.score && this.game && this.game.player) {
            this.elements.score.textContent = this.game.player.score;
        }
    }

    /**
     * 更新回合显示
     */
    updateTurn() {
        if (this.elements.turn && this.game) {
            this.elements.turn.textContent = `${this.game.turn}/${this.game.maxTurns}`;
        }
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        const helpText = `
            🎒 背包乱斗 - 游戏帮助
            
            📖 玩法说明：
            1. 每回合获得一个随机物品
            2. 将物品放置到背包的空闲格子中
            3. 如果格子已有物品，则发生乱斗
            4. 战斗力高的物品获胜并保留
            5. 目标是获得最高分数
            
            ⚡ 战斗力计算：
            战斗力 = 攻击力 × 1.2 + 防御力 × 0.8 + 基础分数
            
            🎯 策略技巧：
            - 优先放置高战斗力物品
            - 合理利用乱斗机制
            - 注意观察物品属性
        `;

        alert(helpText.replace(/\n/g, '\n'));
    }

    /**
     * 显示游戏结束对话框
     * @param {Object} result - 游戏结果
     */
    showGameOver(result) {
        const message = `
            🎮 游戏结束！
            
            💰 最终分数: ${result.score}
            🎯 总回合数: ${result.turns}
            
            ${result.isNewRecord ? '🏆 恭喜！创造了新纪录！' : ''}
            
            想要再来一局吗？
        `;

        if (confirm(message.replace(/\n/g, '\n'))) {
            this.emit('newGame');
        } else {
            // 返回游戏列表
            const returnPath = localStorage.getItem('minigame-return-path') || '/minigame';
            location.href = returnPath;
        }
    }

    /**
     * 显示乱斗结果
     * @param {Object} clashData - 乱斗数据
     */
    showClashResult(clashData) {
        const {winner, loser, battleLog} = clashData;
        
        if (!winner || !loser) {
            this.showToast('乱斗平局！', 'info');
            return;
        }

        const message = `
            ⚔️ 乱斗结果！
            
            🏆 胜者: ${winner.type}物品
            ⚡ 战斗力: ${Math.round(winner.getPower())}
            ❤️ 剩余生命: ${Math.round(winner.health)}
            
            💔 败者: ${loser.type}物品
            ⚡ 战斗力: ${Math.round(loser.getPower())}
            💀 已被击败
            
            📊 战斗回合: ${battleLog.length}
        `;

        this.showToast(`${winner.type} 胜利！`, 'success');
    }

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     * @param {number} duration - 显示时长
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        if (this.container) {
            this.container.appendChild(toast);
        } else {
            document.body.appendChild(toast);
        }

        // 添加显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    /**
     * 暂停游戏时禁用按钮
     */
    onPause() {
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.style.display = 'none';
        }
        if (this.elements.resumeBtn) {
            this.elements.resumeBtn.style.display = 'block';
        }
    }

    /**
     * 恢复游戏时启用按钮
     */
    onResume() {
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.style.display = 'block';
        }
        if (this.elements.resumeBtn) {
            this.elements.resumeBtn.style.display = 'none';
        }
    }

    /**
     * 游戏开始时重置按钮状态
     */
    onGameStart() {
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.style.display = 'block';
        }
        if (this.elements.resumeBtn) {
            this.elements.resumeBtn.style.display = 'none';
        }
    }

    /**
     * 注册事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} callback - 回调函数
     */
    on(eventType, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(callback);
    }

    /**
     * 触发事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    emit(eventType, data = {}) {
        if (!this.eventListeners || !this.eventListeners[eventType]) return;

        this.eventListeners[eventType].forEach(callback => {
            callback(data);
        });
    }

    /**
     * 显示视图
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
        this.visible = true;
    }

    /**
     * 隐藏视图
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        this.visible = false;
    }

    /**
     * 销毁视图
     */
    destroy() {
        // 移除事件监听器
        if (this.elements.newBtn) {
            this.elements.newBtn.removeEventListener('click');
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.removeEventListener('click');
        }
        if (this.elements.resumeBtn) {
            this.elements.resumeBtn.removeEventListener('click');
        }
        if (this.elements.helpBtn) {
            this.elements.helpBtn.removeEventListener('click');
        }

        this.elements = {};
        this.eventListeners = {};
        this.visible = false;
        this.game = null;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BagclashView;
}
