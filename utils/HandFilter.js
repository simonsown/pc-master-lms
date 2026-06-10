/**
 * utils/HandFilter.js
 *
 * Module lọc nhiễu tọa độ bàn tay cho Web/MediaPipe.
 * - Sử dụng thuật toán One Euro Filter cho việc làm mượt chống độ trễ.
 * - Deadzone: Ngưỡng loại bỏ rung động vi mô.
 * - Hand Lost: Giữ tọa độ khi tay bị rời khỏi khung hình trong thời gian ngắn (300ms).
 */

class LowPassFilter {
    constructor(alpha) {
        this.setAlpha(alpha);
        this.y = null;
        this.s = null;
    }

    setAlpha(alpha) {
        if (alpha <= 0.0 || alpha > 1.0) {
            throw new Error('Alpha must be in (0.0, 1.0]');
        }
        this.alpha = alpha;
    }

    reset() {
        this.y = null;
        this.s = null;
    }

    filter(value) {
        if (this.y === null) {
            this.s = value;
        } else {
            this.s = this.alpha * value + (1.0 - this.alpha) * this.s;
        }
        this.y = value;
        return this.s;
    }

    lastValue() {
        return this.s;
    }
}

class OneEuroFilter {
    constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
        this.xFilter = new LowPassFilter(this.alpha(this.minCutoff));
        this.dxFilter = new LowPassFilter(this.alpha(this.dCutoff));
        this.lastTime = null;
    }

    alphaWithDt(cutoff, dt) {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / dt);
    }

    alpha(cutoff) {
        return this.alphaWithDt(cutoff, 1.0 / 60.0); // fps mặc định
    }

    reset() {
        this.xFilter.reset();
        this.dxFilter.reset();
        this.lastTime = null;
    }

    filter(x) {
        let dx = 0.0;
        let dt = 1.0 / 60.0;

        const now = Date.now();
        if (this.lastTime !== null) {
            dt = (now - this.lastTime) / 1000.0;
            if (dt <= 0) dt = 1e-4; // Tránh lỗi chia cho 0
            dx = (x - this.xFilter.lastValue()) / dt;
        }
        this.lastTime = now;

        const edx = this.dxFilter.filter(dx);
        const cutoff = this.minCutoff + this.beta * Math.abs(edx);

        this.xFilter.setAlpha(this.alphaWithDt(cutoff, dt));
        return this.xFilter.filter(x);
    }
}

export default class HandFilter {
    constructor(config = {}) {
        const {
            minCutoff = 1.0,   // Tần số cắt tối thiểu (mức mượt lúc di chuyển chậm)
            beta = 0.007,      // Mức độ ăn theo lúc di chuyển nhanh
            dCutoff = 1.0,     // Damping cho biến thiên tốc độ
            deadzone = 2.0,    // (pixel) Ngưỡng ngưng cập nhật để diệt rung nhỏ
            lossTimeout = 300  // (ms) Thời gian giữ nguyên con trỏ khi mất tay
        } = config;

        this.filterX = new OneEuroFilter(minCutoff, beta, dCutoff);
        this.filterY = new OneEuroFilter(minCutoff, beta, dCutoff);

        this.deadzone = deadzone;
        this.lossTimeout = lossTimeout;

        this.lastValidPos = null;
        this.lastSeenTime = 0;
        this.isVisible = false;
    }

    /**
     * @param {number|null} rawX - Tọa độ X (pixel). Để null nếu vừa mất track tay.
     * @param {number|null} rawY - Tọa độ Y (pixel).
     * @returns {{x: number, y: number}|null}
     */
    update(rawX, rawY) {
        const now = Date.now();

        // 1. Mất track tay (Hand Lost logic)
        if (rawX === null || rawY === null || rawX === undefined || rawY === undefined) {
            if (this.isVisible && (now - this.lastSeenTime > this.lossTimeout)) {
                this.isVisible = false;
                this.filterX.reset();
                this.filterY.reset();
                this.lastValidPos = null;
            }
            // Trong thời gian 300ms, trả về vị trí cũ (nếu có)
            return this.isVisible ? { x: this.lastValidPos.x, y: this.lastValidPos.y } : null;
        }

        this.isVisible = true;
        this.lastSeenTime = now;

        // 2. Vùng chết (Deadzone logic)
        if (this.lastValidPos) {
            const dx = rawX - this.lastValidPos.rawX;
            const dy = rawY - this.lastValidPos.rawY;
            const dist = Math.hypot(dx, dy);

            // Bỏ qua khung hình nếu xê dịch chưa vượt qua deadzone
            if (dist < this.deadzone) {
                return { x: this.lastValidPos.x, y: this.lastValidPos.y };
            }
        }

        // 3. One Euro Filter
        const filteredX = this.filterX.filter(rawX);
        const filteredY = this.filterY.filter(rawY);

        this.lastValidPos = {
            x: filteredX,
            y: filteredY,
            rawX, // Lưu lại rawX, rawY để tính khoàng cách cho lần Update tiếp theo
            rawY
        };

        return { x: filteredX, y: filteredY };
    }
}
