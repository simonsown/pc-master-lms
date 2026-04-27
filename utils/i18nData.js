export const COMPONENT_DATA = {
    en: {
        CPU: {
            title: "Central Processing Unit (CPU)",
            desc: "The 'brain' of the computer. It executes instructions and processes data.",
            funFact: "Modern CPUs can execute billions of instructions per second!"
        },
        RAM: {
            title: "Random Access Memory (RAM)",
            desc: "Short-term memory. It stores data that the CPU needs to access quickly.",
            funFact: "More RAM allows you to run more applications simultaneously."
        },
        GPU: {
            title: "Graphics Processing Unit (GPU)",
            desc: "Renders images, video, and games. Essential for gaming and creative work.",
            funFact: "GPUs are also used for training Artificial Intelligence models!"
        }
    },
    vn: {
        CPU: {
            title: "Bộ Vi Xử Lý (CPU)",
            desc: "Bộ não của máy tính. Nó thực hiện các lệnh và xử lý dữ liệu.",
            funFact: "CPU hiện đại có thể thực hiện hàng tỷ lệnh mỗi giây!"
        },
        RAM: {
            title: "Bộ Nhớ Truy Cập Ngẫu Nhiên (RAM)",
            desc: "Bộ nhớ tạm thời. Lưu trữ dữ liệu mà CPU cần truy cập nhanh.",
            funFact: "Nhiều RAM hơn giúp bạn chạy nhiều ứng dụng cùng lúc."
        },
        GPU: {
            title: "Card Đồ Họa (GPU)",
            desc: "Xử lý hình ảnh, video và game. Cần thiết cho chơi game và đồ họa.",
            funFact: "GPU cũng được dùng để huấn luyện Trí Tuệ Nhân Tạo (AI)!"
        }
    }
};

export const GURU_MESSAGES = {
    en: {
        welcome: "Welcome, Builder! Use your hand to pick up components.",
        grabbed: (item) => `You've got the ${item}. Locate the glowing green socket on the motherboard.`,
        placed: (item) => `Excellent work! The ${item} is installed correctly.`
    },
    vn: {
        welcome: "Chào bạn! Hãy dùng tay để gắp các linh kiện nhé.",
        grabbed: (item) => `Bạn đang cầm ${item}. Hãy tìm khe cắm phát sáng màu xanh trên mainboard.`,
        placed: (item) => `Tuyệt vời! ${item} đã được lắp đúng vị trí.`
    }
};
