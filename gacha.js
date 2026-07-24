// ============================================================
//  gacha.js - HỆ THỐNG HỘP MAY RỦI CHO PONG
// ============================================================
(function () {
  'use strict';

  const Gacha = {
    s: {
      ctx: null, W: 600, H: 400,
      box: null,
      active: [],
      player: null, ai: null, ball: null,
      pScore: null, aScore: null,
      _t: 0,
    },

    _pool: [
      { id:'g_long',    good:true,  rarity:1, name:'VỢT DÀI +25%', color:'#22c55e', dur:8000,
        apply:(s)=>{
          // ✅ Lưu chiều cao HIỆN TẠI (có thể đã bị Items thay đổi)
          s.player._gachaSavedH = s.player.h;
          s.player.h = Math.round(s.player.h * 1.25);
        },
        end:  (s)=>{
          // ✅ Chỉ hoàn tác nếu Items KHÔNG có paddleLen đang chạy
          if(window.Items && Items.s.active.some(e=>e.id==='paddleLen')) return;
          if(s.player._gachaSavedH){ s.player.h = s.player._gachaSavedH; delete s.player._gachaSavedH; }
          else s.player.h = 80;
          s.player.y = Math.max(0, Math.min(Gacha.s.H - s.player.h, s.player.y));
        } },
      { id:'g_slow',    good:true,  rarity:1, name:'BÓNG CHẬM -20%', color:'#3b82f6', dur:6000,
        apply:(s)=>{ s.ball.vx*=0.8; s.ball.vy*=0.8; },
        end:  ()=>{} },
      { id:'g_swap',    good:true,  rarity:2, name:'🔄 ĐỔI ĐIỂM!', color:'#a855f7', dur:0,
        apply:(s)=>{ const t=s.pScore.v; s.pScore.v=s.aScore.v; s.aScore.v=t; s.pScore.el.textContent=s.pScore.v; s.aScore.el.textContent=s.aScore.v; },
        end:  ()=>{} },
      { id:'g_dup',     good:true,  rarity:2, name:'✌️ BÓNG NHÂN ĐÔI', color:'#10b981', dur:0,
        apply:(s)=>{ if(window.Items){const ang=Math.atan2(s.ball.vy,s.ball.vx)+.06,sp=Math.hypot(s.ball.vx,s.ball.vy);Items.s.clones.push({x:s.ball.x,y:s.ball.y,r:s.ball.r,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,alive:true});} },
        end:  ()=>{} },
      { id:'g_plus2',   good:true,  rarity:3, name:'💎 +2 ĐIỂM NGAY!', color:'#fbbf24', dur:0,
        apply:(s)=>{ s.pScore.v+=2; s.pScore.el.textContent=s.pScore.v; },
        end:  ()=>{} },
      { id:'g_xlong',   good:true,  rarity:3, name:'💎 VỢT DÀI GẤP ĐÔI', color:'#fbbf24', dur:8000,
        apply:(s)=>{
          s.player._gachaSavedH = s.player.h;
          s.player.h = Math.min(200, Math.round(s.player.h * 2));
        },
        end:  (s)=>{
          if(window.Items && Items.s.active.some(e=>e.id==='paddleLen')) return;
          if(s.player._gachaSavedH){ s.player.h = s.player._gachaSavedH; delete s.player._gachaSavedH; }
          else s.player.h = 80;
          s.player.y = Math.max(0, Math.min(Gacha.s.H - s.player.h, s.player.y));
        } },

      // ——— XẤU ———
      { id:'g_short',   good:false, rarity:1, name:'VỢT NGẮN -25%', color:'#ef4444', dur:8000,
        apply:(s)=>{
          s.player._gachaSavedH = s.player.h;
          s.player.h = Math.max(35, Math.round(s.player.h * 0.75));
        },
        end:  (s)=>{
          if(window.Items && Items.s.active.some(e=>e.id==='paddleLen')) return;
          if(s.player._gachaSavedH){ s.player.h = s.player._gachaSavedH; delete s.player._gachaSavedH; }
          else s.player.h = 80;
          s.player.y = Math.max(0, Math.min(Gacha.s.H - s.player.h, s.player.y));
        } },
      { id:'g_fast',    good:false, rarity:1, name:'BÓNG NHANH +20%', color:'#ef4444', dur:6000,
        apply:(s)=>{ s.ball.vx*=1.2; s.ball.vy*=1.2; },
        end:  ()=>{} },
      { id:'g_plus1ai', good:false, rarity:2, name:'💔 ĐỐI THỦ +1', color:'#dc2626', dur:0,
        apply:(s)=>{ s.aScore.v++; s.aScore.el.textContent=s.aScore.v; },
        end:  ()=>{} },
      { id:'g_stun',    good:false, rarity:2, name:'💫 BỊ CHOÁNG 1.5s', color:'#dc2626', dur:0,
        apply:(s)=>{ if(window.Items) Items.s.stun.player = 1500; },
        end:  ()=>{} },
      { id:'g_minus1',  good:false, rarity:3, name:'☠️ -1 ĐIỂM', color:'#991b1b', dur:0,
        apply:(s)=>{ s.pScore.v=Math.max(0,s.pScore.v-1); s.pScore.el.textContent=s.pScore.v; },
        end:  ()=>{} },
      { id:'g_aiboost', good:false, rarity:3, name:'☠️ ĐỐI THỦ CỰC TỐC', color:'#991b1b', dur:5000,
        apply:(s)=>{ if(window.Items) Items.s.fast.ai = 5000; },
        end:  ()=>{} },
    ],

    init(ctx, W, H, refs){
      this.s.ctx=ctx; this.s.W=W; this.s.H=H;
      Object.assign(this.s, refs);
      console.log('🎰 gacha.js đã sẵn sàng (đã sửa trùng lặp Items)');
    },

    spawn(){
      if(this.s.box) return;
      this.s.box = {
        x: 80 + Math.random()*(this.s.W-160),
        y: -30, vy: 1.2, r: 18, rot: 0,
        pulse: 0,
      };
    },

    update(dt){
      const s=this.s;
      s._t += dt;
      if(s._t > 12000 + Math.random()*6000){ s._t=0; this.spawn(); }

      if(s.box){
        s.box.y += s.box.vy;
        s.box.rot += 0.04;
        s.box.pulse += 0.15;
        if(s.box.y > s.H + 40) s.box = null;
      }

      const n=Date.now();
      s.active = s.active.filter(e=>{
        if(n >= e.end){ e.eff.end(s); return false; }
        return true;
      });
    },

    check(ball){
      if(!this.s.box) return null;
      const b = this.s.box;
      if(Math.abs(ball.x-b.x) < ball.r+b.r && Math.abs(ball.y-b.y) < ball.r+b.r){
        const eff = this._roll();
        this._apply(eff);
        this.s.box = null;
        return eff;
      }
      return null;
    },

    _roll(){
      const r = Math.random()*100;
      let rarity;
      if(r < 60) rarity = 1;
      else if(r < 90) rarity = 2;
      else rarity = 3;
      
      const wantGood = Math.random() > 0.5;
      const pool = this._pool.filter(e => e.rarity===rarity && e.good===wantGood);
      return pool.length ? pool[Math.floor(Math.random()*pool.length)] 
                         : this._pool[Math.floor(Math.random()*this._pool.length)];
    },

    _apply(eff){
      const s=this.s;
      eff.apply(s);
      if(eff.dur > 0){
        s.active.push({eff, end: Date.now()+eff.dur});
      }
      this._showText(eff);
      if(window.Items) Items.shake(eff.good?8:14, eff.good?300:500);
      if(window.Achieve) { Achieve.onGachaOpen('player', eff.good, eff.rarity); Achieve.check(); }
    },

    _showText(eff){
      if(window.Items){
        const x = this.s.W/2;
        Items.float(
          (eff.good?'✨ ':'💥 ') + eff.name,
          x, this.s.H/2 - 40,
          eff.color
        );
        Items.float(
          eff.rarity===3?'💎 SIÊU HIẾM':(eff.rarity===2?'⭐ HIẾM':''),
          x, this.s.H/2 - 15,
          eff.rarity===3?'#fbbf24':'#fff'
        );
      }
    },

    // ✅ RESET KHÔNG GHI ĐÈ ITEMS
    resetAll(){
      const s=this.s;
      s.active.forEach(e => e.eff.end(s));
      s.active = [];
      s.box = null;
      s._t = 0;
      // ✅ Chỉ reset vợt nếu Items KHÔNG có hiệu ứng nào
      if(s.player && (!window.Items || !Items.s.active.some(e=>e.id==='paddleLen'))){
        s.player.h = 80;
        delete s.player._gachaSavedH;
      }
      console.log('🧹 Gacha đã reset (đã sửa không đè Items)');
    },

    draw(){
      const s=this.s, c=s.ctx;
      if(!s.box) return;
      const b = s.box;
      const sc = 1 + Math.sin(b.pulse)*0.08;
      
      c.save();
      c.translate(b.x, b.y);
      c.rotate(b.rot);
      c.scale(sc, sc);
      
      const grd = c.createRadialGradient(0,0,2,0,0,b.r*2);
      grd.addColorStop(0,'rgba(251,191,36,0.6)');
      grd.addColorStop(1,'rgba(251,191,36,0)');
      c.fillStyle = grd;
      c.beginPath(); c.arc(0,0,b.r*2,0,Math.PI*2); c.fill();
      
      c.fillStyle = '#fbbf24';
      c.strokeStyle = '#b45309';
      c.lineWidth = 2;
      c.shadowColor = '#fbbf24'; c.shadowBlur = 20;
      c.beginPath();
      c.rect(-b.r, -b.r, b.r*2, b.r*2);
      c.fill(); c.stroke();
      
      c.fillStyle = '#dc2626';
      c.fillRect(-b.r, -4, b.r*2, 8);
      c.fillRect(-4, -b.r, 8, b.r*2);
      
      c.shadowBlur = 0;
      c.fillStyle = '#fff';
      c.font = 'bold 18px Arial';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('?', 0, 0);
      
      c.restore();
    },
  };

  window.Gacha = Gacha;
})();