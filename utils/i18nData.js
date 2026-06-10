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
        },
        SSD: {
            title: "Solid State Drive (SSD)",
            desc: "Fast storage for your OS and applications. Much faster than old hard drives.",
            funFact: "NVMe SSDs can reach speeds of 7000 MB/s!"
        },
        PSU: {
            title: "Power Supply Unit (PSU)",
            desc: "Converts power from the wall outlet into usable power for all components.",
            funFact: "A good PSU can last through multiple computer builds!"
        },
        COOLER: {
            title: "CPU Cooler",
            desc: "Keeps your CPU from overheating by dissipating heat through fins and a fan.",
            funFact: "Some high-end coolers can keep a CPU under 30°C at idle!"
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
        },
        SSD: {
            title: "Ổ Cứng Thể Rắn (SSD)",
            desc: "Lưu trữ nhanh cho hệ điều hành và ứng dụng. Nhanh hơn nhiều so với ổ cứng cũ.",
            funFact: "SSD NVMe có thể đạt tốc độ 7000 MB/s!"
        },
        PSU: {
            title: "Bộ Nguồn (PSU)",
            desc: "Chuyển đổi điện từ ổ cắm thành điện năng sử dụng được cho tất cả linh kiện.",
            funFact: "Một PSU tốt có thể dùng được qua nhiều đời máy tính!"
        },
        COOLER: {
            title: "Tản Nhiệt CPU",
            desc: "Giữ cho CPU không bị quá nhiệt bằng cách tản nhiệt qua cánh tản nhiệt và quạt.",
            funFact: "Tản nhiệt cao cấp có thể giữ CPU dưới 30°C ở chế độ chờ!"
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
