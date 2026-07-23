// ============================================================
//  items.js - ĐÃ SỬA LỖI VỢT + RESET TOÀN BỘ KHI END GAME
// ============================================================
(function () {
  'use strict';

  const Items = {
    cfg: { TRAIL:true, COUNTDOWN:true, SHAKE:true, FLOAT:true, COMBO:true, GHOST:false },
    s: {
      ctx: null, W: 600, H: 400, curW: 600, curH: 400,
      list: [], active: [], illusions: [], clones: [],
      stun: {player:0, ai:0}, slow: {player:0, ai:0}, fast: {player:0, ai:0},
      isBomb:false, bombT:0, player:null, ai:null, ball:null, onLose:null,
      trail: [], cd: 0, cdCb: null, sT:0, sM:0, floats:[],
      combo:0, lastHit:null, gA:1, gT:0, _sp:0,
    },
    _db: [
      {id:'speed200', n:'BÓNG NHANH',   c:'#ef4444', e:'⚡', w:'ball', d:6000},
      {id:'bigSlow',   n:'BÓNG LỚN',     c:'#f59e0b', e:'🔴', w:'ball', d:7000},
      {id:'paddleLen', n:'VỢT DÀI/NGẮN', c:'#22c55e', e:'📏', w:'dual', d:8000},
      {id:'expand',    n:'MỞ RỘNG',      c:'#06b6d4', e:'🖼️', w:'field',d:10000},
      {id:'smallFast', n:'BÓNG NHỎ',     c:'#3b82f6', e:'🔵', w:'ball', d:6000},
      {id:'stun',      n:'CHOÁNG',       c:'#a855f7', e:'💫', w:'opp',  d:1000},
      {id:'illusion',  n:'ẢO ẢNH',       c:'#f472b6', e:'👻', w:'ball', d:5000},
      {id:'die',       n:'THẤT BẠI',      c:'#991b1b', e:'💀', w:'self', d:0},
      {id:'web',       n:'MẠNG NHỆN',    c:'#64748b', e:'🕸️', w:'opp',  d:5000},
      {id:'boost',     n:'CỰC TỐC',      c:'#f97316', e:'🚀', w:'self', d:3000},
      {id:'clone',     n:'NHÂN ĐÔI',      c:'#10b981', e:'✌️', w:'ball', d:0},
      {id:'bomb',      n:'BOM CHOÁNG',    c:'#000000', e:'💣', w:'ball', d:10000},
    ],

    init(ctx, W, H, refs){
      this.s.ctx=ctx; this.s.W=this.s.curW=W; this.s.H=this.s.curH=H;
      Object.assign(this.s, refs);
      console.log('✅ items.js - Đã sửa lỗi vợt + Reset All');
    },

    spawn(){const t=this._db[Math.floor(Math.random()*this._db.length)];this.s.list.push({x:this.s.curW/2,y:30,vy:1.5,r:15,type:t,rot:0});},

    update(dt){
      const s=this.s;
      for(let i=s.list.length-1;i>=0;i--){const it=s.list[i];it.y+=it.vy;it.rot+=0.05;if(it.y>s.curH+50)s.list.splice(i,1);}
      const n=Date.now();
      s.active=s.active.filter(e=>{if(n>=e.end){this._end(e);return false;}return true;});
      ['stun','slow','fast'].forEach(k=>{['player','ai'].forEach(p=>{if(s[k][p]>0)s[k][p]=Math.max(0,s[k][p]-dt);});});
      if(s.isBomb){s.bombT-=dt;if(s.bombT<=0){s.isBomb=false;s.ball.r=8;}}
      s.illusions.forEach(il=>{il.x+=il.vx;il.y+=il.vy;if(il.y-il.r<0||il.y+il.r>s.curH)il.vy*=-1;il.life-=dt;});
      s.illusions=s.illusions.filter(il=>il.x>-50&&il.x<s.curW+50&&il.life>0);
      s._sp+=dt;if(s._sp>5500+Math.random()*3500){s._sp=0;this.spawn();}
      if(this.cfg.GHOST){s.gT+=dt;const c=s.gT%12000;s.gA=c>10000?Math.max(.08,1-(c-10000)/1500):1;}
      if(this.cfg.TRAIL){s.trail.forEach(t=>t.l-=0.055);s.trail=s.trail.filter(t=>t.l>0);}
      if(this.cfg.FLOAT){s.floats.forEach(f=>{f.y+=f.vy;f.l-=dt/900;});s.floats=s.floats.filter(f=>f.l>0);}
      if(s.sT>0){s.sT=Math.max(0,s.sT-dt);if(s.sT<=0)s.sM=0;}
    },

    checkPickup(who){
      const s=this.s;
      const balls=[s.ball,...s.clones.filter(c=>c.alive)];
      for(const b of balls){
        for(let i=s.list.length-1;i>=0;i--){
          const it=s.list[i];
          if(Math.abs(b.x-it.x)<b.r+it.r&&Math.abs(b.y-it.y)<b.r+it.r){
            this._apply(it.type,who);
            this.float(it.type.n,it.x,it.y-20,it.type.c);
            this.shake(6,250);
            s.list.splice(i,1);
            return it.type;
          }
        }
      }
      return null;
    },

    // ✅ ĐÃ SỬA: dùng luôn 'player'/'ai' KHÔNG dùng p/a nữa → không còn lỗi undefined
    _apply(t,who){
      const s=this.s, n=Date.now();
      const opp = who === 'player' ? 'ai' : 'player';
      switch(t.id){
        case 'speed200':  s.ball.vx*=3;s.ball.vy*=3;s.active.push({id:t.id,end:n+t.d});break;
        case 'bigSlow':   s.ball.r=12;s.ball.vx*=.5;s.ball.vy*=.5;s.active.push({id:t.id,end:n+t.d});break;
        case 'paddleLen':
          s[who].h = 120;              // Người ăn = DÀI
          s[opp].h = 45;               // Đối thủ = NGẮN
          s.active.push({id:t.id, end:n+t.d, who, opp});
          break;
        case 'expand':
          s.curW=Math.round(s.W*1.5);s.curH=Math.round(s.H*1.5);
          s.active.push({id:t.id,end:n+t.d});break;
        case 'smallFast': s.ball.r=4;s.ball.vx*=2;s.ball.vy*=2;s.active.push({id:t.id,end:n+t.d});break;
        case 'stun':      s.stun[opp]=t.d;break;
        case 'illusion':
          for(let i=0;i<2;i++){const o=(i===0?-1:1)*18;
            s.illusions.push({x:s.ball.x,y:s.ball.y+o,r:s.ball.r,vx:s.ball.vx*.98,vy:s.ball.vy*.98+(i===0?-.3:.3),life:t.d,c:i===0?'#e0e7ff':'#ddd6fe'});}break;
        case 'die':       s.onLose&&s.onLose(opp);break;
        case 'web':       s.slow[opp]=t.d;break;
        case 'boost':     s.fast[who]=t.d;break;
        case 'clone':
          if(s.clones.length>=2)break;
          const ang=Math.atan2(s.ball.vy,s.ball.vx)+(Math.PI/180*2.5),sp=Math.hypot(s.ball.vx,s.ball.vy);
          s.clones.push({x:s.ball.x,y:s.ball.y,r:s.ball.r,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,alive:true});break;
        case 'bomb':      s.isBomb=true;s.bombT=t.d;s.ball.r=10;break;
      }
    },

    // ✅ ĐÃ SỬA HOÀN TÁC ĐÚNG: vợt chắc chắn về 80
    _end(e){
      const s=this.s;
      switch(e.id){
        case 'bigSlow':   s.ball.r = 8; break;
        case 'smallFast': s.ball.r = 8; break;
        case 'paddleLen':
          // Hoàn tác BỂN AI VÀ BẠN về 80px - CHẮC CHẮN KHÔNG GỌI NHẦM
          if (e.who) s[e.who].h = 80;
          if (e.opp) s[e.opp].h  = 80;
          break;
        case 'expand':
          s.curW = s.W; s.curH = s.H;
          break;
      }
    },

    // ============================================================
    //  ✅ RESET TOÀN BỘ - GỌI KHI THẮNG / THUA
    // ============================================================
    resetAll(){
      const s = this.s;
      // 1. Hoàn tác TẤT CẢ hiệu ứng đang chạy trước khi xóa
      s.active.forEach(e => this._end(e));
      // 2. Xóa sạch hàng đợi
      s.active = [];
      s.list = [];          // Vật phẩm đang rơi
      s.illusions = [];     // Bóng ảo
      s.clones = [];        // Bóng nhân đôi
      s.floats = [];        // Chữ bay
      s.trail = [];         // Vệt bóng
      // 3. Reset trạng thái đối tượng
      s.stun = {player:0, ai:0};
      s.slow = {player:0, ai:0};
      s.fast = {player:0, ai:0};
      s.isBomb = false; s.bombT = 0;
      if (s.ball) s.ball.r = 8;
      if (s.player) s.player.h = 80;  // Vợt bạn về 80
      if (s.ai)     s.ai.h     = 80;  // Vợt máy về 80
      // 4. Reset kích thước sân về gốc
      s.curW = s.W; s.curH = s.H;
      // 5. Reset extras
      s.combo = 0; s.lastHit = null;
      s.cd = 0; s.cdCb = null;
      s.sT = 0; s.sM = 0;        // DỪA RUNG NGAY
      s.gA = 1; s.gT = 0;
      s._sp = 0;
      console.log('🧹 Items + Extras đã RESET HẾT');
    },

    onPaddleHit(who){if(!this.s.isBomb)return;this.s.stun[who]=1000;this.s.isBomb=false;this.s.ball.r=8;this.float('💥 CHOÁNG!',who==='player'?80:this.s.curW-80,this.s.curH/2,'#ef4444');this.shake(12,500);},
    clearClones(){this.s.clones=[];},
    getSpeed(base,who){let v=base;if(this.s.fast[who]>0)v*=2;if(this.s.slow[who]>0)v*=.5;if(this.s.stun[who]>0)v=0;return v;},
    getField(){return{W:this.s.curW,H:this.s.curH};},

    // ===== EXTRAS =====
    addTrail(x,y,r){if(!this.cfg.TRAIL)return;this.s.trail.push({x,y,r,l:1});if(this.s.trail.length>18)this.s.trail.shift();},
    cdStart(cb){if(!this.cfg.COUNTDOWN){cb();return;}this.s.cd=3;this.s.cdCb=cb;const t=()=>{this.s.cd--;if(this.s.cd<=0){this.s.cdCb&&this.s.cdCb();this.s.cdCb=null;}else setTimeout(t,700);};setTimeout(t,700);},
    cdOn(){return this.s.cd>0;},
    shake(m=8,t=300){if(!this.cfg.SHAKE)return;this.s.sM=Math.max(this.s.sM,m);this.s.sT=Math.max(this.s.sT,t);},
    apSh(c){if(!this.cfg.SHAKE||this.s.sT<=0)return;c.translate((Math.random()-.5)*this.s.sM*2,(Math.random()-.5)*this.s.sM*2);},
    float(t,x,y,col='#fff'){if(!this.cfg.FLOAT)return;this.s.floats.push({t,x,y,c:col,l:1,vy:-1.1});},
    hit(w){const s=this.s;if(s.lastHit===w)return;s.lastHit=w;s.combo++;if(this.cfg.COMBO&&s.combo>=3)this.float(`🔥 COMBO x${s.combo}!`,s.curW/2,60,'#fbbf24');},
    score(){const s=this.s;const b=this.cfg.COMBO?Math.max(1,Math.floor(s.combo/3)):1;s.combo=0;s.lastHit=null;return b;},
    gb(){return this.s.combo;},
    ballAlpha(){return this.s.gA;},

    draw(){
      const s=this.s,c=s.ctx;if(!c)return;
      s.list.forEach(it=>{
        c.save();c.translate(it.x,it.y);c.rotate(it.rot);
        c.shadowColor=it.type.c;c.shadowBlur=22;c.fillStyle=it.type.c;
        c.beginPath();for(let i=0;i<6;i++){const a=(Math.PI/3)*i,x=Math.cos(a)*it.r,y=Math.sin(a)*it.r;i?c.lineTo(x,y):c.moveTo(x,y);}
        c.closePath();c.fill();c.shadowBlur=0;c.fillStyle='#fff';
        c.font='bold 15px Arial';c.textAlign='center';c.textBaseline='middle';
        c.rotate(-it.rot);c.fillText(it.type.e,0,1);c.restore();
      });
      s.illusions.forEach(il=>{
        c.save();c.globalAlpha=Math.max(0,Math.min(.55,il.life/5000));
        c.fillStyle=il.c;c.shadowColor=il.c;c.shadowBlur=10;
        c.beginPath();c.arc(il.x,il.y,il.r,0,Math.PI*2);c.fill();c.restore();
      });
      s.clones.forEach(cl=>{if(!cl.alive)return;
        c.fillStyle='#34d399';c.shadowColor='#10b981';c.shadowBlur=18;
        c.beginPath();c.arc(cl.x,cl.y,cl.r,0,Math.PI*2);c.fill();c.shadowBlur=0;
      });
      if(this.cfg.TRAIL)s.trail.forEach(t=>{c.globalAlpha=t.l*.5;c.fillStyle='#fff';c.beginPath();c.arc(t.x,t.y,t.r*t.l,0,Math.PI*2);c.fill();});
      c.globalAlpha=1;
      s.ball._c=null;s.ball._s=null;if(s.isBomb){s.ball._c='#000';s.ball._s='#ef4444';}
      if(this.cfg.FLOAT)s.floats.forEach(f=>{
        c.save();c.globalAlpha=Math.max(0,f.l);c.fillStyle=f.c;
        c.font='bold 20px Urbanist';c.textAlign='center';
        c.shadowColor=f.c;c.shadowBlur=10;c.fillText(f.t,f.x,f.y);c.restore();
      });
      const nn=Date.now();let yy=12;
      s.active.forEach(e=>{
        const tp=this._db.find(x=>x.id===e.id);if(!tp)return;
        const lf=Math.max(0,e.end-nn);if(lf<=0)return;
        const w=150,h=6,p=lf/tp.d;
        c.fillStyle='rgba(0,0,0,.45)';c.fillRect(s.curW/2-w/2,yy,w,h);
        c.fillStyle=tp.c;c.fillRect(s.curW/2-w/2,yy,w*p,h);
        c.fillStyle='#fff';c.font='11px Urbanist';c.textAlign='center';
        c.fillText(tp.n,s.curW/2,yy-2);yy+=18;
      });
      if(this.cfg.COUNTDOWN&&s.cd>0){
        c.save();c.fillStyle='rgba(15,23,42,.6)';c.fillRect(0,0,s.curW,s.curH);
        c.textAlign='center';c.textBaseline='middle';
        c.font='bold 130px Urbanist';c.shadowColor='#8b5cf6';c.shadowBlur=30;
        c.fillStyle='#fff';c.fillText(String(s.cd),s.curW/2,s.curH/2);c.restore();
      }
      if(this.cfg.COMBO&&s.combo>=2){
        c.fillStyle='#fbbf24';c.font='bold 18px Urbanist';c.textAlign='center';
        c.fillText(`🔥 COMBO x${s.combo}`,s.curW/2,s.curH-16);
      }
    },
  };

  window.Items = Items;
})();