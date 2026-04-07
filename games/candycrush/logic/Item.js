/**
 * 道具系统
 */

/**
 * 道具类
 * 支持多矩形形状的道具
 */
class Item {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.emoji = config.emoji;
        this.color = config.color;
        this.shape = config.shape || [{x: 0, y: 0}];  // 形状：格子相对坐标数组
        this.effect = config.effect || null;
        this.description = config.description || '';
    }

    /**
     * 获取道具边界框尺寸
     * @returns {Object} {width, height}
     */
    getBoundingBox() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        this.shape.forEach(cell => {
            minX = Math.min(minX, cell.x);
            minY = Math.min(minY, cell.y);
            maxX = Math.max(maxX, cell.x);
            maxY = Math.max(maxY, cell.y);
        });

        return {
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }

    /**
     * 检查道具是否适合放入背包的指定位置
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @param {number} bagWidth - 背包宽度
     * @param {number} bagHeight - 背包高度
     * @param {Array} occupied - 已占用的格子数组
     * @returns {boolean} 是否适合
     */
    canFit(x, y, bagWidth, bagHeight, occupied = []) {
        const occupiedSet = new Set(occupied.map(p => `${p.x},${p.y}`));

        for (const cell of this.shape) {
            const px = x + cell.x;
            const py = y + cell.y;

            // 检查边界
            if (px < 0 || px >= bagWidth || py < 0 || py >= bagHeight) {
                return false;
            }

            // 检查是否已被占用
            if (occupiedSet.has(`${px},${py}`)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取道具占用的所有格子坐标
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @returns {Array} 格子坐标数组
     */
    getOccupiedCells(x, y) {
        return this.shape.map(cell => ({
            x: x + cell.x,
            y: y + cell.y
        }));
    }
}

/**
 * 背包类
 */
class Backpack {
    constructor(config) {
        this.width = config.width || 5;
        this.height = config.height || 3;
        this.items = [];  // 已放置的道具列表
        this.slots = [];  // 格子状态：null=空, item=道具对象

        // 初始化格子
        for (let y = 0; y < this.height; y++) {
            this.slots[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.slots[y][x] = null;
            }
        }
    }

    /**
     * 获取所有已占用的格子
     * @returns {Array} 格子坐标数组
     */
    getOccupiedCells() {
        const cells = [];
        this.items.forEach(item => {
            const itemCells = item.item.getOccupiedCells(item.x, item.y);
            cells.push(...itemCells);
        });
        return cells;
    }

    /**
     * 检查指定位置是否被占用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否被占用
     */
    isOccupied(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.slots[y][x] !== null;
    }

    /**
     * 放置道具
     * @param {Item} item - 道具对象
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @returns {boolean} 是否放置成功
     */
    placeItem(item, x, y) {
        const occupied = this.getOccupiedCells();

        if (!item.canFit(x, y, this.width, this.height, occupied)) {
            return false;
        }

        // 占用格子
        const cells = item.getOccupiedCells(x, y);
        cells.forEach(cell => {
            this.slots[cell.y][cell.x] = item;
        });

        // 添加到道具列表
        this.items.push({
            item: item,
            x: x,
            y: y,
            id: `${item.id}_${Date.now()}`
        });

        return true;
    }

    /**
     * 移除道具
     * @param {string} itemId - 道具ID
     * @returns {boolean} 是否移除成功
     */
    removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index === -1) {
            return false;
        }

        const placedItem = this.items[index];

        // 释放格子
        const cells = placedItem.item.getOccupiedCells(placedItem.x, placedItem.y);
        cells.forEach(cell => {
            this.slots[cell.y][cell.x] = null;
        });

        // 从列表中移除
        this.items.splice(index, 1);

        return true;
    }

    /**
     * 清空背包
     */
    clear() {
        this.items = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.slots[y][x] = null;
            }
        }
    }

    /**
     * 获取状态
     * @returns {Object} 状态对象
     */
    getState() {
        return {
            width: this.width,
            height: this.height,
            items: this.items.map(i => ({
                item: {
                    id: i.item.id,
                    name: i.item.name,
                    emoji: i.item.emoji,
                    color: i.item.color,
                    shape: i.item.shape
                },
                x: i.x,
                y: i.y,
                id: i.id
            })),
            slots: this.slots.map(row => row.map(cell => cell ? cell.id : null))
        };
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.Item = Item;
    window.Backpack = Backpack;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Item, Backpack };
}
