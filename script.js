(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const BW = 600, BH = 400;
  let W = BW, H = BH;

  const overlay = $('overlay'), oT = $('overlayTitle'), oS = $('overlaySub');
  const startBtn = $('startBtn'), pEl = $('playerScore'), aEl = $('aiScore');
  const diffBtns = document.querySelectorAll('.diff-btn');
  const upBtn = $('upBtn'), dnBtn = $('downBtn');

  const G = {
    run:false, diff:0, aiS:[3.2,5.2,7.2], aiE:[0.35,0.18,0.05],
    pS:0, aS:0, win:5, keys:{u:false,d:false}, last:0,
  };
  const PW=12, PH=80, PS=7;
  const pl = {x:20, y:H/2-PH/2, w:PW, h:PH};
  const ai = {x:W-20-PW, y:H/2-PH/2, w:PW, h:PH};
  const b  = {x:W/2, y:H/2, r:8, vx:0, vy:0, sp:5.5};

  // ✅ Khởi tạo Items = Extras + 12 vật phẩm
  if (window.Items) Items.init(ctx, W, H, {
    player:pl, ai:ai, ball:b, onLose: lo => end(lo==='player'?'p':'a'),
  });
  //  Khởi tạo Gacha
  if (window.Gacha) Gacha.init(ctx, W, H, {
    player:pl, ai:ai, ball:b,
    pScore: { get v(){return G.pS;}, set v(x){G.pS=x;}, el:pEl },
    aScore: { get v(){return G.aS;}, set v(x){G.aS=x;}, el:aEl },
  });

  // Biến theo dõi trạng thái ván cho Achievement
  let _hadShortPaddle = false, _hadBombHit = false, _hadClone = false;
  let _gameStart = 0;

  // ===== KHỞI TẠO MENU =====
  if (window.Menu) Menu.init({
    onPlay: (cfg) => {
      G.diff = cfg.difficulty;
      G.win = cfg.winScore;
      b.sp = cfg.baseSpeed;
      // Đồng bộ nút độ khó UI
      diffBtns.forEach(btn => btn.classList.toggle('active', +btn.dataset.diff === cfg.difficulty));
      rg();
      G.run = true;
    },
    onExit: () => {
      G.run = false;
      if(window.confirm('Cảm ơn đã chơi Pong! Bạn có muốn đóng tab không?')){
        window.close();
      }
    }
  });

  // ===== KHỞI TẠO DEBUG =====
  if (window.Debug) Debug.init({
    game: G, player: pl, ai: ai, ball: b,
    pEl, aEl,
    resetGame: rg,
  });

  // ==== KHỞI TẠO ACHIEVEMENT ====
  if (window.Achieve) Achieve.init({ game:G, player:pl, ai:ai });

  let AC=null;
  function iA(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext);}catch(e){}}
  function beep(f,d=.05,t='square'){
    if(window.Menu && !Menu.isSfxOn()) return;
    const vol = window.Menu ? Menu.getSfxVol() : 0.7;

    if(!AC)return;try{if(AC.state==='suspended')AC.resume();
    const o=AC.createOscillator(),g=AC.createGain();o.type=t;o.frequency.value=f;
    g.gain.setValueAtTime(.08,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);
    o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d);}catch(e){}
  }

  function rb(dir){
    const f=Items?Items.getField():{W,H};W=f.W;H=f.H;ai.x=W-20-PW;
    b.x=W/2;b.y=H/2;const a=Math.random()*.6-.3;
    const d=dir??(Math.random()>.5?1:-1);
    b.vx=Math.cos(a)*b.sp*d;b.vy=Math.sin(a)*b.sp;
  }
  function rg(){
    G.pS=G.aS=0;pEl.textContent=aEl.textContent='0';
    pl.h=PH;ai.h=PH;pl.y=ai.y=H/2-PH/2;b.r=8;b.sp=5.5;
    if(Items){Items.s.clones=[];Items.s.illusions=[];Items.s.active=[];Items.s.isBomb=false;Items.s.combo=0;}
    _hadShortPaddle = false; _hadBombHit = false; _hadClone = false;
    _gameStart = Date.now();
    rb();
  }

  document.addEventListener('keydown',e=>{
    if(['ArrowUp','w','W'].includes(e.key)){G.keys.u=true;e.preventDefault();}
    if(['ArrowDown','s','S'].includes(e.key)){G.keys.d=true;e.preventDefault();}
    if(e.key===' '&&!G.run){e.preventDefault();startBtn.click();}
    // ESC quay lại menu
    if(e.key==='Escape'){
      e.preventDefault();
      if(window.Menu && !Menu.isVisible()){
        G.run = false;
        Menu.show('main');
      }
    }
  });

  document.addEventListener('keyup',e=>{
    if(['ArrowUp','w','W'].includes(e.key))G.keys.u=false;
    if(['ArrowDown','s','S'].includes(e.key))G.keys.d=false;
  });
  function bh(btn,k){
    const o=()=>G.keys[k]=true,f=()=>G.keys[k]=false;
    btn.addEventListener('touchstart',o,{passive:true});
    btn.addEventListener('touchend',f,{passive:true});
    btn.addEventListener('touchcancel',f,{passive:true});
    btn.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
    btn.addEventListener('mousedown',o);btn.addEventListener('mouseup',f);btn.addEventListener('mouseleave',f);
  }
  bh(upBtn,'u');bh(dnBtn,'d');

  // ✅ Bắt đầu = đếm ngược 3-2-1 rồi mới chạy
  startBtn.addEventListener('click',()=>{
    iA();rg();overlay.classList.add('hidden');G.run=false;
    if(Items)Items.cdStart(()=>{G.run=true;beep(880,.1,'triangle');});
    else G.run=true;
    beep(660,.1,'triangle');
  });

  function end(w){
    if (Items) Items.resetAll(); // Reset items
    if (Gacha) Gacha.resetAll(); //Rest gacha

    //Gọi Achievement
    if(window.Achieve){
      const dur = Date.now() - _gameStart;
      if(w==='p') Achieve.onWin('player', G.diff, G.pS, G.aS, dur, _hadShortPaddle, _hadBombHit, _hadClone);
      else Achieve.onLose('player');
    }

    G.run=false;overlay.classList.remove('hidden');
    if(w==='p'){oT.textContent='🏆 Bạn thắng!';oT.style.color='#a78bfa';beep(880,.15,'triangle');setTimeout(()=>beep(1175,.25,'triangle'),150);}
    else{oT.textContent='😢 Bạn thua';oT.style.color='#f472b6';beep(220,.3,'sawtooth');}
    oS.textContent='Nhấn nút bên dưới để chơi lại';startBtn.textContent='Chơi lại';
  }

  function hit(ball,who){
    const p=who==='player'?pl:ai;
    ball.vx*=-1.05;const h=(ball.y-(p.y+p.h/2))/(p.h/2);ball.vy=h*6;
    ball.x=who==='player'?p.x+p.w+ball.r:p.x-ball.r;
    beep(who==='player'?740:620,.06);
    if(Items){
      if(Items.s.isBomb === true && who === 'player') _hadBombHit = true;
      Items.onPaddleHit(who);
      Items.hit(who);
      Items.shake(4,150);
    }
    if(Items&&ball===b)Items.clearClones();
  }

  function up(ts){
    const dt=Math.min(50,ts-(G.last||ts));G.last=ts;
    if(Items&&Items.cdOn())return;
    if(!G.run)return;
    if(Items){Items.update(dt);const f=Items.getField();W=f.W;H=f.H;ai.x=W-20-PW;}

    if(Gacha){ Gacha.update(dt); Gacha.check(b); }

    // Người chơi
    let vy=0;const pS=Items?Items.getSpeed(PS,'player'):PS;
    if(G.keys.u)vy-=pS;if(G.keys.d)vy+=pS;
    pl.y=Math.max(0,Math.min(H-pl.h,pl.y+vy));

    // AI — ✅DÙNG FILE ai.js RIÊNG
    const aS = Items ? Items.getSpeed(G.aiS[G.diff], 'ai') : G.aiS[G.diff];
    ai.y = AI.update(ai, b, G.diff, H, aS);

    // Bóng + nhân đôi
    b.x+=b.vx;b.y+=b.vy;
    if(Items)Items.s.clones.forEach(cl=>{if(cl.alive){cl.x+=cl.vx;cl.y+=cl.vy;}});
    if(Items){
      const whoAte = b.vx<0 ? 'player' : 'ai';
      const picked = Items.checkPickup(whoAte);
      if(picked && window.Achieve){
        Achieve.onItemPick(whoAte, picked.id);
        if(picked.id==='paddleLen' && whoAte==='ai') _hadShortPaddle = true; // máy ăn → bạn ngắn
        if(picked.id==='clone' && whoAte==='player') _hadClone = true;
      }
    }
    if(Items)Items.addTrail(b.x,b.y,b.r);

    // Tường
    if(b.y-b.r<0){b.y=b.r;b.vy*=-1;beep(520);}
    if(b.y+b.r>H){b.y=H-b.r;b.vy*=-1;beep(520);}
    if(Items)Items.s.clones.forEach(cl=>{if(!cl.alive)return;
      if(cl.y-cl.r<0){cl.y=cl.r;cl.vy*=-1;}
      if(cl.y+cl.r>H){cl.y=H-cl.r;cl.vy*=-1;}});

    // Chạm vợt
    if(b.x-b.r<pl.x+pl.w&&b.x+b.r>pl.x&&b.y>pl.y&&b.y<pl.y+pl.h&&b.vx<0)hit(b,'player');
    if(b.x+b.r>ai.x&&b.x-b.r<ai.x+ai.w&&b.y>ai.y&&b.y<ai.y+ai.h&&b.vx>0)hit(b,'ai');
    if(Items)Items.s.clones.forEach(cl=>{if(!cl.alive)return;
      if(cl.x-cl.r<pl.x+pl.w&&cl.x+cl.r>pl.x&&cl.y>pl.y&&cl.y<pl.y+pl.h&&cl.vx<0){cl.alive=false;Items.clearClones();beep(740,.05);}
      if(cl.x+cl.r>ai.x&&cl.x-cl.r<ai.x+ai.w&&cl.y>ai.y&&cl.y<ai.y+ai.h&&cl.vx>0){cl.alive=false;Items.clearClones();beep(620,.05);}});

    const cs=Math.hypot(b.vx,b.vy),MX=16;if(cs>MX){b.vx=b.vx/cs*MX;b.vy=b.vy/cs*MX;}

    // Ghi điểm
    if(b.x<-30){
      const bn=Items?Items.score():1;G.aS+=bn;aEl.textContent=G.aS;beep(180,.2,'sawtooth');
      if(window.Achieve) Achieve.onScore('ai', Items?Items.gb():0, G.pS, G.aS, Math.hypot(b.vx,b.vy));
      if(Items){Items.float(`+${bn}`,W*.75,90,'#e03e6b');Items.shake(12,450);Items.clearClones();}
      if(G.aS>=G.win)return end('a');
      b.sp=Math.min(b.sp+.3,10);rb(1);if(Items)Items.cdStart(()=>{});
    }
    if(b.x>W+30){
      const bn=Items?Items.score():1;G.pS+=bn;pEl.textContent=G.pS;beep(988,.15,'triangle');
      if(window.Achieve) Achieve.onScore('player', Items?Items.gb():0, G.pS, G.aS, Math.hypot(b.vx,b.vy));
      if(Items){Items.float(`+${bn}`,W*.25,90,'#8b5cf6');Items.shake(12,450);Items.clearClones();}
      if(G.pS>=G.win)return end('p');
      b.sp=Math.min(b.sp+.3,10);rb(-1);if(Items)Items.cdStart(()=>{});
    }
    if(Items)Items.s.clones.forEach(cl=>{if((cl.x<-30||cl.x>W+30)&&cl.alive)cl.alive=false;});
  }

  function rr(x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }
  function dr(ts){
    ctx.save();
    const sc=Math.min(1,BW/W);ctx.setTransform(sc,0,0,sc,0,0);
    if(Items)Items.apSh(ctx);

    ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(148,163,184,.3)';ctx.setLineDash([8,12]);ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);

    ctx.fillStyle='#8b5cf6';ctx.shadowColor='rgba(139,92,246,.7)';ctx.shadowBlur=18;
    rr(pl.x,pl.y,pl.w,pl.h,6);ctx.fill();
    ctx.fillStyle='#e03e6b';ctx.shadowColor='rgba(224,62,107,.7)';
    rr(ai.x,ai.y,ai.w,ai.h,6);ctx.fill();ctx.shadowBlur=0;

    // Vẽ items + vệt + chữ + thanh + đếm + combo
    if(Items)Items.draw();

    // Vẽ hộp gacha
    if(Gacha) Gacha.draw();

    // Bóng thật
    ctx.globalAlpha=Items?Items.ballAlpha():1;
    ctx.fillStyle=b._c||'#fff';
    ctx.shadowColor=b._c==='#000'?'#ef4444':'rgba(255,255,255,.9)';ctx.shadowBlur=22;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
    if(b._c==='#000'){ctx.strokeStyle='#ef4444';ctx.lineWidth=2;ctx.stroke();}
    ctx.shadowBlur=0;ctx.globalAlpha=1;

    ctx.restore();
  }

  function lp(ts){
    up(ts);dr(ts);
    if(window.Debug && Debug.isOn()) Debug.update(ts);
    requestAnimationFrame(lp);
  }
  rg();requestAnimationFrame(lp);
  console.log('✅ Pong FULL: 12 items + vệt + đếm + rung + bay + combo HOÀN CHỈNH');
})();