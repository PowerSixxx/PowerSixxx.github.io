/* Reconstructed from REA-observed ArtCraft ruler module 54227 on 2026-10-12.
   Original defaults and mapping/letter-flight formula: analysis/ruler/REPORT.md.
   Native DOM/RAF implementation; personal labels and system reduced motion. */
window.createArtcraftInstrument = function(sections) {
  const cfg = window.ARTCRAFT_INSTRUMENT_CONFIG = {
    rail:60, edge:12, nav:48, threshold:.12, heading:34, riding:20, queue:16,
    top:28, gap:26, slot:20, bottom:36, flip:200, detach:240, stagger:.16, arc:28,
    heroLead:100, heroZone:320, zoomDelay:150, zoomDamping:10,
    velocityRadius:180, velocityStretch:.6, intro:1, tickStagger:.01, snapDelay:400, snapDuration:.7, wheelLerp:.12, footerZone:360, footerDamping:10
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = x => Math.max(0,Math.min(1,x));
  const mix = (a,b,t) => a+(b-a)*t;
  const cubic = x => x<.5 ? 4*x*x*x : 1-(-2*x+2)**3/2;
  const expo = x => x>=1?1:1-2**(-10*x);
  const root = document.documentElement;
  const rail = document.createElement('div'); rail.className='ac-instrument';
  rail.setAttribute('role','scrollbar'); rail.setAttribute('aria-label','Page position');
  rail.setAttribute('aria-orientation','vertical');rail.setAttribute('aria-valuemin','0');rail.setAttribute('aria-valuemax','100');rail.tabIndex=0;
  const frost=document.createElement('div');frost.className='ac-instrument-frost';rail.append(frost);
  const ticks=Array.from({length:101},(_,pct)=>{
    const el=document.createElement('div');el.className='ac-instrument-tick';
    const line=document.createElement('i');line.style.width=`${pct%5===0?20:10}px`;el.append(line);
    let number;if(pct%5===0){number=document.createElement('span');number.textContent=pct;el.append(number);}
    rail.append(el);return {el,line,number,pct};
  });
  const needle=document.createElement('div');needle.className='ac-instrument-needle';
  const readout=document.createElement('div');readout.className='ac-instrument-readout';
  const digits=Array.from({length:3},()=>{
    const clip=document.createElement('span');clip.className='ac-digit-window';
    const column=document.createElement('span');column.className='ac-digit-column';
    for(let n=0;n<10;n++){const digit=document.createElement('span');digit.textContent=n;column.append(digit);}
    clip.append(column);readout.append(clip);return column;
  });readout.append('%');needle.append(readout);rail.append(needle);
  const bracket=document.createElement('div');bracket.className='ac-instrument-bracket';rail.append(bracket);
  const ghost=document.createElement('div');ghost.className='ac-instrument-ghost';rail.append(ghost);
  const flight=document.createElement('aside');flight.className='ac-heading-flight';flight.setAttribute('aria-label','Page chapters');
  document.body.append(rail,flight);
  const canvas=document.createElement('canvas'), measure=canvas.getContext('2d');
  let records=[], vh=innerHeight,vw=innerWidth,doc=0,max=1,base=60,span=1;
  let zoom=0,intent=false,drag=false,ghostY=0,hovered=false,last=0,lastY=scrollY,velocity=0;
  let start=performance.now(),raf=0,refreshNeeded=true,zoomTimer=0,snapTimer=0,jump=null,dragTarget=0,downY=0,moved=0,states=[],wheelTarget=null;
  const heroHeading=document.querySelector('.ac-hero h1');
  function refresh(){refreshNeeded=true;}
  function rebuild(){
    vh=innerHeight;vw=document.documentElement.clientWidth;doc=document.documentElement.scrollHeight;max=Math.max(1,doc-vh);
    base=cfg.nav+cfg.edge;span=Math.max(1,vh-cfg.nav-2*cfg.edge);
    const small=vw<900;root.style.setProperty('--ruler-rail',`${small?24:cfg.rail}px`);
    rail.dataset.compact=String(small);
    const previous = new Map(records.map(r=>[r.section,r.endFlip]));
    records.forEach(r=>{r.letters.forEach(e=>e.remove());r.hit.remove();});
    records=sections.map((section,index)=>{
      const isHero=section.matches('.ac-hero');const rect=section.getBoundingClientRect();
      const label=isHero?heroHeading.textContent.trim():(section.dataset.instrumentLabel||section.dataset.rail);
      measure.font=`600 ${cfg.heading}px Arial`;
      const advances=Array.from(label,ch=>measure.measureText(ch).width),cum=[];let total=0;
      advances.forEach(a=>{cum.push(total);total+=a;});
      const letters=Array.from(label,ch=>{const s=document.createElement('span');s.className='ac-flight-letter';s.textContent=ch;s.setAttribute('aria-hidden','true');flight.append(s);return s;});
      const hit=document.createElement('a');hit.href=`#${section.id}`;hit.className='ac-flight-hit';
      hit.setAttribute('aria-label',`Jump to ${label}`);hit.addEventListener('click',e=>{e.preventDefault();goTo(isHero?0:section.getBoundingClientRect().top+scrollY-cfg.nav);});flight.append(hit);
      let origin=[],heroFont=cfg.heading;
      if(isHero&&heroHeading.firstChild?.nodeType===3){
        heroFont=parseFloat(getComputedStyle(heroHeading).fontSize);
        const range=document.createRange();Array.from(label).forEach((ch,i)=>{range.setStart(heroHeading.firstChild,i);range.setEnd(heroHeading.firstChild,i+1);const r=range.getBoundingClientRect();origin.push({x:r.left+r.width/2,y:r.top+r.height/2+scrollY});});
      }
      return {section,index,isHero,label,advances,cum,total,letters,hit,origin,heroFont,anchor:rect.top+scrollY,bottom:rect.bottom+scrollY,hover:0,endFlip:previous.get(section)??clamp((scrollY-(max-cfg.footerZone))/cfg.footerZone),terminalStart:null};
    });refreshNeeded=false;
  }
  function goTo(top,duration){
    wheelTarget=null;
    top=Math.max(0,Math.min(max,top));
    if(reduce.matches){scrollTo({top,behavior:'instant'});return;}
    jump={from:scrollY,to:top,start:performance.now(),duration:(duration||1.25*(.4+.6*Math.min(1,Math.abs(top-scrollY)/(2.5*vh))))*1000};
    clearTimeout(snapTimer);
  }
  function pointHorizontal(r,j,y,scale,alpha){const offset=(r.cum[j]+r.advances[j]/2)*scale;return{x:vw-cfg.rail-(r.total*scale-offset),y,rotation:0,scale,alpha};}
  function pointVertical(r,j,y){const scale=cfg.riding/cfg.heading;return{x:vw-cfg.rail/2,y:y+(r.total-r.cum[j]-r.advances[j]/2)*scale,rotation:-90,scale,alpha:.35};}
  function snapshot(dt){
    const p=clamp(scrollY/max),drift=base-p*(cfg.nav+2*cfg.edge);
    const line=vh*cfg.threshold;
    states=records.map((r,index)=>{
      const ride=r.anchor-scrollY+drift,length=r.total*cfg.riding/cfg.heading;
      let flip=clamp((line+cfg.flip-ride)/cfg.flip),detach=0; r.terminalStart=null;
      if(r.isHero){const top=Math.max(0,(r.origin[0]?.y-r.heroFont/2||0)-cfg.nav-cfg.heroLead);flip=clamp((scrollY-top)/cfg.heroZone);detach=1;}
      else if(index===0){flip=1;detach=1;}
      else if(r.anchor-max>line){
        r.terminalStart=Math.max(0,max-Math.min(cfg.footerZone,max));
        const target=clamp((scrollY-r.terminalStart)/Math.max(1,max-r.terminalStart));
        r.endFlip=mix(r.endFlip,target,reduce.matches?1:1-Math.exp(-cfg.footerDamping*dt));
        if(Math.abs(r.endFlip-target)<.0005)r.endFlip=target;
        flip=Math.max(flip,r.endFlip);
      }
      return {ride,length,flip,detach,queueY:vh-cfg.bottom};
    });
    let queued=0;for(let i=records.length-1;i>=0;i--){if(records[i].isHero||i===0)continue;const s=states[i];s.queueY=vh-cfg.bottom-cfg.slot*queued;s.detach=clamp((s.queueY+cfg.detach-(s.ride+s.length))/cfg.detach);queued+=1-s.detach;}
    return{p,drift};
  }
  function animate(now){
    raf=0;const dt=Math.min(.1,(now-last)/1000)||.016;last=now;if(refreshNeeded)rebuild();
    if(jump){const t=clamp((now-jump.start)/jump.duration);scrollTo({top:mix(jump.from,jump.to,expo(t)),behavior:'instant'});if(t>=1)jump=null;}
    if(wheelTarget!==null&&!drag&&!jump){scrollTo({top:mix(scrollY,wheelTarget,1-Math.exp(-60*cfg.wheelLerp*dt)),behavior:'instant'});if(Math.abs(wheelTarget-scrollY)<.5)wheelTarget=null;}
    if(drag&&!reduce.matches)scrollTo({top:mix(scrollY,dragTarget,.18),behavior:'instant'});
    const speed=(scrollY-lastY)/dt;velocity+=(speed-velocity)*(1-Math.exp(-6*dt));lastY=scrollY;
    const {p,drift}=snapshot(dt);const quiet=reduce.matches||vw<900;
    zoom+=((intent||drag)&&!quiet?1-zoom:-zoom)*(1-Math.exp(-cfg.zoomDamping*dt));
    if(zoom<.0005)zoom=0;if(zoom>.9995)zoom=1;
    const z=cubic(zoom), needleY=base+p*span;
    rail.setAttribute('aria-valuenow',String(Math.round(p*100)));rail.dataset.zoom=zoom.toFixed(3);
    needle.style.transform=`translateY(${needleY}px)`;needle.style.opacity=String(clamp(p/.03));readout.style.top=needleY>vh-26?'-14px':'4px';
    String(Math.round(p*100)).padStart(3,'0').split('').forEach((n,i)=>{digits[i].style.transform=`translateY(${-Number(n)}em)`;});
    bracket.style.transform=`translateY(${base+scrollY/doc*span}px)`;bracket.style.height=`${vh/doc*span}px`;bracket.style.opacity=zoom;
    ghost.style.top=`${ghostY}px`;ghost.style.opacity=hovered?String(.2+.8*zoom):'0';
    const completed=states.filter(s=>s.flip>=1).length,partial=states.reduce((sum,s)=>sum+(s.flip>0&&s.flip<1?s.flip:0),0);
    const occupied=[];let active=-1;
    records.forEach((r,index)=>{
      const s=states[index];if(s.flip>0)active=index;
      const shown=r.hit.matches(':hover')||r.hit===document.activeElement;
      r.hover+=(Number(shown)-r.hover)*(1-Math.exp(-dt/.08));
      let loX=Infinity,hiX=-Infinity,loY=Infinity,hiY=-Infinity;
      const topY=cfg.nav+cfg.top+index*cfg.slot;
      const shrink=s.flip>=1?(index===completed-1?partial:1):0;
      const endScale=mix(1,cfg.queue/cfg.heading,shrink),endAlpha=mix(1,.35,shrink);
      const topDestination=topY+cfg.gap*(1-shrink);
      const progress=s.flip>0?s.flip:s.detach<1?s.detach:1;
      const stagger=cfg.stagger,total=1+(r.letters.length-1)*stagger;
      r.letters.forEach((el,j)=>{
        let from,to;
        const origin=()=>r.origin[j]?{x:r.origin[j].x,y:r.origin[j].y-scrollY,rotation:0,scale:r.heroFont/cfg.heading,alpha:1}:pointVertical(r,j,s.ride);
        const terminalOrigin=()=>{
          if(s.detach>=1)return pointVertical(r,j,s.ride);
          const a=pointHorizontal(r,j,s.queueY,cfg.queue/cfg.heading,.35),b=pointVertical(r,j,s.queueY-s.length);
          const t=quiet?s.detach:cubic(clamp(s.detach*total-(r.letters.length-1-j)*stagger)),q=1-t;
          return{x:q*q*a.x+2*q*t*((a.x+b.x)/2-cfg.arc)+t*t*b.x,y:q*q*a.y+2*q*t*((a.y+b.y)/2)+t*t*b.y,rotation:mix(a.rotation,b.rotation,t),scale:mix(a.scale,b.scale,t),alpha:mix(a.alpha,b.alpha,t)};
        };
        if(s.flip>0){from=r.isHero?origin():r.terminalStart!==null?terminalOrigin():pointVertical(r,j,s.ride);to=pointHorizontal(r,j,topDestination,endScale,endAlpha);}
        else if(s.detach<1){from=pointHorizontal(r,j,s.queueY,cfg.queue/cfg.heading,.35);to=pointVertical(r,j,s.queueY-s.length);}
        else from=to=r.isHero?origin():pointVertical(r,j,s.ride);
        const reverse=s.flip>0||s.detach<1;
        const phase=quiet?progress:cubic(clamp(progress*total-(reverse?r.letters.length-1-j:j)*stagger));
        const midX=(from.x+to.x)/2-cfg.arc,midY=(from.y+to.y)/2;
        const one=1-phase;
        let x=one*one*from.x+2*one*phase*midX+phase*phase*to.x;
        let y=one*one*from.y+2*one*phase*midY+phase*phase*to.y;
        let rotation=mix(from.rotation,to.rotation,phase),scale=mix(from.scale,to.scale,phase),alpha=mix(from.alpha,to.alpha,phase);
        const map=pointHorizontal(r,j,base+(r.isHero?0:r.anchor)/doc*span,cfg.queue/cfg.heading,.85);
        const zz=r.isHero?z*Math.min(1,s.flip):z;
        x=mix(x,map.x,zz);y=mix(y,map.y,zz);rotation*=1-zz;scale=mix(scale,map.scale,zz);alpha=mix(alpha,map.alpha,zz);
        const heroInPlace=r.isHero&&s.flip===0;
        el.style.opacity=heroInPlace||quiet?'0':'1';el.style.color=`color-mix(in srgb,var(--ink) ${100*mix(alpha,1,r.hover)}%,var(--paper))`;
        el.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        el.style.fontWeight=r.isHero?String(Math.round(mix(900,600,s.flip))):'600';
        const a=r.advances[j]*scale/2+2,b=cfg.heading*scale/2+2,vertical=Math.abs(rotation)>45;
        loX=Math.min(loX,x-(vertical?b:a));hiX=Math.max(hiX,x+(vertical?b:a));loY=Math.min(loY,y-(vertical?a:b));hiY=Math.max(hiY,y+(vertical?a:b));
      });
      if(r.isHero&&heroHeading)heroHeading.style.opacity=s.flip>0&&!quiet?'0':'1';
      if(quiet){const y=cfg.nav+cfg.top+index*cfg.slot;r.hit.textContent=r.label;r.hit.style.cssText=`right:${vw<900?30:cfg.rail+8}px;top:${y}px;font-size:12px;color:var(--muted);width:auto;height:auto;`;}
      else{r.hit.textContent='';r.hit.style.cssText=`left:${loX}px;top:${loY}px;width:${hiX-loX}px;height:${hiY-loY}px;`;}
      r.hit.style.pointerEvents=r.isHero&&s.flip===0&&!quiet?'none':'auto';
      r.hit.toggleAttribute('data-current',index===active);r.hit.setAttribute('aria-current',index===active?'location':'false');
      if(s.detach*(1-s.flip)>.02)occupied.push({top:s.ride,bottom:s.ride+s.length,k:s.detach*(1-s.flip)});
    });
    ticks.forEach(t=>{
      const docY=t.pct/100*doc,ordinary=docY-scrollY+drift,compact=base+t.pct/100*span,y=mix(ordinary,compact,zoom);
      const age=(now-start)/1000-t.pct*cfg.tickStagger,entrance=quiet?1:expo(clamp(age/cfg.intro));
      const proximity=clamp(1-Math.abs(docY-p*doc)/cfg.velocityRadius),stretch=quiet?0:clamp(Math.abs(velocity)/3000)*proximity**2;
      t.el.style.transform=`translateY(${y.toFixed(2)}px)`;
      t.line.style.transform=`scaleX(${entrance*(1+cfg.velocityStretch*stretch)})`;
      t.line.style.opacity=String(Math.min(1,(t.number?.8:.4)+.6*stretch));
      if(t.number){let alpha=1;for(const word of occupied){const distance=y<word.top?word.top-y:y>word.bottom?y-word.bottom:0;if(distance<24)alpha=Math.min(alpha,1-word.k*(1-distance/24));}t.number.style.opacity=String(.5*mix(alpha,1,zoom));}
    });
    if(!document.hidden)raf=requestAnimationFrame(animate);
  }
  function hover(on){clearTimeout(zoomTimer);zoomTimer=setTimeout(()=>{intent=on},cfg.zoomDelay);}
  function railTarget(y){return clamp((y-base)/span)*max;}
  rail.addEventListener('pointerenter',()=>{hovered=true;hover(true);});
  rail.addEventListener('pointerleave',()=>{hovered=false;if(!drag)hover(false);});
  rail.addEventListener('pointermove',e=>{ghostY=Math.max(base,Math.min(base+span,e.clientY));if(drag){moved=Math.max(moved,Math.abs(e.clientY-downY));dragTarget=railTarget(e.clientY);}});
  rail.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag=true;jump=null;wheelTarget=null;clearTimeout(snapTimer);downY=e.clientY;moved=0;dragTarget=scrollY;rail.setPointerCapture(e.pointerId);});
  rail.addEventListener('pointerup',e=>{drag=false;if(moved<4)goTo(railTarget(e.clientY));if(!hovered)hover(false);});
  rail.addEventListener('pointercancel',()=>{drag=false;hover(false);});
  rail.addEventListener('keydown',e=>{const moves={ArrowDown:scrollY+max*.01,ArrowUp:scrollY-max*.01,PageDown:scrollY+vh,PageUp:scrollY-vh,Home:0,End:max};if(e.key in moves){e.preventDefault();goTo(moves[e.key]);}});
  function snap(){if(reduce.matches||drag||jump||vw<900)return;if(Math.abs(velocity)>120){snapTimer=setTimeout(snap,80);return;}const i=states.findIndex((s,i)=>s.flip>.04&&s.flip<.96&&records[i].terminalStart===null);if(i<0)return;const r=records[i],s=states[i],goal=s.flip>=.5?1:0;let y;
    if(r.isHero)y=Math.max(0,(r.origin[0]?.y-r.heroFont/2||0)-cfg.nav-cfg.heroLead)+(goal?cfg.heroZone+4:-4);
    else y=(r.anchor+base-vh*cfg.threshold-cfg.flip*(1-goal))/(1+(cfg.nav+2*cfg.edge)/max)+(goal?4:-4);
    goTo(y,cfg.snapDuration);
  }
  function input(){jump=null;clearTimeout(snapTimer);snapTimer=setTimeout(snap,cfg.snapDelay);}
  addEventListener('wheel',e=>{
    input();
    if(reduce.matches||vw<900||e.ctrlKey||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    for(let node=e.target;node&&node!==document.body;node=node.parentElement){
      if(node.matches?.('textarea,select,dialog,.term-body,.cp-list'))return;
      const css=getComputedStyle(node);if(node.scrollHeight>node.clientHeight+1&&/auto|scroll/.test(css.overflowY))return;
    }
    e.preventDefault();wheelTarget=Math.max(0,Math.min(max,(wheelTarget??scrollY)+e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?vh:1)));
  },{passive:false});
  addEventListener('touchmove',()=>{wheelTarget=null;input();},{passive:true});
  addEventListener('keydown',()=>{wheelTarget=null;});
  addEventListener('resize',refresh);new ResizeObserver(refresh).observe(document.body);
  document.fonts?.ready.then(refresh);new MutationObserver(refresh).observe(root,{attributes:true,attributeFilter:['lang','data-theme']});
  reduce.addEventListener('change',refresh);document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden&&!raf)raf=requestAnimationFrame(animate);});
  rebuild();raf=requestAnimationFrame(animate);return {refresh,goTo};
};
