/**
 * 糖果消消乐动画器
 * 负责管理游戏中的动画效果（下落、消除、生成等）
 */
class CandyCrushAnimator {
    constructor() {
        this.animations = [];
        this.isPlaying = true;
        this.config = {
            gravity: 1.5,          // 重力加速度
            fallDuration: 400,     // 下落动画时长（ms）
            matchDuration: 300,    // 消除动画时长（ms）
            spawnDuration: 250     // 生成动画时长（ms）
        };
        
        // 性能监控
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
    }

    /**
     * 添加下落动画
     * @param {Object} candy - 糖果对象
     * @param {Object} from - 起始位置 {x, y}
     * @param {Object} to - 目标位置 {x, y}
     * @param {number} duration - 动画时长（可选）
     */
    addFallAnimation(candy, from, to, duration) {
        this.animations.push({
            type: 'fall',
            candy: candy,
            from: from,
            to: to,
            startTime: performance.now(),
            duration: duration || this.config.fallDuration,
            progress: 0,
            gravity: this.config.gravity
        });
    }

    /**
     * 添加消除动画
     * @param {Array} candies - 被消除的糖果列表
     * @param {number} duration - 动画时长（可选）
     */
    addMatchAnimation(candies, duration) {
        this.animations.push({
            type: 'match',
            candies: candies,
            startTime: performance.now(),
            duration: duration || this.config.matchDuration,
            progress: 0
        });
    }

    /**
     * 添加生成动画
     * @param {Object} candy - 糖果对象
     * @param {Object} to - 目标位置 {x, y}
     * @param {number} duration - 动画时长（可选）
     */
    addSpawnAnimation(candy, to, duration) {
        this.animations.push({
            type: 'spawn',
            candy: candy,
            to: to,
            startTime: performance.now(),
            duration: duration || this.config.spawnDuration,
            progress: 0
        });
    }

    /**
     * 更新所有动画
     * @param {number} timestamp - 当前时间戳
     * @returns {Array} 活动的动画
     */
    update(timestamp) {
        if (!this.isPlaying) return [];

        // 更新FPS
        this.updateFps(timestamp);

        // 更新了动画进度
        this.animations.forEach(animation => {
            if (animation.progress < 1) {
                const elapsed = timestamp - animation.startTime;
                animation.progress = Math.min(1, elapsed / animation.duration);
            }
        });

        // 移除已完成的动画
        this.animations = this.animations.filter(animation => animation.progress < 1);

        return this.animations;
    }

    /**
     * 更新FPS计数器
     * @param {number} timestamp - now时间戳
     */
    updateFps(timestamp) {
        this.frameCount++;
        
        // 每1秒更新一次FPS
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }
    }

    /**
     * 获取当前FPS
     * @returns {number} FPS值
     */
    getFps() {
        return this.fps;
    }

    /**
     * 获取活动的动画
     * @returns {Array} 活动动画列表
     */
    getActiveAnimations() {
        return this.animations;
    }

    /**
     * 检查是否有动画在播放
     * @returns {boolean}
     */
    hasActiveAnimations() {
        return this.animations.length > 0;
    }

    /**
     * 清除所有动画
     */
    clear() {
        this.animations = [];
    }

    /**
     * 暂停动画
     */
    pause() {
        this.isPlaying = false;
    }

    /**
     * 恢复动画
     */
    resume() {
        this.isPlaying = true;
    }

    /**
     * 渲染动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} renderer - 渲染器实例（用于获取配置和绘制糖果）
     */
    render(ctx, renderer) {
        this.animations.forEach(animation => {
            this.renderAnimation(ctx, renderer, animation);
        });
    }

    /**
     * 渲染单个动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} renderer - 渲染器实例
     * @param {Object} animation - 动画对象
     */
    renderAnimation(ctx, renderer, animation) {
        const {type, progress} = animation;

        switch (type) {
            case 'match':
                this.renderMatch(ctx, renderer, animation);
                break;
            case 'fall':
                this.renderFall(ctx, renderer, animation);
                break;
            case 'spawn':
                this.renderSpawn(ctx, renderer, animation);
                break;
        }
    }

    /**
     * 渲染下落动画（使用重力缓动）
     * @param {Object} ctx - Canvas上下文
     * @param {Object} renderer - 渲染器实例
     * @param {Object} animation - 动画对象
     */
    renderFall(ctx, renderer, animation) {
        const {candy, from, to, progress, gravity} = animation;
        
        // 使用重力缓动函数（抛物线运动）
        const easedProgress = this.easeGravity(progress, gravity);
        
        // 获取网格位置信息
        const gridWidth = renderer.game.grid[0] ? renderer.game.grid[0].length : 0;
        const gridHeight = renderer.game.grid.length;
        const cellSize = renderer.config.cell.size + renderer.config.cell.padding * 2;
        
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (renderer.config.leftWidth - gridWidthPixels) / 2;
        const startY = (renderer.canvas.height - gridHeightPixels) / 2;

        const fromX = startX + from.x * cellSize + cellSize / 2;
        const fromY = startY + from.y * cellSize + cellSize / 2;
        const toX = startX + to.x * cellSize + cellSize / 2;
        const toY = startY + to.y * cellSize + cellSize / 2;

        // 计算当前位置（使用重力缓动）
        const currentX = fromX + (toX - fromX) * easedProgress;
        const currentY = fromY + (toY - fromY) * easedProgress;

        // 绘制糖果
        renderer.drawCandy(candy, currentX, currentY, cellSize / 2 - 5);
    }

    /**
     * 渲染消除动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} renderer - 渲染器实例
     * @param {Object} animation - 动画对象
     */
    renderMatch(ctx, renderer, animation) {
        const {candies, progress} = animation;
        const cellSize = renderer.config.cell.size + renderer.config.cell.padding * 2;
        
        const grid = renderer.game.grid;
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (renderer.config.leftWidth - gridWidthPixels) / 2;
        const startY = (renderer.canvas.height - gridHeightPixels) / 2;

        candies.forEach(candy => {
            const x = startX + candy.x * cellSize;
            const y = startY + candy.y * cellSize;
            
            // 淡出效果
            const alpha = 1 - progress;
            const scale = 1 - progress * 0.5;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x + cellSize / 2, y + cellSize / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(x + cellSize / 2), -(y + cellSize / 2));
            
            // 绘制高亮效果
            ctx.fillStyle = `rgba(255, 215, 0, ${0.5 * alpha})`;
            ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10);
            
            ctx.restore();
        });
    }

    /**
     * 渲染生成动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} renderer - 渲染器实例
     * @param {Object} animation - 动画对象
     */
    renderSpawn(ctx, renderer, animation) {
        const {candy, to, progress} = animation;
        const cellSize = renderer.config.cell.size + renderer.config.cell.padding * 2;
        
        const grid = renderer.game.grid;
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (renderer.config.leftWidth - gridWidthPixels) / 2;
        const startY = (renderer.canvas.height - gridHeightPixels) / 2;

        const x = startX + to.x * cellSize + cellSize / 2;
        const y = startY + to.y * cellSize + cellSize / 2;

        // 缩放效果
        const scale = this.easeOutBack(progress);
        const alpha = progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.translate(-x, -y);

        renderer.drawCandy(candy, x, y, cellSize / 2 - 5);

        ctx.restore();
    }

    /**
     * 重力缓动函数（模拟自由落体）
     * @param {number} t - 时间进度（0-1）
     * @param {number} gravity - 重力加速度（默认1.5）
     * @returns {number} 位置进度（0-1）
     */
    easeGravity(t, gravity = 1.5) {
        // 使用抛物线公式：距离与时间的gravity次方成正比
        // gravity > 1 表示加速效果
        return Math.pow(t, gravity);
    }

    /**
     * 缓动函数 - easeOutBack
     * 用于生成动画的弹跳效果
     * @param {number} t - 进度 (0-1)
     * @returns {number}
     */
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    /**
     * 更新配置
     * @param {Object} config - 新的配置
     */
    updateConfig(config) {
        this.config = {...this.config, ...config};
    }

    /**
     * 销毁动画器
     */
    destroy() {
        this.clear();
        this.isPlaying = false;
        this.animations = null;
    }
}

// 导出类（浏览器环境）
window.CandyCrushAnimator = CandyCrushAnimator;

// Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CandyCrushAnimator;
}
