// ============================================================
//  ai.js - LOGIC MÁY TÍNH TÁCH RIÊNG
//  Hỗ trợ 3 mức độ khó, tương thích với Items hiệu ứng
// ============================================================
(function () {
  'use strict';

  const AI = {
    _cfg: [
      { speed: 3.2, error: 0.35, react: 0.12 },
      { speed: 5.2, error: 0.18, react: 0.06 },
      { speed: 7.2, error: 0.05, react: 0.02 },
    ],

    update(ai, ball, diff, H, baseSpeed){
      const cfg = this._cfg[Math.min(2, Math.max(0, diff))];
      const speed = baseSpeed || cfg.speed;

      // ✅ Chỉ quan tâm khi bóng bay về phía mình
      if(ball.vx > 0 && Math.random() > cfg.react){
        const target = ball.y - ai.h/2;
        const err = (Math.random() - 0.5) * ai.h * cfg.error * 2;
        const desired = target + err;
        const delta = desired - ai.y;

        if(Math.abs(delta) > 1.5){ // ✅ Giảm ngưỡng để phản ứng nhạy hơn
          const move = Math.sign(delta) * Math.min(Math.abs(delta), speed);
          return Math.max(0, Math.min(H - ai.h, ai.y + move));
        }
      } else if(ball.vx <= 0) {
        // ✅ Khi bóng bay ngược lại → từ từ về giữa sân
        const center = H/2 - ai.h/2;
        const delta = center - ai.y;
        if(Math.abs(delta) > 3){
          return Math.max(0, Math.min(H-ai.h, ai.y + Math.sign(delta)*speed*0.3));
        }
      }

      return ai.y;
    },

    getConfig(diff){
      return this._cfg[Math.min(2, Math.max(0, diff))];
    },
  };

  window.AI = AI;
})();