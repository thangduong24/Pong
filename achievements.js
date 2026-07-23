// ============================================================
//  achievements.js - 20 THÀNH TỰU (ĐÃ NÂNG ĐỘ KHÓ)
//  Tối ưu nhẹ, không gây lag, thông báo trượt mượt
// ============================================================
(function () {
    'use strict';
  
    const Achieve = {
      s: {
        unlocked: new Set(),
        refs: null,
        notified: new Set(),
        _stats: {
          totalWin: 0, maxCombo: 0, totalItem: 0, totalGacha: 0,
          itemTypes: new Set(), itemCount: {},
          gachaGoodCount: 0, gachaRareMax: 0,
          winNoLose: 0, perfectWin: 0, hardWin: 0,
          paddleShortWin: 0, bombHit: 0, cloneWin: 0,
          speedWin: 0, surviveBad: 0,
          winUnder20s: 0, comeBackWin: 0, winStreak: 0,
          winByDiff: {0:0, 1:0, 2:0},
          currentMaxBallSpeed: 0,
        },
      },
  
      list: [
        {id:'first_win',     name:'Bước khởi đầu',      desc:'Thắng ván đầu tiên',               lv:'🟢 Dễ',    check:()=>Achieve.s._stats.totalWin >=1},
        {id:'score_10',      name:'Điểm khởi đầu',       desc:'Ghi 10 điểm trong 1 ván',           lv:'🟢 Dễ',    check:()=>false},
        {id:'item_5',        name:'Tò mò khám phá',      desc:'Ăn 5 vật phẩm khác nhau',           lv:'🟢 Dễ',    check:()=>Achieve.s._stats.itemTypes.size >=5},
        {id:'gacha_3',       name:'Mở hộp may mắn',      desc:'Mở 3 hộp Gacha',                    lv:'🟢 Dễ',    check:()=>Achieve.s._stats.totalGacha >=3},
        {id:'combo_5',       name:'Kết nối liên tục',    desc:'Đạt COMBO x5',                      lv:'🟢 Dễ',    check:()=>Achieve.s._stats.maxCombo >=5},
        {id:'combo_12',      name:'Chuỗi bất tận',       desc:'Đạt COMBO x12',                     lv:'🟡 TBình', check:()=>Achieve.s._stats.maxCombo >=12},
        {id:'win_no_lose_2', name:'Phòng thủ vững chắc', desc:'Thắng 2 ván liên tiếp không để mất điểm', lv:'🟡 TBình', check:()=>Achieve.s._stats.winNoLose >=2},
        {id:'perfect_7',     name:'Hoàn hảo tuyệt đối',  desc:'Thắng 7-0 (đặt điểm thắng ≥7)',     lv:'🟡 TBình', check:()=>Achieve.s._stats.perfectWin >=1},
        {id:'gacha_good_5',  name:'Vận khí tốt',         desc:'Nhận 5 hiệu ứng TỐT từ Gacha',      lv:'🟡 TBình', check:()=>Achieve.s._stats.gachaGoodCount >=5},
        {id:'gacha_legend',  name:'Mắt tinh thấy vàng',  desc:'Mở ra Siêu hiếm',                   lv:'🟡 TBình', check:()=>Achieve.s._stats.gachaRareMax >=3},
        {id:'hard_win_3',    name:'Vượt khó',            desc:'Thắng 3 ván ở mức Khó',             lv:'🟠 Khó',    check:()=>Achieve.s._stats.hardWin >=3},
        {id:'paddle_short_2',name:'Vợt ngắn tài cao',    desc:'Thắng 2 ván sau khi bị Vợt ngắn',    lv:'🟠 Khó',    check:()=>Achieve.s._stats.paddleShortWin >=2},
        {id:'bomb_survive_2',name:'Không hề rung động',  desc:'Thắng sau khi chạm Bom choáng 2 lần',lv:'🟠 Khó',    check:()=>Achieve.s._stats.bombHit >=2},
        {id:'clone_win_2',   name:'Chơi với bóng',       desc:'Thắng 2 ván nhờ Bóng nhân đôi',      lv:'🟠 Khó',    check:()=>Achieve.s._stats.cloneWin >=2},
        {id:'speed_demon',   name:'Cơn lốc tốc độ',      desc:'Thắng khi tốc độ bóng vượt 12',      lv:'🟠 Khó',    check:()=>Achieve.s._stats.speedWin >=1},
        {id:'comeback',      name:'Lật ngược thế cờ',    desc:'Thắng khi đang thua 0-4',            lv:'🔴 Siêu',   check:()=>Achieve.s._stats.comeBackWin >=1},
        {id:'fast_win',      name:'Kết thúc nhanh',      desc:'Thắng ván dưới 20 giây',             lv:'🔴 Siêu',   check:()=>Achieve.s._stats.winUnder20s >=1},
        {id:'streak_5',      name:'Chuỗi bất bại',       desc:'Thắng liên tiếp 5 ván',              lv:'🔴 Siêu',   check:()=>Achieve.s._stats.winStreak >=5},
        {id:'all_diff_master',name:'Thông thạo mọi cấp', desc:'Thắng mỗi mức độ khó ít nhất 2 lần', lv:'🔴 Siêu',   check:()=>Achieve.s._stats.winByDiff[0]>=2 && Achieve.s._stats.winByDiff[1]>=2 && Achieve.s._stats.winByDiff[2]>=2},
        {id:'collector',     name:'Nhà sưu tầm đích thực',desc:'Ăn đủ 12 loại vật phẩm, mỗi loại ≥2 lần', lv:'🔴 Siêu', check:()=>Achieve.s._stats.itemTypes.size >=12 && Object.values(Achieve.s._stats.itemCount).every(c=>c>=2)},
      ],
  
      init(refs){
        this.s.refs = refs;
        this._load();
        this._buildUI();
        console.log('🏆 achievements.js — Đã phân biệt người chơi/máy');
      },
  
      _save(){
        const d = {
          unlc: Array.from(this.s.unlocked),
          stats: Object.assign({}, this.s._stats, {itemTypes: Array.from(this.s._stats.itemTypes)}),
        };
        localStorage.setItem('pong_achieve', JSON.stringify(d));
      },
      _load(){
        try{
          const d = JSON.parse(localStorage.getItem('pong_achieve'));
          if(d){
            this.s.unlocked = new Set(d.unlc||[]);
            Object.assign(this.s._stats, d.stats||{});
            if(d.stats && d.stats.itemTypes) this.s._stats.itemTypes = new Set(d.stats.itemTypes);
          }
        }catch(e){}
      },
  
      _buildUI(){
        const c = document.createElement('div');
        c.id = 'achieve-notify';
        c.innerHTML = `
          <style>
            #achieve-notify{
              position:fixed; top:20px; right:-340px; width:300px; z-index:99997;
              background: linear-gradient(90deg, rgba(15,23,42,.97), rgba(30,27,75,.97));
              border:1px solid rgba(251,191,36,.5); border-left:4px solid #fbbf24;
              border-radius:12px; padding:14px 18px;
              font-family:system-ui,sans-serif; color:#fff;
              transition:right .4s cubic-bezier(.17,.67,.33,1);
              box-shadow:0 8px 30px rgba(251,191,36,.25);
              will-change:right;
            }
            #achieve-notify.show{ right:20px; }
            #achieve-notify.hide{ right:-340px; }
            .ach-head{ display:flex; align-items:center; gap:10px; margin-bottom:4px; }
            .ach-head b{ font-size:15px; color:#fbbf24; }
            .ach-head span{ font-size:11px; color:#94a3b8; padding:2px 6px; border-radius:6px; background:rgba(255,255,255,.06); }
            .ach-desc{ font-size:12px; color:#cbd5e1; line-height:1.5; }
          </style>
          <div class="ach-head"><span>🏆</span><b id="ach-name"></b><span id="ach-lv"></span></div>
          <div class="ach-desc" id="ach-desc"></div>
        `;
        document.body.appendChild(c);
      },
  
      _show(ach){
        if(this.s.notified.has(ach.id)) return;
        this.s.notified.add(ach.id);
        const n = document.getElementById('achieve-notify');
        document.getElementById('ach-name').textContent = ach.name;
        document.getElementById('ach-lv').textContent = ach.lv;
        document.getElementById('ach-desc').textContent = ach.desc;
        if(window.Menu && Menu.isSfxOn()) this._tune();
        n.classList.remove('hide'); void n.offsetWidth; n.classList.add('show');
        setTimeout(()=>{ n.classList.remove('show'); n.classList.add('hide'); }, 3200);
      },
  
      _tune(){
        if(!window.AC) return;
        try{
          const n = AC.createOscillator(), g = AC.createGain();
          n.frequency.setValueAtTime(523, AC.currentTime);
          n.frequency.setValueAtTime(659, AC.currentTime + 0.12);
          n.frequency.setValueAtTime(784, AC.currentTime + 0.24);
          n.frequency.setValueAtTime(1047, AC.currentTime + 0.36);
          g.gain.setValueAtTime(0, AC.currentTime);
          g.gain.linearRampToValueAtTime(0.18, AC.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.65);
          n.connect(g); g.connect(AC.destination);
          n.start(); n.stop(AC.currentTime + 0.65);
        }catch(e){}
      },
  
      check(){
        for(const ach of this.list){
          if(this.s.unlocked.has(ach.id)) continue;
          if(ach.check()){
            this.s.unlocked.add(ach.id);
            this._show(ach);
            this._save();
          }
        }
      },
  
      // ==============================================
      // ✅ TẤT CẢ HÀM SỰ KIỆN ĐỀU CÓ THAM SỐ who
      //    who = 'player'  → người chơi
      //    who = 'ai'      → máy (BỎ QUA, không tính)
      // ==============================================
  
      onScore(who, combo, pScore, aScore, ballSpeed){
        if(who !== 'player') return; // ✅ CHỈ TÍNH CHO NGƯỜI CHƠI
        if(combo > this.s._stats.maxCombo) this.s._stats.maxCombo = combo;
        if(pScore >= 10) this._unl('score_10');
        if(ballSpeed > this.s._stats.currentMaxBallSpeed) this.s._stats.currentMaxBallSpeed = ballSpeed;
        this.check();
      },
  
      onWin(who, diff, pScore, aScore, dur, hadShort, hadBomb, hadClone){
        if(who !== 'player') return; // ✅ CHỈ TÍNH KHI NGƯỜI CHƠI THẮNG
        this.s._stats.totalWin++;
        this.s._stats.winStreak++;
        this.s._stats.winByDiff[diff]++;
  
        if(aScore === 0){ this.s._stats.winNoLose++; } else { this.s._stats.winNoLose = 0; }
        if(pScore >= 7 && aScore === 0) this.s._stats.perfectWin++;
        if(diff === 2) this.s._stats.hardWin++;
        if(hadShort) this.s._stats.paddleShortWin++;
        if(hadBomb) this.s._stats.bombHit++;
        if(hadClone) this.s._stats.cloneWin++;
        if(this.s._stats.currentMaxBallSpeed > 12) this.s._stats.speedWin++;
        if(aScore === 4 && pScore >= 5) this.s._stats.comeBackWin++;
        if(dur > 0 && dur < 20000) this.s._stats.winUnder20s++;
  
        this.s._stats.currentMaxBallSpeed = 0;
        this.check(); this._save();
      },
  
      onLose(who){
        if(who !== 'player') return; // ✅ CHỈ RESET KHI NGƯỜI CHƠI THUA
        this.s._stats.winStreak = 0;
        this.s._stats.winNoLose = 0;
        this._save();
      },
  
      onItemPick(who, itemId){
        if(who !== 'player') return; // ✅ CHỈ TÍNH KHI NGƯỜI CHƠI ĂN VẬT PHẨM
        this.s._stats.totalItem++;
        this.s._stats.itemTypes.add(itemId);
        this.s._stats.itemCount[itemId] = (this.s._stats.itemCount[itemId]||0) + 1;
        this.check(); this._save();
      },
  
      onGachaOpen(who, good, rarity){
        if(who !== 'player') return; // ✅ CHỈ TÍNH KHI NGƯỜI CHƠI MỞ GACHA
        this.s._stats.totalGacha++;
        if(good) this.s._stats.gachaGoodCount++;
        if(rarity > this.s._stats.gachaRareMax) this.s._stats.gachaRareMax = rarity;
        this.check(); this._save();
      },
  
      onBombHit(who){
        if(who !== 'player') return; // ✅ CHỈ TÍNH KHI NGƯỜI CHƠI BỊ BOM
        this.s._stats.bombHit++;
        this._save();
      },
  
      _unl(id){
        if(!this.s.unlocked.has(id)){
          this.s.unlocked.add(id);
          const ach = this.list.find(x=>x.id===id);
          if(ach){ this._show(ach); this._save(); }
        }
      },
  
      getUnlocked(){ return Array.from(this.s.unlocked); },
      getList(){ return this.list; },
      getStats(){ return this.s._stats; },
    };
  
    window.Achieve = Achieve;
  })();