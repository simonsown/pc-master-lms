export const headPose = {
  yaw: 0,       // quay đầu trái/phải (-1..1)
  pitch: 0,     // ngẩng/cúi (-1..1)
  roll: 0,      // nghiêng đầu (-1..1)
  x: 0,         // vị trí ngang khuôn mặt trong camera
  active: false,
  detected: false,
};

export const handState = {
  active: false,         // có tay trong camera
  landmarks: null as number[][] | null, // 21 điểm [x,y,z]
  grab: false,           // nắm tay (bắt lấy)
  release: false,        // mở lòng bàn tay (thả)
  pinch: false,          // chụm ngón cái + trỏ
  pointing: false,       // chỉ tay
  x: 0, y: 0,            // vị trí lòng bàn tay (NDC đã lật gương)
  roll: 0,               // xoay cổ tay (góc trên màn hình)
  rotSpeed: 0,           // tốc độ xoay
  wristAngle: 0,
};

export const sceneCtrl = {
  grabHeld: false,       // đang bắt vật
};