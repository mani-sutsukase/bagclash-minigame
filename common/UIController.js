/**
 * UI控制器基类
 * 负责管理UI元素的显示、隐藏和交互
 */
class UIController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.elements = {};
        this.visible = true;
    }

    /**
     * 初始化UI
     * @param {Object} config - UI配置
     */
    init(config = {}) {
        this.config = config;
        this.cacheElements();
        this.bindEvents();
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        // 子类实现
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 子类实现
    }

    /**
     * 显示UI
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
        this.visible = true;
    }

    /**
     * 隐藏UI
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        this.visible = false;
    }

    /**
     * 切换显示状态
     */
    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 更新UI内容
     * @param {Object} data - 更新数据
     */
    update(data) {
        // 子类实现
    }

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型（info, success, warning, error）
     * @param {number} duration - 显示时长（毫秒）
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
     * 显示确认对话框
     * @param {string} message - 确认消息
     * @returns {Promise<boolean>}
     */
    confirm(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal confirm-modal">
                    <div class="modal-content">
                        <p>${message}</p>
                        <div class="modal-buttons">
                            <button class="btn btn-primary" id="confirm-yes">确定</button>
                            <button class="btn btn-secondary" id="confirm-no">取消</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('confirm-yes').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            document.getElementById('confirm-no').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }

    /**
     * 显示输入对话框
     * @param {string} message - 提示消息
     * @param {string} defaultValue - 默认值
     * @returns {Promise<string|null>}
     */
    prompt(message, defaultValue = '') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal prompt-modal">
                    <div class="modal-content">
                        <p>${message}</p>
                        <input type="text" id="prompt-input" value="${defaultValue}">
                        <div class="modal-buttons">
                            <button class="btn btn-primary" id="prompt-ok">确定</button>
                            <button class="btn btn-secondary" id="prompt-cancel">取消</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const input = document.getElementById('prompt-input');
            input.focus();

            document.getElementById('prompt-ok').addEventListener('click', () => {
                modal.remove();
                resolve(input.value);
            });

            document.getElementById('prompt-cancel').addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    modal.remove();
                    resolve(input.value);
                }
            });
        });
    }

    /**
     * 添加动画类
     * @param {HTMLElement} element - 元素
     * @param {string} className - 动画类名
     * @param {number} duration - 动画时长
     * @returns {Promise<void>}
     */
    animate(element, className, duration = 300) {
        return new Promise((resolve) => {
            element.classList.add(className);
            setTimeout(() => {
                element.classList.remove(className);
                resolve();
            }, duration);
        });
    }

    /**
     * 淡入元素
     * @param {HTMLElement} element - 元素
     * @param {number} duration - 动画时长
     * @returns {Promise<void>}
     */
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        return this.animate(element, 'fade-in', duration);
    }

    /**
     * 淡出元素
     * @param {HTMLElement} element - 元素
     * @param {number} duration - 动画时长
     * @returns {Promise<void>}
     */
    fadeOut(element, duration = 300) {
        return new Promise((resolve) => {
            this.animate(element, 'fade-out', duration).then(() => {
                element.style.display = 'none';
                element.style.opacity = '1';
                resolve();
            });
        });
    }

    /**
     * 销毁UI
     */
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        this.elements = {};
        this.visible = false;
    }
}

// 导出类（浏览器环境）
window.UIController = UIController;

// Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
