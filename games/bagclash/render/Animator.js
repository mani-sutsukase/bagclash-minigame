/**
 * 动画器类
 * 负责管理游戏中的动画效果
 */
class BagclashAnimator {
    constructor() {
        this.animations = [];
        this.isPlaying = true;
    }

    /**
     * 添加乱斗动画
     * @param {Object} data - 动画数据
     */
    addClashAnimation(data) {
        this.animations.push({
            type: 'clash',
            data: data,
            startTime: performance.now(),
            duration: 1000,  // 1秒
            progress: 0
        });
    }

    /**
     * 添加放置动画
     * @param {Object} data - 动画数据
     */
    addPlaceAnimation(data) {
        this.animations.push({
            type: 'place',
            data: data,
            startTime: performance.now(),
            duration: 500,  // 0.5秒
            progress: 0
        });
    }

    /**
     * 添加伤害动画
     * @param {Object} data - 动画数据
     */
    addDamageAnimation(data) {
        this.animations.push({
            type: 'damage',
            data: data,
            startTime: performance.now(),
            duration: 800,  // 0.8秒
            progress: 0
        });
    }

    /**
     * 更新所有动画
     * @param {number} timestamp - 当前时间戳
     * @returns {Array} 更新后的动画列表
     */
    update(timestamp) {
        if (!this.isPlaying) return [];

        // 更新动画进度
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
     * 获取当前活动的动画
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
     */
    render(ctx) {
        this.animations.forEach(animation => {
            this.renderAnimation(ctx, animation);
        });
    }

    /**
     * 渲染单个动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} animation - 动画对象
     */
    renderAnimation(ctx, animation) {
        const {type, data, progress} = animation;

        switch (type) {
            case 'clash':
                this.renderClash(ctx, data, progress);
                break;
            case 'place':
                this.renderPlace(ctx, data, progress);
                break;
            case 'damage':
                this.renderDamage(ctx, data, progress);
                break;
        }
    }

    /**
     * 渲染乱斗动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} data - 动画数据
     * @param {number} progress - 动画进度 (0-1)
     */
    renderClash(ctx, data, progress) {
        const {x, y, cellSize} = data;
        
        // 计算动画效果
        const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
        const alpha = 1 - progress;
        const rotation = progress * Math.PI * 2;

        // 保存当前状态
        ctx.save();

        // 移动到中心点
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        // 绘制碰撞效果
        ctx.fillStyle = `rgba(231, 76, 60, ${alpha * 0.5})`;
        ctx.fillRect(x, y, cellSize, cellSize);

        // 绘制战斗文字
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔️', centerX, centerY);

        // 恢复状态
        ctx.restore();
    }

    /**
     * 渲染放置动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} data - 动画数据
     * @param {number} progress - 动画进度 (0-1)
     */
    renderPlace(ctx, data, progress) {
        const {x, y, cellSize} = data;
        
        // 计算缩放效果（从0放大到1）
        const scale = easeOutBack(progress);
        const alpha = 1 - progress * 0.5;

        // 保存当前状态
        ctx.save();

        // 移动到中心点并缩放
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        // 绘制放置效果
        ctx.fillStyle = `rgba(46, 204, 113, ${alpha * 0.3})`;
        ctx.fillRect(x, y, cellSize, cellSize);

        // 绘制边框
        ctx.strokeStyle = `rgba(46, 204, 113, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // 恢复状态
        ctx.restore();
    }

    /**
     * 渲染伤害动画
     * @param {Object} ctx - Canvas上下文
     * @param {Object} data - 动画数据
     * @param {number} progress - 动画进度 (0-1)
     */
    renderDamage(ctx, data, progress) {
        const {x, y, cellSize, damage} = data;
        
        // 计算位置和透明度
        const offsetY = -progress * 30;  // 向上飘动
        const alpha = 1 - progress;
        const scale = 1 + progress * 0.5;  // 放大效果

        // 保存当前状态
        ctx.save();

        // 移动位置
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2 + offsetY;
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        // 绘制伤害数字
        ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`-${damage}`, centerX, centerY);

        // 恢复状态
        ctx.restore();
    }

    /**
     * 缓动函数 - easeOutBack
     * @param {number} t - 进度 (0-1)
     * @returns {number}
     */
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    /**
     * 销毁动画器
     */
    destroy() {
        this.clear();
        this.isPlaying = false;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BagclashAnimator;
}
