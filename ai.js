// ============================================================
//  ai.js - LOGIC MÁY TÍNH TÁCH RIÊNG
//  Hỗ trợ 3 mức độ khó, tương thích với Items hiệu ứng
// ============================================================
(function () {
    'use strict';
  
    const AI = {
      // Cấu hình độ khó: [tốc độ, sai số, phản ứng chậm]
      _cfg: [
        { speed: 3.2, error: 0.35, react: 0.12 },  // Dễ
        { speed: 5.2, error: 0.18, react: 0.06 },  // Trung bình
        { speed: 7.2, error: 0.05, react: 0.02 },  // Khó
      ],
  
      /**
       * Tính toán vị trí Y mới cho vợt máy
       * @param {Object} ai - Đối tượng vợt máy {x, y, w, h}
       * @param {Object} ball - Đối tượng bóng {x, y, vx, vy, r}
       * @param {number} diff - Mức độ khó (0/1/2)
       * @param {number} H - Chiều cao sân
       * @param {number} baseSpeed - Tốc độ cơ bản (từ Items.getSpeed)
       * @returns {number} Vị trí Y mới
       */
      update(ai, ball, diff, H, baseSpeed){
        const cfg = this._cfg[Math.min(2, Math.max(0, diff))];
        const speed = baseSpeed || cfg.speed;
  
        // Máy chỉ quan tâm khi bóng bay về phía mình (vx > 0)
        // Thêm độ trễ phản ứng theo mức khó
        if(ball.vx > 0 && Math.random() > cfg.react){
          // Dự đoán vị trí bóng + thêm sai số ngẫu nhiên
          const target = ball.y - ai.h/2;
          const err = (Math.random() - 0.5) * ai.h * cfg.error * 2;
          const desired = target + err;
          const delta = desired - ai.y;
  
          if(Math.abs(delta) > 2){
            const move = Math.sign(delta) * Math.min(Math.abs(delta), speed);
            return Math.max(0, Math.min(H - ai.h, ai.y + move));
          }
        }
  
        return ai.y;
      },
  
      // Lấy cấu hình chi tiết
      getConfig(diff){
        return this._cfg[Math.min(2, Math.max(0, diff))];
      },
    };
  
    window.AI = AI;
  })();