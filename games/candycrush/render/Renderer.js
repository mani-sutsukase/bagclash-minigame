/**
 * 糖果消消乐渲染器
 * 负责将游戏逻辑渲染到Canvas上
 */
class CandyCrushRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 配置
        this.config = {
            leftWidth: 720,      // 左侧游戏区域宽度（调整为720以给背包更多空间）
            rightWidth: 320,     // 右侧信息区域宽度（增加到320）
            totalHeight: 1080,    // 总高度
            cell: {
                size: 40,
                padding: 2,
                borderRadius: 8
            },
            backpack: {
                cellSize: 50,    // 减小格子大小以适应4x7布局
                padding: 3,
                borderRadius: 8
            },
            colors: {
                background: '#2c3e50',
                grid: '#34495e',
                gridLine: '#3d566e',
                empty: '#2c3e50',
                gridBorder: '#5a6c7f',  // 网格边框颜色
                backpack: '#34495e',    // 背包背景
                backpackBorder: '#5a6c7f',
                backpackSlot: '#3d566e'  // 背包格子
            },
            gridPadding: 20      // 网格外边距
        };

        // 动画队列
        this.animations = [];
    }

    /**
     * 初始化渲染器
     * @param {Object} game - 游戏逻辑实例
     */
    init(game) {
        this.game = game;
        this.resizeCanvas();
    }

    /**
     * 调整Canvas大小
     */
    resizeCanvas() {
        const totalWidth = this.config.leftWidth + this.config.rightWidth;
        
        // 计算15x15网格的实际尺寸
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        const gridHeight = 15 * cellSize + 40; // 额外上下边距
        
        this.canvas.width = totalWidth;
        this.canvas.height = Math.max(gridHeight, 700); // 至少700像素高
    }

    /**
     * 渲染游戏
     * @param {Object} game - 游戏逻辑实例
     */
    render(game) {
        if (!game) {
            console.error('render: game is null or undefined');
            return;
        }

        this.game = game;
        
        // 🔍 调试：打印游戏状态
        const gameState = game.getState ? game.getState() : game.state || game;
        console.log('render - game state:', gameState);
        
        this.clear();
        this.drawBackground();
        this.drawGrid();
        this.drawCandies();
        this.drawSelection();
        this.drawAnimations();
        this.drawRightPanel();
    }

    /**
     * 清空画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 绘制背景
     */
    drawBackground() {
        this.ctx.fillStyle = this.config.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 绘制网格
     */
    drawGrid() {
        const gameState = this.game.getState();
        const grid = gameState.grid;
        
        if (!grid || grid.length === 0) return;
        
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        const padding = this.config.gridPadding;
        
        const startX = (this.config.leftWidth - gridWidthPixels) / 2;
        const startY = (this.canvas.height - gridHeightPixels) / 2;

        // 绘制网格背景
        this.ctx.fillStyle = this.config.colors.grid;
        this.ctx.fillRect(startX - padding, startY - padding, 
                         gridWidthPixels + padding * 2, gridHeightPixels + padding * 2);

        // 绘制网格边框
        this.ctx.strokeStyle = this.config.colors.gridBorder;
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(startX - padding, startY - padding, 
                           gridWidthPixels + padding * 2, gridHeightPixels + padding * 2);

        // 绘制网格线
        this.ctx.strokeStyle = this.config.colors.gridLine;
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= gridWidth; x++) {
            const px = startX + x * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(px, startY);
            this.ctx.lineTo(px, startY + gridHeightPixels);
            this.ctx.stroke();
        }

        for (let y = 0; y <= gridHeight; y++) {
            const py = startY + y * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, py);
            this.ctx.lineTo(startX + gridWidthPixels, py);
            this.ctx.stroke();
        }
    }

    /**
     * 绘制糖果
     */
    drawCandies() {
        const gameState = this.game.getState();
        const grid = gameState.grid;
        
        // 统一使用包含padding的cellSize
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        const innerPadding = this.config.cell.padding;
        
        if (!grid || grid.length === 0) return;
        
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        // 与drawGrid相同的起始位置
        const startX = (this.config.leftWidth - gridWidthPixels) / 2;
        const startY = (this.canvas.height - gridHeightPixels) / 2;

        // 获取糖果配置
        const candyConfig = this.game.config.candy;

        // 🔍 调试：在(0,0)位置绘制一个红色标记
        this.ctx.fillStyle = 'red';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`TEST: startX=${Math.round(startX)}, startY=${Math.round(startY)}`, 10, 30);
        this.ctx.fillText(`Grid: ${gridWidth}x${gridHeight}, cell=${cellSize}`, 10, 50);

        // 🔍 调试：在起始位置绘制一个绿色标记点
        this.ctx.fillStyle = 'green';
        this.ctx.beginPath();
        this.ctx.arc(startX, startY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillText(`起始点`, startX, startY - 10);

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const candy = grid[y][x];
                if (candy) {
                    const cx = startX + x * cellSize + innerPadding + (cellSize - innerPadding * 2) / 2;
                    const cy = startY + y * cellSize + innerPadding + (cellSize - innerPadding * 2) / 2;
                    
                    // 🔍 调试：第一个糖果绘制蓝色标记
                    if (x === 0 && y === 0) {
                        this.ctx.fillStyle = 'blue';
                        this.ctx.beginPath();
                        this.ctx.arc(cx, cy, 8, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillText(`糖果(0,0)`, cx, cy - 15);
                    }
                    
                    this.drawCandy(candy, cx, cy, (cellSize - innerPadding * 2) / 2);
                }
            }
        }
    }

    /**
     * 绘制单个糖果
     * @param {Object} candy - 糖果对象
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 半径
     */
    drawCandy(candy, x, y, radius) {
        const candyConfig = this.game.config.candy;
        const color = candyConfig.colors[candy.type] || '#667eea';
        const emoji = candyConfig.emojis[candy.type] || '🍬';

        // 绘制圆形背景
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // 绘制边框
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 绘制emoji
        this.ctx.font = `${radius * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, x, y);
    }

    /**
     * 绘制选中效果
     */
    drawSelection() {
        if (!this.game.selectedCandy) return;

        const {x, y} = this.game.selectedCandy;
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        const innerPadding = this.config.cell.padding;
        
        const grid = this.game.grid;
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (this.config.leftWidth - gridWidthPixels) / 2;
        const startY = (this.canvas.height - gridHeightPixels) / 2;

        const selX = startX + x * cellSize + innerPadding;
        const selY = startY + y * cellSize + innerPadding;
        const selSize = cellSize - innerPadding * 2;

        // 绘制选中框
        this.ctx.strokeStyle = '#ffd32a';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(selX, selY, selSize, selSize);
    }

    /**
     * 绘制动画
     */
    drawAnimations() {
        this.animations.forEach(animation => {
            this.drawAnimation(animation);
        });
    }

    /**
     * 绘制单个动画
     * @param {Object} animation - 动画对象
     */
    drawAnimation(animation) {
        const {type, data, progress} = animation;

        switch (type) {
            case 'match':
                this.drawMatchAnimation(animation);
                break;
            case 'fall':
                this.drawFallAnimation(animation);
                break;
            case 'spawn':
                this.drawSpawnAnimation(animation);
                break;
        }
    }

    /**
     * 绘制消除动画
     */
    drawMatchAnimation(animation) {
        const {candies, progress} = animation.data;
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        
        const grid = this.game.grid;
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (this.config.leftWidth - gridWidthPixels) / 2;
        const startY = (this.canvas.height - gridHeightPixels) / 2;

        candies.forEach(candy => {
            const x = startX + candy.x * cellSize;
            const y = startY + candy.y * cellSize;
            
            // 淡出效果
            const alpha = 1 - progress;
            const scale = 1 - progress * 0.5;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.translate(x + cellSize / 2, y + cellSize / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(x + cellSize / 2), -(y + cellSize / 2));
            
            // 绘制高亮效果
            this.ctx.fillStyle = `rgba(255, 215, 0, ${0.5 * alpha})`;
            this.ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10);
            
            this.ctx.restore();
        });
    }

    /**
     * 绘制下落动画
     */
    drawFallAnimation(animation) {
        const {candy, from, to, progress} = animation.data;
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        
        const grid = this.game.grid;
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (this.config.leftWidth - gridWidthPixels) / 2;
        const startY = (this.canvas.height - gridHeightPixels) / 2;

        const fromX = startX + from.x * cellSize + cellSize / 2;
        const fromY = startY + from.y * cellSize + cellSize / 2;
        const toX = startX + to.x * cellSize + cellSize / 2;
        const toY = startY + to.y * cellSize + cellSize / 2;

        // 计算当前位置
        const currentX = fromX + (toX - fromX) * progress;
        const currentY = fromY + (toY - fromY) * progress;

        this.drawCandy(candy, currentX, currentY, cellSize / 2 - 5);
    }

    /**
     * 绘制生成动画
     */
    drawSpawnAnimation(animation) {
        const {candy, to, progress} = animation.data;
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        
        const grid = this.game.grid;
        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (this.config.leftWidth - gridWidthPixels) / 2;
        const startY = (this.canvas.height - gridHeightPixels) / 2;

        const x = startX + to.x * cellSize + cellSize / 2;
        const y = startY + to.y * cellSize + cellSize / 2;

        // 缩放效果
        const scale = easeOutBack(progress);
        const alpha = progress;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-x, -y);

        this.drawCandy(candy, x, y, cellSize / 2 - 5);

        this.ctx.restore();
    }

    /**
     * 绘制右侧面板
     */
    drawRightPanel() {
        const gameState = this.game.getState();
        const panelX = this.config.leftWidth + 20;
        const panelY = 50;

        // 绘制关卡信息
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`🎮 关卡 ${gameState.level}`, panelX, panelY);

        // 绘制目标积分
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`目标积分: ${gameState.levelTarget}`, panelX, panelY + 35);

        // 绘制当前积分
        this.ctx.fillStyle = '#ffd32a';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`💰 积分: ${gameState.score}`, panelX, panelY + 70);

        // 绘制检查提示
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '14px Arial';
        const movesUntilCheck = gameState.checkInterval - (gameState.moves % gameState.checkInterval);
        this.ctx.fillText(`下次检查: ${movesUntilCheck}次操作`, panelX, panelY + 95);

        // 绘制回合数
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`🎯 回合: ${gameState.moves}`, panelX, panelY + 125);

        // 绘制连消数
        if (gameState.combo > 1) {
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.fillText(`🔥 连消: ${gameState.combo}`, panelX, panelY + 155);
        }

        // 绘制游戏状态
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        const statusText = {
            'idle': '等待开始',
            'ready': '游戏中',
            'ended': '游戏结束',
            'failed': '游戏失败'
        }[gameState.state] || gameState.state;

        const statusColor = gameState.state === 'failed' ? '#ff4757' : '#ffffff';
        this.ctx.fillStyle = statusColor;
        this.ctx.fillText(`📊 状态: ${statusText}`, panelX, panelY + 185);

        // 绘制背包
        if (this.game.backpack) {
            this.drawBackpack(panelX, panelY + 215);
        }
    }

    /**
     * 绘制背包
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     */
    drawBackpack(x, y) {
        if (!this.game.backpack) return;

        const backpack = this.game.backpack;
        const cellSize = this.config.backpack.cellSize;
        const padding = this.config.backpack.padding;
        const gap = 2;  // 格子间隙

        const bagWidth = backpack.width * (cellSize + gap) - gap;
        const bagHeight = backpack.height * (cellSize + gap) - gap;
        const paddingX = 10;
        const paddingY = 10;

        // 绘制标题
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🎒 道具背包', x, y);

        // 绘制背包背景
        this.ctx.fillStyle = this.config.colors.backpack;
        this.ctx.fillRect(
            x - paddingX,
            y + 10,
            bagWidth + paddingX * 2,
            bagHeight + paddingY * 2
        );

        // 绘制背包边框
        this.ctx.strokeStyle = this.config.colors.backpackBorder;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            x - paddingX,
            y + 10,
            bagWidth + paddingX * 2,
            bagHeight + paddingY * 2
        );

        // 绘制格子（4列 x 7行）
        for (let row = 0; row < backpack.height; row++) {
            for (let col = 0; col < backpack.width; col++) {
                const cellX = x + col * (cellSize + gap);
                const cellY = y + 10 + paddingY + row * (cellSize + gap);

                // 检查是否被道具占用
                const isOccupied = backpack.slots && backpack.slots[row] && backpack.slots[row][col];

                // 绘制格子背景
                this.ctx.fillStyle = isOccupied ? this.config.colors.backpackSlot : '#2c3e50';
                this.ctx.fillRect(cellX, cellY, cellSize, cellSize);

                // 绘制格子边框
                this.ctx.strokeStyle = '#5a6c7f';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(cellX, cellY, cellSize, cellSize);
            }
        }

        // 绘制道具
        if (backpack.items) {
            backpack.items.forEach(placedItem => {
                const item = placedItem.item;
                const itemX = x + placedItem.x * (cellSize + gap);
                const itemY = y + 10 + paddingY + placedItem.y * (cellSize + gap);

                this.drawItem(item, itemX, itemY, cellSize, gap);
            });
        }
    }

    /**
     * 绘制道具
     * @param {Object} item - 道具对象
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @param {number} cellSize - 格子大小
     * @param {number} gap - 格子间隙
     */
    drawItem(item, x, y, cellSize, gap) {
        const innerSize = cellSize - this.config.backpack.padding * 2;
        const cornerRadius = this.config.backpack.borderRadius;

        item.shape.forEach(cell => {
            const cx = x + cell.x * (cellSize + gap) + this.config.backpack.padding;
            const cy = y + cell.y * (cellSize + gap) + this.config.backpack.padding;

            // 绘制圆角矩形背景
            this.ctx.fillStyle = item.color;
            this.roundRect(cx, cy, innerSize, innerSize, cornerRadius);
            this.ctx.fill();

            // 绘制边框
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 2;
            this.roundRect(cx, cy, innerSize, innerSize, cornerRadius);
            this.ctx.stroke();

            // 绘制emoji（只画第一个格子）
            if (cell.x === 0 && cell.y === 0) {
                this.ctx.font = `${innerSize * 0.5}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    item.emoji,
                    cx + innerSize / 2,
                    cy + innerSize / 2
                );
            }
        });
    }

    /**
     * 绘制圆角矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} radius - 圆角半径
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    /**
     * 添加动画
     * @param {Object} animation - 动画对象
     */
    addAnimation(animation) {
        this.animations.push({
            ...animation,
            progress: 0,
            startTime: performance.now()
        });
    }

    /**
     * 更新动画
     * @param {number} deltaTime - 帧时间
     */
    updateAnimations(deltaTime) {
        const now = performance.now();
        this.animations = this.animations.filter(animation => {
            animation.progress = (now - animation.startTime) / animation.duration;
            return animation.progress < 1;
        });
    }

    /**
     * 清除所有动画
     */
    clearAnimations() {
        this.animations = [];
    }

    /**
     * 从坐标获取格子索引
     * @param {number} pixelX - 像素X坐标
     * @param {number} pixelY - 像素Y坐标
     * @returns {Object|null} 格子索引对象
     */
    getCellFromPosition(pixelX, pixelY) {
        if (!this.game) return null;

        const grid = this.game.grid;
        if (!grid || grid.length === 0) return null;

        const gridWidth = grid[0] ? grid[0].length : 0;
        const gridHeight = grid.length;
        const cellSize = this.config.cell.size + this.config.cell.padding * 2;
        
        const gridWidthPixels = gridWidth * cellSize;
        const gridHeightPixels = gridHeight * cellSize;
        
        const startX = (this.config.leftWidth - gridWidthPixels) / 2;
        const startY = (this.canvas.height - gridHeightPixels) / 2;

        // 检查是否在游戏区域内
        if (pixelX < startX || pixelX > startX + gridWidthPixels ||
            pixelY < startY || pixelY > startY + gridHeightPixels) {
            return null;
        }

        const x = Math.floor((pixelX - startX) / cellSize);
        const y = Math.floor((pixelY - startY) / cellSize);

        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            return {x, y};
        }

        return null;
    }

    /**
     * 销毁渲染器
     */
    destroy() {
        this.clearAnimations();
        this.canvas = null;
        this.ctx = null;
        this.game = null;
    }
}

// 缓动函数
function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// 导出类（浏览器环境）
window.CandyCrushRenderer = CandyCrushRenderer;

// Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CandyCrushRenderer;
}
