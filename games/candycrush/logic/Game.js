/**
 * 糖果消消乐游戏逻辑
 */
class CandyCrushGame {
    constructor(config) {
        this.config = config;
        this.state = 'idle';
        this.grid = [];
        this.score = 0;
        this.combo = 0;
        this.moves = 0;
        this.maxMoves = 100;
        this.selectedCandy = null;
        this.isProcessing = false;

        // 关卡系统
        this.level = 1;
        this.levelScore = 0;      // 当前关卡的积分
        this.levelTarget = this.calculateLevelTarget(1);  // 每关目标积分（斐波那契）
        this.checkInterval = 10;  // 每10次操作检查一次
        this.lastCheckMove = 0;   // 上次检查的移动次数
    }

    /**
     * 初始化游戏
     */
    init() {
        // 检查配置
        if (!this.config || !this.config.game) {
            console.error('游戏配置无效:', this.config);
            throw new Error('游戏配置无效');
        }

        this.gridSize = this.config.game.gridSize;
        this.candyTypes = this.config.game.candyTypes;
        this.grid = [];

        // 检查网格大小
        if (!this.gridSize || !this.gridSize.width || !this.gridSize.height) {
            console.error('网格大小配置无效:', this.gridSize);
            throw new Error('网格大小配置无效');
        }

        console.log('初始化游戏:', {
            gridSize: this.gridSize,
            candyTypes: this.candyTypes
        });

        // 初始化网格
        for (let y = 0; y < this.gridSize.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize.width; x++) {
                try {
                    this.grid[y][x] = this.generateCandy(x, y, []);
                } catch (error) {
                    console.error(`生成糖果失败 (${x}, ${y}):`, error);
                    this.grid[y][x] = null;
                }
            }
        }

        // 移除初始匹配（简单处理）
        this.removeInitialMatches();

        this.score = 0;
        this.combo = 0;
        this.moves = 0;
        this.maxMoves = 100;
        this.selectedCandy = null;
        this.isProcessing = false;
        this.state = 'ready';

        console.log('游戏初始化完成:', {
            grid: this.grid,
            state: this.state
        });
    }

    /**
     * 重置游戏
     */
    reset() {
        this.level = 1;
        this.levelScore = 0;
        this.lastCheckMove = 0;
        this.levelTarget = this.calculateLevelTarget(1);
        this.init();
    }

    /**
     * 计算关卡目标积分（斐波那契数列）
     * F1=300, F2=500, F3=800, F4=1300, ...
     * Fn = Fn-1 + Fn-2
     * @param {number} level - 关卡
     * @returns {number} 目标积分
     */
    calculateLevelTarget(level) {
        if (level === 1) return 300;
        if (level === 2) return 500;

        let prev2 = 300;  // F1
        let prev1 = 500;  // F2
        let current = 0;

        for (let i = 3; i <= level; i++) {
            current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }

        return current;
    }

    /**
     * 移除初始匹配
     */
    removeInitialMatches() {
        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const matches = this.findMatches();
            if (matches.length === 0) break;

            // 简单处理：重新生成匹配的格子
            matches.forEach(match => {
                if (match.candies && Array.isArray(match.candies)) {
                    match.candies.forEach(candy => {
                        // 检查糖果对象是否有效
                        if (candy && candy.x !== undefined && candy.y !== undefined) {
                            // 检查坐标是否在有效范围内
                            if (candy.x >= 0 && candy.x < this.gridSize.width &&
                                candy.y >= 0 && candy.y < this.gridSize.height) {
                                // 检查网格行是否存在
                                if (this.grid[candy.y]) {
                                    try {
                                        this.grid[candy.y][candy.x] = this.generateCandy(candy.x, candy.y, []);
                                    } catch (error) {
                                        console.error(`重新生成糖果失败 (${candy.x}, ${candy.y}):`, error);
                                        this.grid[candy.y][candy.x] = null;
                                    }
                                }
                            }
                        }
                    });
                }
            });

            attempts++;
        }
    }

    /**
     * 生成糖果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object|null} 糖果对象
     */
    generateCandy(x, y, excludeTypes = []) {
        const types = this.config.candy.types;

        // 排除相邻2格的糖果类型
        const nearbyTypes = this.getNearbyTypes(x, y, 2);
        const allExclude = [...excludeTypes, ...nearbyTypes];

        // 过滤可用的类型
        const availableTypes = types.filter(type => !allExclude.includes(type));

        let type;
        if (availableTypes.length === 0) {
            // 如果没有可用类型，从所有类型中随机选择
            type = types[Math.floor(Math.random() * types.length)];
        } else {
            type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        }

        return {
            type,
            x,
            y,
            id: `${x}-${y}-${Date.now()}-${Math.random()}`
        };
    }

    /**
     * 获取相邻2格的糖果类型
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} distance - 距离
     * @returns {Array} 类型列表
     */
    getNearbyTypes(x, y, distance) {
        const types = [];

        for (let dy = -distance; dy <= distance; dy++) {
            for (let dx = -distance; dx <= distance; dx++) {
                if (dx === 0 && dy === 0) continue;
                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) continue;

                const nx = x + dx;
                const ny = y + dy;

                // 检查坐标是否在有效范围内
                if (nx >= 0 && nx < this.gridSize.width &&
                    ny >= 0 && ny < this.gridSize.height) {

                    // 检查该位置是否存在糖果
                    if (this.grid[ny] && this.grid[ny][nx]) {
                        const candy = this.grid[ny][nx];
                        if (candy.type && !types.includes(candy.type)) {
                            types.push(candy.type);
                        }
                    }
                }
            }
        }

        return types;
    }

    /**
     * 处理点击事件
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object|null} 操作结果
     */
    handleClick(x, y) {
        if (this.state !== 'ready' || this.isProcessing) return null;

        const clickedCandy = this.grid[y][x];
        if (!clickedCandy) return null;

        if (!this.selectedCandy) {
            // 选择第一个糖果
            this.selectedCandy = {x, y};
            return {
                type: 'select',
                candy: clickedCandy
            };
        } else {
            // 尝试交换
            const result = this.trySwap(this.selectedCandy, {x, y});
            this.selectedCandy = null;
            return result;
        }
    }

    /**
     * 尝试交换糖果
     * @param {Object} pos1 - 位置1
     * @param {Object} pos2 - 位置2
     * @returns {Object} 操作结果
     */
    trySwap(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);

        // 检查是否相邻
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // 交换糖果
            const temp = this.grid[pos1.y][pos1.x];
            this.grid[pos1.y][pos1.x] = this.grid[pos2.y][pos2.x];
            this.grid[pos2.y][pos2.x] = temp;

            // 更新坐标
            if (this.grid[pos1.y][pos1.x]) {
                this.grid[pos1.y][pos1.x].x = pos1.x;
                this.grid[pos1.y][pos1.x].y = pos1.y;
            }
            if (this.grid[pos2.y][pos2.x]) {
                this.grid[pos2.y][pos2.x].x = pos2.x;
                this.grid[pos2.y][pos2.x].y = pos2.y;
            }

            // 检查匹配
            const matches = this.findMatches();
            if (matches.length > 0) {
                // 有效移动
                this.moves++;
                this.combo = 0;
                return {
                    type: 'swap',
                    from: pos1,
                    to: pos2,
                    valid: true
                };
            } else {
                // 无效移动，换回来
                const temp2 = this.grid[pos1.y][pos1.x];
                this.grid[pos1.y][pos1.x] = this.grid[pos2.y][pos2.x];
                this.grid[pos2.y][pos2.x] = temp2;

                if (this.grid[pos1.y][pos1.x]) {
                    this.grid[pos1.y][pos1.x].x = pos1.x;
                    this.grid[pos1.y][pos1.x].y = pos1.y;
                }
                if (this.grid[pos2.y][pos2.x]) {
                    this.grid[pos2.y][pos2.x].x = pos2.x;
                    this.grid[pos2.y][pos2.x].y = pos2.y;
                }

                return {
                    type: 'swap',
                    from: pos1,
                    to: pos2,
                    valid: false
                };
            }
        } else {
            // 不相邻，重新选择
            return {
                type: 'select',
                candy: this.grid[pos2.y][pos2.x]
            };
        }
    }

    /**
     * 查找所有匹配
     * @returns {Array} 匹配列表
     */
    findMatches() {
        const matches = [];
        const minMatch = this.config.game.minMatch;

        // 横向匹配
        for (let y = 0; y < this.gridSize.height; y++) {
            for (let x = 0; x < this.gridSize.width - minMatch + 1; x++) {
                const candy = this.grid[y][x];
                if (!candy) continue;

                const match = [candy];
                for (let i = 1; i < this.gridSize.width - x; i++) {
                    const nextCandy = this.grid[y][x + i];
                    if (nextCandy && nextCandy.type === candy.type) {
                        match.push(nextCandy);
                    } else {
                        break;
                    }
                }

                if (match.length >= minMatch) {
                    matches.push({
                        type: 'horizontal',
                        candies: match
                    });
                    x += match.length - 1;
                }
            }
        }

        // 纵向匹配
        for (let x = 0; x < this.gridSize.width; x++) {
            for (let y = 0; y < this.gridSize.height - minMatch + 1; y++) {
                const candy = this.grid[y][x];
                if (!candy) continue;

                const match = [candy];
                for (let i = 1; i < this.gridSize.height - y; i++) {
                    const nextCandy = this.grid[y + i][x];
                    if (nextCandy && nextCandy.type === candy.type) {
                        match.push(nextCandy);
                    } else {
                        break;
                    }
                }

                if (match.length >= minMatch) {
                    matches.push({
                        type: 'vertical',
                        candies: match
                    });
                    y += match.length - 1;
                }
            }
        }

        return matches;
    }

    /**
     * 移除匹配的糖果
     * @returns {Array} 被移除的糖果
     */
    removeMatches() {
        const matches = this.findMatches();
        const removed = [];

        matches.forEach(match => {
            match.candies.forEach(candy => {
                if (this.grid[candy.y][candy.x] === candy) {
                    this.grid[candy.y][candy.x] = null;
                    removed.push(candy);
                }
            });
        });

        // 计算分数（根据消除数量）
        if (matches.length > 0) {
            this.combo++;

            // 计算本次消除的分数
            let matchScore = 0;
            matches.forEach(match => {
                const count = match.candies.length;
                if (count >= 3) {
                    // 3个：30分，4个：60分，5个及以上：120分
                    if (count === 3) {
                        matchScore += 30;
                    } else if (count === 4) {
                        matchScore += 60;
                    } else {
                        matchScore += 120;
                    }
                }
            });

            // 连消奖励：每次连消额外加10分
            const comboBonus = this.combo > 1 ? (this.combo - 1) * 10 : 0;
            this.score += matchScore + comboBonus;

            console.log(`消除得分: ${matchScore}, 连消${this.combo}次, 奖励${comboBonus}, 总分${this.score}`);
        }

        return removed;
    }

    /**
     * 填充空位
     * @returns {Object} 填充信息
     */
    fillEmpty() {
        const movements = [];

        // 从下往上处理
        for (let x = 0; x < this.gridSize.width; x++) {
            let emptyCount = 0;

            for (let y = this.gridSize.height - 1; y >= 0; y--) {
                if (!this.grid[y][x]) {
                    emptyCount++;
                } else if (emptyCount > 0) {
                    // 下落
                    const candy = this.grid[y][x];
                    const newY = y + emptyCount;
                    this.grid[newY][x] = candy;
                    this.grid[y][x] = null;
                    candy.y = newY;

                    movements.push({
                        candy,
                        from: {x, y},
                        to: {x, y: newY}
                    });
                }
            }

            // 填充顶部空位
            for (let y = 0; y < emptyCount; y++) {
                const candy = this.generateCandy(x, y);
                candy.x = x;
                candy.y = y;
                this.grid[y][x] = candy;

                movements.push({
                    candy,
                    type: 'spawn',
                    to: {x, y}
                });
            }
        }

        return {movements};
    }

    /**
     * 处理游戏逻辑（匹配、消除、下落）
     * @returns {Object} 处理结果
     */
    async processMatches() {
        this.isProcessing = true;
        const results = [];

        while (true) {
            const matches = this.findMatches();
            if (matches.length === 0) break;

            // 消除
            const removed = this.removeMatches();
            results.push({
                type: 'remove',
                candies: removed,
                matches: matches
            });

            // 下落
            const fill = this.fillEmpty();
            results.push({
                type: 'fill',
                movements: fill.movements
            });

            // 等待动画
            await this.delay(300);
        }

        this.isProcessing = false;

        // 检查关卡进度
        const levelResult = this.checkLevelProgress();
        if (levelResult) {
            results.push(levelResult);
        }

        return results;
    }

    /**
     * 检查关卡进度
     * @returns {Object|null} 关卡检查结果
     */
    checkLevelProgress() {
        // 每次有效操作都检查，但只在每10次操作时进行过关判断
        if (this.moves % this.checkInterval === 0 && this.moves > 0) {
            console.log(`关卡检查: 关卡${this.level}, 当前积分${this.score}, 目标积分${this.levelTarget}`);

            if (this.score < this.levelTarget) {
                // 游戏失败
                this.state = 'failed';
                return {
                    type: 'gameFailed',
                    level: this.level,
                    score: this.score,
                    target: this.levelTarget,
                    message: `第${this.level}关失败！积分${this.score}未达到目标${this.levelTarget}`
                };
            } else {
                // 过关
                const nextLevel = this.level + 1;
                return {
                    type: 'levelUp',
                    level: this.level,
                    nextLevel: nextLevel,
                    score: this.score,
                    target: this.levelTarget,
                    message: `恭喜过关！第${this.level}关完成，进入第${nextLevel}关！`
                };
            }
        }

        return null;
    }

    /**
     * 进入下一关
     * @returns {Object} 过关信息
     */
    nextLevel() {
        this.level++;
        this.score = 0;        // 新关卡重置积分
        this.moves = 0;         // 重置移动次数

        // 关卡难度递增：使用斐波那契数列
        this.levelTarget = this.calculateLevelTarget(this.level);

        // 重新初始化网格
        this.init();

        this.state = 'ready';

        console.log(`进入第${this.level}关，目标积分: ${this.levelTarget}`);

        return {
            type: 'levelStart',
            level: this.level,
            target: this.levelTarget,
            message: `第${this.level}关开始！目标积分: ${this.levelTarget}`
        };
    }

    /**
     * 延迟
     * @param {number} ms - 毫秒
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 更新游戏状态
     * @param {number} deltaTime - 帧时间
     */
    update(deltaTime) {
        // 游戏更新逻辑（主要用于动画）
    }

    /**
     * 获取游戏状态
     * @returns {Object}
     */
    getState() {
        return {
            grid: this.grid,
            score: this.score,
            combo: this.combo,
            moves: this.moves,
            maxMoves: this.maxMoves,
            state: this.state,
            level: this.level,
            levelTarget: this.levelTarget,
            checkInterval: this.checkInterval
        };
    }
}

// 导出类（浏览器环境）
window.CandyCrushGame = CandyCrushGame;

// Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CandyCrushGame;
}
