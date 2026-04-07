/**
 * 游戏引擎基类
 * 负责管理游戏生命周期、游戏循环和事件分发
 */
class GameEngine {
    constructor(config = {}) {
        this.config = config;
        this.state = 'idle';  // idle, running, paused, ended
        this.lastTime = 0;
        this.deltaTime = 0;
        this.logic = null;     // 逻辑层实例
        this.renderer = null;  // 渲染层实例
        this.canvas = null;
        this.ctx = null;
        this.eventListeners = {};
    }

    /**
     * 初始化游戏
     * @param {Object} logicClass - 逻辑层类
     * @param {Object} rendererClass - 渲染层类
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    init(logicClass, rendererClass, canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 创建逻辑层和渲染层实例
        this.logic = new logicClass(this.config);
        this.renderer = new rendererClass(canvas);

        // 初始化逻辑层
        if (this.logic.init) {
            this.logic.init();
        }

        // 初始化渲染层
        if (this.renderer.init) {
            this.renderer.init(this.logic);
        }

        this.emit('init');
    }

    /**
     * 启动游戏
     */
    start() {
        if (this.state === 'running') return;

        this.state = 'running';
        this.lastTime = performance.now();
        this.emit('start');

        this.gameLoop();
    }

    /**
     * 游戏主循环
     * @param {number} timestamp - 时间戳
     */
    gameLoop(timestamp) {
        if (this.state !== 'running') return;

        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // 限制最大帧时间，防止切换标签页后的跳跃
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }

        try {
            // 逻辑更新
            if (this.logic && this.logic.update) {
                this.logic.update(this.deltaTime);
            }

            // 渲染更新
            if (this.renderer && this.renderer.render) {
                this.renderer.render(this.logic);
            }
        } catch (error) {
            console.error('游戏循环错误:', error);
            this.emit('error', {error});
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * 暂停游戏
     */
    pause() {
        if (this.state !== 'running') return;

        this.state = 'paused';
        this.emit('pause');
    }

    /**
     * 恢复游戏
     */
    resume() {
        if (this.state !== 'paused') return;

        this.state = 'running';
        this.lastTime = performance.now();
        this.emit('resume');

        this.gameLoop();
    }

    /**
     * 结束游戏
     */
    end() {
        this.state = 'ended';
        this.emit('end');
    }

    /**
     * 重置游戏
     */
    reset() {
        this.state = 'idle';
        this.emit('reset');

        // 重新初始化
        if (this.logic && this.logic.reset) {
            this.logic.reset();
        }

        // 重新渲染
        if (this.renderer && this.renderer.render) {
            this.renderer.render(this.logic);
        }
    }

    /**
     * 处理输入事件
     * @param {string} eventType - 事件类型
     * @param {Object} eventData - 事件数据
     */
    handleInput(eventType, eventData) {
        if (this.logic && this.logic.handleInput) {
            this.logic.handleInput(eventType, eventData);
        }
    }

    /**
     * 注册事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} callback - 回调函数
     */
    on(eventType, callback) {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(callback);
    }

    /**
     * 移除事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} callback - 回调函数
     */
    off(eventType, callback) {
        if (!this.eventListeners[eventType]) return;

        const index = this.eventListeners[eventType].indexOf(callback);
        if (index > -1) {
            this.eventListeners[eventType].splice(index, 1);
        }
    }

    /**
     * 触发事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    emit(eventType, data = {}) {
        if (!this.eventListeners[eventType]) return;

        this.eventListeners[eventType].forEach(callback => {
            callback(data);
        });
    }

    /**
     * 获取游戏状态
     * @returns {string}
     */
    getState() {
        return this.state;
    }

    /**
     * 销毁游戏
     */
    destroy() {
        this.end();

        if (this.logic && this.logic.destroy) {
            this.logic.destroy();
        }

        if (this.renderer && this.renderer.destroy) {
            this.renderer.destroy();
        }

        this.logic = null;
        this.renderer = null;
        this.canvas = null;
        this.ctx = null;
        this.eventListeners = {};

        this.emit('destroy');
    }
}

// 导出类（如果在浏览器环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
