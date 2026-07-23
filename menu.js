// ============================================================
//  menu.js - MENU CHÍNH + CÀI ĐẶT + HƯỚNG DẪN
//  Hoàn toàn độc lập, chỉ cần gọi 1 hàm từ script.js
// ============================================================
(function () {
    'use strict';
  
    const Menu = {
      s: {
        onPlay: null, sfxOn: true, musicOn: false,
        sfxVol: 0.7, musicVol: 0.4,
        quality: 'high', trailOn: true, ghostOn: false, shakeOn: true, particlesOn: true,
        defaultDiff: 0, baseSpeed: 5.5, winScore: 5,
        overlay: null, musicNode: null,
      },
  
      init(callbacks){
        this.s.onPlay = callbacks.onPlay;
        this._loadSettings();
        this._buildUI();
        this._bindEvents();
        this.show('main');
        console.log('🎨 menu.js — đã thêm trang thành tựu + reset settings');
      },
  
      _saveSettings(){
        const save = {};
        ['sfxOn','musicOn','sfxVol','musicVol','quality','trailOn','ghostOn','shakeOn','particlesOn','defaultDiff','baseSpeed','winScore']
          .forEach(k => save[k] = this.s[k]);
        localStorage.setItem('pong_menu_settings', JSON.stringify(save));
      },
      _loadSettings(){
        try{
          const s = JSON.parse(localStorage.getItem('pong_menu_settings'));
          if(s) Object.assign(this.s, s);
        }catch(e){}
      },
  
      _buildUI(){
        const ov = document.createElement('div');
        ov.id = 'pong-menu-overlay';
        ov.innerHTML = `
          <style>
            #pong-menu-overlay{
              position:fixed; inset:0; z-index:99999;
              background: linear-gradient(135deg, rgba(15,23,42,.96) 0%, rgba(30,27,75,.96) 100%);
              backdrop-filter: blur(14px);
              font-family: 'Urbanist', system-ui, sans-serif;
              color:#fff; display:flex; align-items:center; justify-content:center;
            }
            #pong-menu-overlay.hidden{ display:none; }
            .pm-container{
              width: min(620px, 92vw); max-height: 92vh; overflow-y:auto;
              background: rgba(255,255,255,.04);
              border: 1px solid rgba(255,255,255,.08);
              border-radius: 24px; padding: 36px 32px;
              box-shadow: 0 30px 80px rgba(139,92,246,.25);
            }
            .pm-logo{ text-align:center; margin-bottom:28px; }
            .pm-logo h1{
              font-size:52px; font-weight:800; margin:0; letter-spacing:-2px;
              background: linear-gradient(100deg,#a78bfa,#f472b6);
              -webkit-background-clip:text; background-clip:text; color:transparent;
            }
            .pm-logo p{ color:#94a3b8; margin:6px 0 0; font-size:14px; }
            .pm-view{ display:none; animation: pmFade .35s ease; }
            .pm-view.active{ display:block; }
            @keyframes pmFade{ from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
            .pm-btn{
              display:block; width:100%; padding:14px 20px; margin-bottom:10px;
              border-radius:14px; border:1px solid rgba(255,255,255,.08);
              background: rgba(255,255,255,.04); color:#fff;
              font-size:16px; font-weight:600; cursor:pointer;
              transition: all .18s ease; font-family:inherit;
            }
            .pm-btn:hover{ background: rgba(139,92,246,.18); border-color:rgba(139,92,246,.4); transform:translateY(-1px); }
            .pm-btn.primary{
              background: linear-gradient(100deg,#8b5cf6,#ec4899);
              border-color:transparent;
            }
            .pm-btn.primary:hover{ filter:brightness(1.1); }
            .pm-btn.ghost{ background:transparent; }
            .pm-btn.small{ padding:8px 14px; font-size:13px; display:inline-block; width:auto; }
            .pm-btn.danger{ border-color:rgba(239,68,68,.3); color:#fca5a5; }
            .pm-btn.danger:hover{ background:rgba(239,68,68,.12); }
            .pm-back{
              display:inline-flex; align-items:center; gap:6px;
              background:none; border:none; color:#94a3b8; cursor:pointer;
              padding:0; margin-bottom:18px; font-size:14px; font-family:inherit;
              transition:color .15s;
            }
            .pm-back:hover{ color:#fff; }
            .pm-section{ margin-bottom:22px; }
            .pm-section h3{
              font-size:13px; text-transform:uppercase; letter-spacing:.12em;
              color:#a78bfa; margin:0 0 12px; font-weight:700;
              display:flex; justify-content:space-between; align-items:center;
            }
            .pm-row{
              display:flex; align-items:center; justify-content:space-between;
              padding:10px 0; border-bottom:1px solid rgba(255,255,255,.05);
              gap:16px;
            }
            .pm-row:last-child{ border-bottom:none; }
            .pm-label{ font-size:14px; color:#e2e8f0; }
            .pm-label small{ display:block; color:#64748b; font-size:12px; margin-top:2px; }
            .pm-toggle{
              width:44px; height:24px; border-radius:999px;
              background:#334155; position:relative; cursor:pointer;
              transition:background .2s; flex-shrink:0;
            }
            .pm-toggle.on{ background:#8b5cf6; }
            .pm-toggle::after{
              content:''; position:absolute; top:3px; left:3px;
              width:18px; height:18px; border-radius:50%; background:#fff;
              transition:transform .2s;
            }
            .pm-toggle.on::after{ transform:translateX(20px); }
            .pm-slider{
              width:140px; height:5px; border-radius:999px;
              background:#334155; outline:none; -webkit-appearance:none;
            }
            .pm-slider::-webkit-slider-thumb{
              -webkit-appearance:none; width:16px; height:16px; border-radius:50%;
              background:#a78bfa; cursor:pointer;
            }
            .pm-select{
              padding:7px 12px; border-radius:10px;
              background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
              color:#fff; font-family:inherit; font-size:13px; cursor:pointer;
            }
            .pm-select option{ background:#1e1b4b; color:#fff; }
  
            /* ===== TRANG THÀNH TỰU ===== */
            .pm-achieve-stats{
              display:grid; grid-template-columns:repeat(4,1fr); gap:8px;
              margin-bottom:16px;
            }
            .pm-ach-stat{
              background:rgba(255,255,255,.04); border-radius:10px;
              padding:10px 6px; text-align:center;
              border:1px solid rgba(255,255,255,.06);
            }
            .pm-ach-stat b{ display:block; font-size:20px; color:#fbbf24; }
            .pm-ach-stat span{ font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; }
            .pm-progress{
              height:8px; background:rgba(255,255,255,.08); border-radius:999px;
              overflow:hidden; margin-bottom:18px;
            }
            .pm-progress-bar{
              height:100%; background:linear-gradient(90deg,#a78bfa,#fbbf24);
              transition:width .5s ease; border-radius:999px;
            }
            .pm-ach-filter{ display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap; }
            .pm-ach-filter button{
              padding:5px 12px; border-radius:999px; font-size:12px;
              background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
              color:#94a3b8; cursor:pointer; font-family:inherit; transition:all .15s;
            }
            .pm-ach-filter button.active, .pm-ach-filter button:hover{
              background:rgba(139,92,246,.2); border-color:rgba(139,92,246,.4); color:#fff;
            }
            .pm-ach-list{ max-height:50vh; overflow-y:auto; padding-right:6px; }
            .pm-ach-item{
              display:flex; align-items:center; gap:12px;
              padding:10px 12px; margin-bottom:6px;
              border-radius:10px; border:1px solid rgba(255,255,255,.06);
              background:rgba(255,255,255,.02);
              transition:all .15s;
            }
            .pm-ach-item.unlocked{
              background:rgba(251,191,36,.08); border-color:rgba(251,191,36,.3);
            }
            .pm-ach-item.locked{ opacity:.55; }
            .pm-ach-icon{
              width:36px; height:36px; border-radius:10px; flex-shrink:0;
              display:flex; align-items:center; justify-content:center;
              font-size:18px;
            }
            .pm-ach-item.unlocked .pm-ach-icon{ background:rgba(251,191,36,.2); }
            .pm-ach-item.locked .pm-ach-icon{ background:rgba(255,255,255,.05); filter:grayscale(1); }
            .pm-ach-info{ flex:1; min-width:0; }
            .pm-ach-info b{ display:block; font-size:13px; color:#fff; }
            .pm-ach-info span{ font-size:11px; color:#94a3b8; }
            .pm-ach-lv{
              font-size:10px; padding:2px 7px; border-radius:6px;
              background:rgba(255,255,255,.06); color:#cbd5e1; flex-shrink:0;
            }
          </style>
  
          <div class="pm-container">
            <!-- ===== MENU CHÍNH ===== -->
            <div id="pm-main" class="pm-view active">
              <div class="pm-logo">
                <h1>PONG</h1>
                <p>Classic · Items · Gacha · Achievements</p>
              </div>
              <button class="pm-btn primary" data-action="play">▶ Bắt đầu chơi</button>
              <button class="pm-btn" data-action="goto-settings">⚙️ Cài đặt</button>
              <button class="pm-btn" data-action="goto-achievements">🏆 Thành tựu</button>
              <button class="pm-btn" data-action="goto-tutorial">📖 Hướng dẫn & Chi tiết</button>
            </div>
  
            <!-- ===== CÀI ĐẶT ===== -->
            <div id="pm-settings" class="pm-view">
              <button class="pm-back" data-action="goto-main">← Quay lại</button>
              <div class="pm-section">
                <h3>🔊 Âm thanh</h3>
                <div class="pm-row">
                  <div class="pm-label">Hiệu ứng (SFX)<small>Âm thanh đánh bóng, ghi điểm</small></div>
                  <div class="pm-toggle" data-setting="sfxOn"></div>
                </div>
                <div class="pm-row">
                  <div class="pm-label">Âm lượng SFX</div>
                  <input type="range" class="pm-slider" data-setting="sfxVol" min="0" max="1" step="0.05" value="0.7">
                </div>
                <div class="pm-row">
                  <div class="pm-label">Nhạc nền<small>Tạo không khí thư giãn</small></div>
                  <div class="pm-toggle" data-setting="musicOn"></div>
                </div>
                <div class="pm-row">
                  <div class="pm-label">Âm lượng nhạc</div>
                  <input type="range" class="pm-slider" data-setting="musicVol" min="0" max="1" step="0.05" value="0.4">
                </div>
              </div>
  
              <div class="pm-section">
                <h3>🖼️ Đồ họa</h3>
                <div class="pm-row">
                  <div class="pm-label">Chất lượng<small>Ảnh hưởng hiệu ứng & bóng</small></div>
                  <select class="pm-select" data-setting="quality">
                    <option value="low">Thấp (tối ưu tốc độ)</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao (đẹp nhất)</option>
                  </select>
                </div>
                <div class="pm-row">
                  <div class="pm-label">Vệt bóng<small>Đường sáng theo sau bóng</small></div>
                  <div class="pm-toggle" data-setting="trailOn"></div>
                </div>
                <div class="pm-row">
                  <div class="pm-label">Bóng lẫn<small>Bóng biến mất từng lúc (khó)</small></div>
                  <div class="pm-toggle" data-setting="ghostOn"></div>
                </div>
                <div class="pm-row">
                  <div class="pm-label">Hiệu ứng hạt<small>Nổ màu khi mở hộp</small></div>
                  <div class="pm-toggle" data-setting="particlesOn"></div>
                </div>
                <div class="pm-row">
                  <div class="pm-label">Rung màn hình<small>Khi đánh mạnh / ghi điểm</small></div>
                  <div class="pm-toggle" data-setting="shakeOn"></div>
                </div>
              </div>
  
              <div class="pm-section">
                <h3>🎮 Trò chơi</h3>
                <div class="pm-row">
                  <div class="pm-label">Độ khó mặc định</div>
                  <select class="pm-select" data-setting="defaultDiff">
                    <option value="0">Dễ</option>
                    <option value="1">Trung bình</option>
                    <option value="2">Khó</option>
                  </select>
                </div>
                <div class="pm-row">
                  <div class="pm-label">Tốc độ bóng cơ bản<small><span id="pm-speed-val">5.5</span></small></div>
                  <input type="range" class="pm-slider" data-setting="baseSpeed" min="3" max="9" step="0.5" value="5.5">
                </div>
                <div class="pm-row">
                  <div class="pm-label">Điểm để thắng<small><span id="pm-win-val">5</span> điểm</small></div>
                  <input type="range" class="pm-slider" data-setting="winScore" min="3" max="15" step="1" value="5">
                </div>
              </div>
  
              <div class="pm-section">
                <h3>🛠️ Quản lý</h3>
                <button class="pm-btn small danger" data-action="reset-settings">🔄 Đặt lại cài đặt mặc định</button>
              </div>
            </div>
  
            <!-- ===== THÀNH TỰU ===== -->
            <div id="pm-achievements" class="pm-view">
              <button class="pm-back" data-action="goto-main">← Quay lại</button>
              
              <div class="pm-achieve-stats" id="pm-ach-stats"></div>
              <div class="pm-progress"><div class="pm-progress-bar" id="pm-ach-bar" style="width:0%"></div></div>
              
              <div class="pm-ach-filter">
                <button class="active" data-filter="all">Tất cả</button>
                <button data-filter="unlocked">Đã mở khóa</button>
                <button data-filter="locked">Chưa mở khóa</button>
                <button data-filter="easy">🟢 Dễ</button>
                <button data-filter="medium">🟡 TBình</button>
                <button data-filter="hard">🟠 Khó</button>
                <button data-filter="extreme">🔴 Siêu</button>
              </div>
              
              <div class="pm-ach-list" id="pm-ach-list"></div>
            </div>
  
            <!-- ===== HƯỚNG DẪN ===== -->
            <div id="pm-tutorial" class="pm-view">
              <button class="pm-back" data-action="goto-main">← Quay lại</button>
              <div style="max-height:55vh;overflow-y:auto;padding-right:8px;font-size:14px;line-height:1.7;color:#cbd5e1;">
                <h4 style="color:#a78bfa;margin:18px 0 8px;font-size:15px;">🎯 Cách chơi cơ bản</h4>
                <p><b>Mục tiêu:</b> Dùng vợt bên trái đánh bóng qua lưới, làm cho đối phương không đỡ được. Ai đạt đủ điểm trước là người thắng.</p>
                <p><b>Điều khiển:</b> Phím <b>↑ ↓</b> hoặc <b>W / S</b> di chuyển vợt. <b>ESC</b> quay lại menu chính. Trên điện thoại dùng nút cảm ứng.</p>
                
                <h4 style="color:#a78bfa;margin:18px 0 8px;font-size:15px;">🎁 12 Vật phẩm đặc biệt</h4>
                <p>Lục lục giác rơi ngẫu nhiên xuống sân, bóng chạm vào là nhận hiệu ứng:</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:8px;">
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#ef4444">⚡ Bóng nhanh</b>Tốc độ x3</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#f59e0b">🔴 Bóng lớn</b>+50% size, -50% tốc</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#22c55e">📏 Vợt Dài/Ngắn</b>Ta dài / địch ngắn</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#06b6d4">🖼️ Mở rộng</b>Sân to +50% 10s</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#3b82f6">🔵 Bóng nhỏ</b>-50% size, tốc x2</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#a855f7">💫 Choáng</b>Đối thủ đứng yên 1s</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#f472b6">👻 Ảo ảnh</b>2 bóng ảo đánh lừa</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#991b1b">💀 Thất bại</b>⚠️ Ăn là thua ngay</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#64748b">🕸️ Mạng nhện</b>Địch -50% tốc 5s</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#f97316">🚀 Cực tốc</b>Ta +100% tốc 3s</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#10b981">✌️ Nhân đôi</b>Tách bóng 2, cực sát</div>
                  <div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:12px;"><b style="color:#000">💣 Bom choáng</b>Ai chạm vợt → choáng</div>
                </div>
  
                <h4 style="color:#a78bfa;margin:18px 0 8px;font-size:15px;">🎰 Hệ thống Gacha</h4>
                <p>Hộp vàng lấp lánh rơi mỗi 12-18 giây. Mở ra có thể <b style="color:#22c55e">TỐT</b> hoặc <b style="color:#ef4444">XẤU</b>, chia 3 cấp: <b>Thường 60%</b> · <b style="color:#a855f7">Hiếm 30%</b> · <b style="color:#fbbf24">Siêu hiếm 10%</b>.</p>
  
                <h4 style="color:#a78bfa;margin:18px 0 8px;font-size:15px;">🔥 Combo & Mẹo</h4>
                <p>Đánh liên tục không hỏng sẽ tích <b>COMBO</b>. Từ combo x3 trở lên, mỗi lần ghi điểm được <b>nhân đôi</b>. Đánh bóng vào <b>cực trên/dưới vợt</b> sẽ tạo góc cực lệch, khó đỡ nhất!</p>
  
                <h4 style="color:#a78bfa;margin:18px 0 8px;font-size:15px;">⌨️ Phím tắt</h4>
                <p><b>ESC</b> — Quay lại menu chính<br><b>Alt+Enter</b> — Toàn màn hình</p>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(ov);
        this.s.overlay = ov;
        this._syncUI();
      },
  
      _syncUI(){
        const s=this.s, ov=this.s.overlay;
        ov.querySelectorAll('[data-setting]').forEach(el=>{
          const key = el.dataset.setting;
          if(el.classList.contains('pm-toggle')){
            el.classList.toggle('on', s[key]);
          } else if(el.tagName==='INPUT' && el.type==='range'){
            el.value = s[key];
          } else if(el.tagName==='SELECT'){
            el.value = s[key];
          }
        });
        ov.querySelector('#pm-speed-val').textContent = s.baseSpeed;
        ov.querySelector('#pm-win-val').textContent = s.winScore;
        if(window.Items){
          Items.cfg.TRAIL = s.trailOn;
          Items.cfg.GHOST = s.ghostOn;
          Items.cfg.SHAKE = s.shakeOn;
        }
      },
  
      _renderAchievements(filter='all'){
        if(!window.Achieve) return;
        const list = Achieve.getList();
        const unlocked = Achieve.getUnlocked();
        const container = this.s.overlay.querySelector('#pm-ach-list');
        const stats = this.s.overlay.querySelector('#pm-ach-stats');
        const bar = this.s.overlay.querySelector('#pm-ach-bar');
  
        // Thống kê theo độ khó
        const lvMap = {'🟢 Dễ':'easy','🟡 TBình':'medium','🟠 Khó':'hard','🔴 Siêu':'extreme'};
        const byLv = {easy:0, medium:0, hard:0, extreme:0};
        list.forEach(a => { if(unlocked.includes(a.id)) byLv[lvMap[a.lv]]++; });
        const total = list.length;
        const got = unlocked.length;
        const pct = Math.round(got/total*100);
  
        stats.innerHTML = `
          <div class="pm-ach-stat"><b>${got}/${total}</b><span>Đã mở</span></div>
          <div class="pm-ach-stat"><b>${pct}%</b><span>Hoàn thành</span></div>
          <div class="pm-ach-stat"><b>${byLv.hard+byLv.extreme}</b><span>Khó/Siêu</span></div>
          <div class="pm-ach-stat"><b>${byLv.extreme}</b><span>Siêu khó</span></div>
        `;
        bar.style.width = pct+'%';
  
        // Lọc
        let shown = list;
        if(filter==='unlocked') shown = list.filter(a=>unlocked.includes(a.id));
        else if(filter==='locked') shown = list.filter(a=>!unlocked.includes(a.id));
        else if(['easy','medium','hard','extreme'].includes(filter)){
          const rev = {easy:'🟢 Dễ',medium:'🟡 TBình',hard:'🟠 Khó',extreme:'🔴 Siêu'};
          shown = list.filter(a=>a.lv===rev[filter]);
        }
  
        container.innerHTML = shown.map(a=>{
          const isGot = unlocked.includes(a.id);
          return `
            <div class="pm-ach-item ${isGot?'unlocked':'locked'}">
              <div class="pm-ach-icon">${isGot?'🏆':'🔒'}</div>
              <div class="pm-ach-info">
                <b>${a.name}</b>
                <span>${a.desc}</span>
              </div>
              <span class="pm-ach-lv">${a.lv}</span>
            </div>
          `;
        }).join('');
      },
  
      _bindEvents(){
        const ov=this.s.overlay, s=this.s;
        const self = this;
  
        ov.addEventListener('click', e=>{
          const btn = e.target.closest('[data-action]');
          if(!btn) return;
          const a = btn.dataset.action;
          if(a==='play'){ this.hide(); s.onPlay && s.onPlay(this.getGameConfig()); }
          else if(a.startsWith('goto-')) this.show(a.replace('goto-',''));
          else if(a==='reset-settings'){
            if(confirm('Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định không?')){
              localStorage.removeItem('pong_menu_settings');
              Object.assign(this.s, {
                sfxOn:true, musicOn:false, sfxVol:0.7, musicVol:0.4,
                quality:'high', trailOn:true, ghostOn:false, shakeOn:true, particlesOn:true,
                defaultDiff:0, baseSpeed:5.5, winScore:5,
              });
              this._syncUI();
            }
          }
        });
  
        // Lọc thành tựu
        ov.addEventListener('click', e=>{
          const f = e.target.closest('[data-filter]');
          if(!f) return;
          ov.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));
          f.classList.add('active');
          this._renderAchievements(f.dataset.filter);
        });
  
        // Toggle & input
        ov.addEventListener('change', e=>{
          const el = e.target.closest('[data-setting]');
          if(!el) return;
          const key = el.dataset.setting;
          if(el.type==='range'){
            s[key] = parseFloat(el.value);
            ov.querySelector('#pm-speed-val').textContent = s.baseSpeed;
            ov.querySelector('#pm-win-val').textContent = s.winScore;
          } else if(el.tagName==='SELECT'){
            s[key] = el.value;
          }
          this._saveSettings();
          this._syncUI();
        });
  
        ov.addEventListener('click', e=>{
          const tg = e.target.closest('.pm-toggle');
          if(!tg) return;
          const key = tg.dataset.setting;
          s[key] = !s[key];
          tg.classList.toggle('on', s[key]);
          this._saveSettings();
          this._syncUI();
        });
      },
  
      show(view){
        this.s.overlay.classList.remove('hidden');
        this.s.overlay.querySelectorAll('.pm-view').forEach(v=>v.classList.remove('active'));
        const el = this.s.overlay.querySelector('#pm-'+view);
        if(el) el.classList.add('active');
        if(view==='achievements') this._renderAchievements('all');
      },
      hide(){ this.s.overlay.classList.add('hidden'); },
      isVisible(){ return !this.s.overlay.classList.contains('hidden'); },
      getGameConfig(){
        return {
          difficulty: parseInt(this.s.defaultDiff),
          baseSpeed: this.s.baseSpeed,
          winScore: this.s.winScore,
          sfxOn: this.s.sfxOn,
          sfxVol: this.s.sfxVol,
          quality: this.s.quality,
        };
      },
      isSfxOn(){ return this.s.sfxOn; },
      getSfxVol(){ return this.s.sfxVol; },
    };
  
    window.Menu = Menu;
  })();