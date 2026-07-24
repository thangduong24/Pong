// ============================================================
//  debug.js - BẢNG DEBUG (F3)
//  Chi tiết, nhẹ, không gây lag
// ============================================================
(function () {
    'use strict';
  
    const Debug = {
      s: {
        on: false, panel: null, lastTs: 0, fps: 60, frames: 0, fpsTimer: 0,
        refs: {}, log: [],
      },
  
      init(refs){
        this.s.refs = refs;
        this._buildPanel();
        document.addEventListener('keydown', e=>{
          if(e.key==='F3'){ e.preventDefault(); this.toggle(); }
        });
        console.log('🔧 debug.js đã sẵn sàng — Bấm F3 để mở');
      },
  
      _buildPanel(){
        const p = document.createElement('div');
        p.id = 'pong-debug-panel';
        p.innerHTML = `
          <style>
            #pong-debug-panel{
              position:fixed; top:12px; right:12px; z-index:99998;
              width:300px; max-height:calc(100vh - 24px); overflow-y:auto;
              background: rgba(15,23,42,.92);
              border:1px solid rgba(139,92,246,.3);
              border-radius:14px; padding:14px;
              font-family: ui-monospace, 'JetBrains Mono', monospace;
              font-size:12px; color:#e2e8f0; line-height:1.55;
              display:none; backdrop-filter: blur(8px);
              box-shadow: 0 10px 40px rgba(0,0,0,.4);
            }
            #pong-debug-panel.visible{ display:block; }
            .pdb-title{
              display:flex; align-items:center; justify-content:space-between;
              margin-bottom:10px; padding-bottom:8px;
              border-bottom:1px solid rgba(255,255,255,.08);
            }
            .pdb-title b{ color:#a78bfa; font-size:13px; }
            .pdb-title span{ color:#64748b; font-size:11px; }
            .pdb-section{ margin-bottom:10px; }
            .pdb-section h5{
              color:#a78bfa; text-transform:uppercase; letter-spacing:.1em;
              font-size:10px; margin:0 0 6px;
            }
            .pdb-row{ display:flex; justify-content:space-between; gap:8px; }
            .pdb-k{ color:#94a3b8; }
            .pdb-v{ color:#fff; font-weight:600; }
            .pdb-v.good{ color:#22c55e; }
            .pdb-v.bad{ color:#ef4444; }
            .pdb-v.warn{ color:#fbbf24; }
            .pdb-active-item{
              padding:4px 8px; margin:3px 0; border-radius:6px;
              background:rgba(139,92,246,.12);
              border-left:2px solid #a78bfa;
              font-size:11px;
            }
            .pdb-btns{ display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px; }
            .pdb-btn{
              padding:6px 8px; border-radius:7px;
              background:rgba(255,255,255,.05);
              border:1px solid rgba(255,255,255,.08);
              color:#fff; font-family:inherit; font-size:11px;
              cursor:pointer; transition:background .15s;
            }
            .pdb-btn:hover{ background:rgba(139,92,246,.2); }
            .pdb-btn.danger{ border-color:rgba(239,68,68,.3); color:#fca5a5; }
            .pdb-btn.danger:hover{ background:rgba(239,68,68,.15); }
          </style>
          <div class="pdb-title">
            <b>🔧 DEBUG</b>
            <span>F3 để tắt</span>
          </div>
  
          <div class="pdb-section">
            <h5>📊 Hiệu năng</h5>
            <div class="pdb-row"><span class="pdb-k">FPS</span><span class="pdb-v good" id="pdb-fps">60</span></div>
            <div class="pdb-row"><span class="pdb-k">Frame time</span><span class="pdb-v" id="pdb-ft">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Chất lượng</span><span class="pdb-v" id="pdb-qual">—</span></div>
          </div>
  
          <div class="pdb-section">
            <h5>🎯 Bóng</h5>
            <div class="pdb-row"><span class="pdb-k">Vị trí X</span><span class="pdb-v" id="pdb-bx">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Vị trí Y</span><span class="pdb-v" id="pdb-by">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Vận tốc X</span><span class="pdb-v" id="pdb-bvx">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Vận tốc Y</span><span class="pdb-v" id="pdb-bvy">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Tốc độ</span><span class="pdb-v warn" id="pdb-bsp">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Bán kính</span><span class="pdb-v" id="pdb-br">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Là bom?</span><span class="pdb-v" id="pdb-bomb">—</span></div>
          </div>
  
          <div class="pdb-section">
            <h5>🏓 Vợt</h5>
            <div class="pdb-row"><span class="pdb-k">Bạn Y</span><span class="pdb-v" id="pdb-py">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Bạn H</span><span class="pdb-v" id="pdb-ph">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Máy Y</span><span class="pdb-v" id="pdb-ay">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Máy H</span><span class="pdb-v" id="pdb-ah">—</span></div>
          </div>
  
          <div class="pdb-section">
            <h5>🎮 Trạng thái</h5>
            <div class="pdb-row"><span class="pdb-k">Đang chạy</span><span class="pdb-v" id="pdb-run">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Đếm ngược</span><span class="pdb-v" id="pdb-cd">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Combo</span><span class="pdb-v warn" id="pdb-combo">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Điểm bạn</span><span class="pdb-v good" id="pdb-ps">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Điểm máy</span><span class="pdb-v bad" id="pdb-as">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Độ khó</span><span class="pdb-v" id="pdb-diff">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Sân W×H</span><span class="pdb-v" id="pdb-field">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Vật phẩm rơi</span><span class="pdb-v" id="pdb-items">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Bóng nhân đôi</span><span class="pdb-v" id="pdb-clones">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Bóng ảo</span><span class="pdb-v" id="pdb-ills">—</span></div>
          </div>
  
          <div class="pdb-section">
            <h5>✨ Hiệu ứng hoạt động</h5>
            <div id="pdb-active">
              <span style="color:#64748b">Không có</span>
            </div>
          </div>
  
          <div class="pdb-section">
            <h5>🏆 Thành tựu</h5>
            <div class="pdb-row"><span class="pdb-k">Đã mở khóa</span><span class="pdb-v" id="pdb-ach-got">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Tổng cộng</span><span class="pdb-v" id="pdb-ach-total">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Tiến độ</span><span class="pdb-v warn" id="pdb-ach-pct">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Combo cao nhất</span><span class="pdb-v" id="pdb-ach-combo">—</span></div>
            <div class="pdb-row"><span class="pdb-k">Thắng liên tiếp</span><span class="pdb-v" id="pdb-ach-streak">—</span></div>
            <div class="pdb-btns">
              <button class="pdb-btn" data-db="ach-unlock-all">Mở hết (test)</button>
              <button class="pdb-btn danger" data-db="ach-reset">Reset thành tựu</button>
            </div>
          </div>
  
          <div class="pdb-section">
            <h5>🎛️ Công cụ nhanh</h5>
            <div class="pdb-btns">
              <button class="pdb-btn" data-db="toggle-sfx">SFX</button>
              <button class="pdb-btn" data-db="toggle-trail">Vệt bóng</button>
              <button class="pdb-btn" data-db="toggle-shake">Rung</button>
              <button class="pdb-btn" data-db="toggle-ghost">Bóng lẫn</button>
              <button class="pdb-btn" data-db="spawn-item">Thả vật phẩm</button>
              <button class="pdb-btn" data-db="spawn-gacha">Thả gacha</button>
              <button class="pdb-btn" data-db="add-p">+1 điểm bạn</button>
              <button class="pdb-btn" data-db="add-a">+1 điểm máy</button>
              <button class="pdb-btn danger" data-db="clear-items">Xóa vật phẩm</button>
              <button class="pdb-btn danger" data-db="reset-all">Reset tất cả</button>
            </div>
          </div>
        `;
        document.body.appendChild(p);
        this.s.panel = p;
  
        p.addEventListener('click', e=>{
          const b = e.target.closest('[data-db]');
          if(!b) return;
          this._handleAction(b.dataset.db);
        });
      },
  
      _handleAction(a){
        const r=this.s.refs;
        switch(a){
          case 'toggle-sfx':
            if(window.Menu){ Menu.s.sfxOn = !Menu.s.sfxOn; Menu._saveSettings(); }
            break;
          case 'toggle-trail':
            if(window.Items){ Items.cfg.TRAIL = !Items.cfg.TRAIL; Items.s.trail = []; }
            break;
          case 'toggle-shake':
            if(window.Items) Items.cfg.SHAKE = !Items.cfg.SHAKE;
            break;
          case 'toggle-ghost':
            if(window.Items) Items.cfg.GHOST = !Items.cfg.GHOST;
            break;
          case 'spawn-item':
            if(window.Items) Items.spawn();
            break;
          case 'spawn-gacha':
            if(window.Gacha) Gacha.spawn();
            break;
          case 'add-p':
            r.game.pS++; r.pEl.textContent = r.game.pS;
            break;
          case 'add-a':
            r.game.aS++; r.aEl.textContent = r.game.aS;
            break;
          case 'clear-items':
            if(window.Items){ Items.s.list=[]; Items.s.active=[]; Items.s.illusions=[]; Items.s.clones=[]; }
            if(window.Gacha){ Gacha.s.box=null; Gacha.s.active=[]; }
            break;
          case 'ach-unlock-all':
            if(window.Achieve && confirm('Mở khóa TẤT CẢ thành tựu? (chỉ để test)')){
              Achieve.getList().forEach(a => Achieve.s.unlocked.add(a.id));
              Achieve._save();
            }
            break;
          case 'ach-reset':
            if(window.Achieve && confirm('XÓA TẤT CẢ tiến độ thành tựu?')){
              Achieve.s.unlocked = new Set();
              Achieve.s._stats = {
                totalWin:0, maxCombo:0, totalItem:0, totalGacha:0,
                itemTypes:new Set(), itemCount:{}, gachaGoodCount:0, gachaRareMax:0,
                winNoLose:0, perfectWin:0, hardWin:0, paddleShortWin:0, bombHit:0,
                cloneWin:0, speedWin:0, surviveBad:0, winUnder20s:0, comeBackWin:0,
                winStreak:0, winByDiff:{0:0,1:0,2:0}, currentMaxBallSpeed:0,
              };
              Achieve._save();
            }
            break;
          case 'reset-all':
            if(r.resetGame) r.resetGame(); // Reset game TRƯỚC
            if(window.Items) Items.resetAll();
            if(window.Gacha) Gacha.resetAll();
            if(r.resetGame) r.resetGame();
            break;
        }
      },
  
      // ===== CẬP NHẬT MỖI FRAME =====
      update(ts){
        if(!this.s.on) return;
        const s=this.s, r=s.refs;
  
        // Tính FPS
        s.frames++;
        if(ts - s.fpsTimer >= 500){
          s.fps = Math.round(s.frames * 1000 / (ts - s.fpsTimer));
          s.frames = 0; s.fpsTimer = ts;
        }
        const ft = ts - s.lastTs;
        s.lastTs = ts;
  
        const p = s.panel;
        const set = (id, v, cls) => {
          const el = p.querySelector('#'+id);
          if(el){ el.textContent = v; el.className = 'pdb-v'+(cls?' '+cls:''); }
        };
  
        set('fps', s.fps, s.fps>=55?'good':(s.fps>=30?'warn':'bad'));
        set('ft', Math.round(ft*10)/10 + 'ms');
        set('qual', window.Menu ? Menu.s.quality : '—');
  
        if(r.ball){
          set('bx', Math.round(r.ball.x));
          set('by', Math.round(r.ball.y));
          set('bvx', r.ball.vx.toFixed(2));
          set('bvy', r.ball.vy.toFixed(2));
          set('bsp', Math.hypot(r.ball.vx, r.ball.vy).toFixed(2));
          set('br', r.ball.r);
          set('bomb', window.Items && Items.s.isBomb ? 'CÓ 💣' : 'Không', window.Items && Items.s.isBomb ? 'bad' : '');
        }
  
        if(r.player){ set('py', Math.round(r.player.y)); set('ph', r.player.h); }
        if(r.ai){ set('ay', Math.round(r.ai.y)); set('ah', r.ai.h); }
  
        if(r.game){
          // ✅ SỬA: dùng đúng tên biến .run (không phải .running)
          set('run', r.game.run ? '▶ Đang chạy' : '⏸ Dừng', r.game.run ? 'good' : 'warn');
          set('cd', window.Items && Items.cdOn() ? Items.s.cd : 'Không');
          set('combo', window.Items ? Items.gb() : '—', window.Items && Items.gb()>=3 ? 'warn' : '');
          set('ps', r.game.pS); set('as', r.game.aS);
          set('diff', ['Dễ','Trung bình','Khó'][r.game.diff]);
          set('field', window.Items ? Items.s.curW+'×'+Items.s.curH : '—');
        }
  
        set('items', window.Items ? Items.s.list.length : '—');
        set('clones', window.Items ? Items.s.clones.filter(c=>c.alive).length : '—');
        set('ills', window.Items ? Items.s.illusions.length : '—');
  
        // Liệt kê hiệu ứng hoạt động
        const act = p.querySelector('#pdb-active');
        const items = [];
        if(window.Items){
          const now = Date.now();
          Items.s.active.forEach(e=>{
            const tp = Items._db.find(x=>x.id===e.id);
            if(!tp) return;
            const left = Math.max(0, Math.round((e.end-now)/100)/10);
            items.push(`<div class="pdb-active-item"><b style="color:${tp.c}">${tp.e} ${tp.n}</b> · ${left}s</div>`);
          });
          ['stun','slow','fast'].forEach(k=>{
            ['player','ai'].forEach(w=>{
              if(Items.s[k][w]>0){
                const name = {stun:'💫 Choáng', slow:'🕸️ Chậm', fast:'🚀 Nhanh'}[k];
                const side = w==='player'?'Bạn':'Máy';
                items.push(`<div class="pdb-active-item">${name} <b>${side}</b> · ${(Items.s[k][w]/1000).toFixed(1)}s</div>`);
              }
            });
          });
        }
        act.innerHTML = items.length ? items.join('') : '<span style="color:#64748b">Không có</span>';
  
        // ✅ ĐÃ DI CHUYỂN vào đúng trong update(): cập nhật thành tựu
        if(window.Achieve){
          const got = Achieve.getUnlocked().length;
          const total = Achieve.getList().length;
          set('pdb-ach-got', got);
          set('pdb-ach-total', total);
          set('pdb-ach-pct', Math.round(got/total*100)+'%');
          set('pdb-ach-combo', Achieve.getStats().maxCombo);
          set('pdb-ach-streak', Achieve.getStats().winStreak);
        }
      },
  
      toggle(){
        this.s.on = !this.s.on;
        this.s.panel.classList.toggle('visible', this.s.on);
        if(this.s.on){ this.s.fpsTimer = performance.now(); this.s.frames = 0; }
      },
      isOn(){ return this.s.on; },
    };
  
    window.Debug = Debug;
  })();