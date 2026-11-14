import { useEffect, useRef, useState, type PointerEvent } from 'react';

export type DirectHeroImage = {
  opacityPct?: number;
  zoomPct?: number;
  offsetX?: number;
  offsetY?: number;
  positionX?: number;
  positionY?: number;
  fit?: 'contain' | 'cover';
};

const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export function HeroImageLayer({src,settings,onCommit}:{src:string;settings?:DirectHeroImage;onCommit:(next:DirectHeroImage)=>void}) {
  const frame=useRef<HTMLDivElement|null>(null);
  const drag=useRef<{pointerId:number;x:number;y:number;offsetX:number;offsetY:number}|null>(null);
  const [position,setPosition]=useState({x:settings?.offsetX??0,y:settings?.offsetY??0});
  const [dragging,setDragging]=useState(false);
  useEffect(()=>{if(!drag.current)setPosition({x:settings?.offsetX??0,y:settings?.offsetY??0});},[settings?.offsetX,settings?.offsetY]);
  const start=(e:PointerEvent<HTMLDivElement>)=>{
    if(e.button!==0&&e.pointerType==='mouse')return;
    const el=frame.current;if(!el)return;
    drag.current={pointerId:e.pointerId,x:e.clientX,y:e.clientY,offsetX:position.x,offsetY:position.y};
    el.setPointerCapture(e.pointerId);
    setDragging(true);
    e.preventDefault();
  };
  const move=(e:PointerEvent<HTMLDivElement>)=>{
    if(!drag.current||drag.current.pointerId!==e.pointerId)return;
    const rect=frame.current?.getBoundingClientRect();
    if(!rect?.width||!rect.height)return;
    setPosition({
      x:clamp(drag.current.offsetX+(e.clientX-drag.current.x)/rect.width*100,-100,100),
      y:clamp(drag.current.offsetY+(e.clientY-drag.current.y)/rect.height*100,-100,100)
    });
  };
  const finish=(e:PointerEvent<HTMLDivElement>)=>{
    const origin=drag.current;if(!origin||origin.pointerId!==e.pointerId)return;
    const rect=frame.current?.getBoundingClientRect();
    const x=rect?.width?clamp(origin.offsetX+(e.clientX-origin.x)/rect.width*100,-100,100):position.x;
    const y=rect?.height?clamp(origin.offsetY+(e.clientY-origin.y)/rect.height*100,-100,100):position.y;
    drag.current=null;
    setDragging(false);
    setPosition({x,y});
    if(e.type==='pointerup'&&(Math.abs(x-origin.offsetX)>.05||Math.abs(y-origin.offsetY)>.05))
      onCommit({...settings,fit:'contain',zoomPct:settings?.zoomPct??100,offsetX:x,offsetY:y});
  };
  // Direct editing preserves the old cover/contain presentation until the user
  // manipulates the image. New edits switch to one continuous zoom model.
  const direct=settings?.zoomPct!==undefined||settings?.offsetX!==undefined||settings?.offsetY!==undefined;
  return <div ref={frame} className={'lg-studio-direct-image'+(dragging?' is-dragging':'')}
    title="Arrasta a imagem para a posicionar" aria-label="Arrastar imagem do Hero"
    onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}>
    <img draggable={false} src={src} alt="" style={{
      opacity:(settings?.opacityPct??22)/100,
      objectFit:direct?'contain':(settings?.fit??'cover'),
      objectPosition:(settings?.positionX??50)+'% '+(settings?.positionY??50)+'%',
      transform:direct?'translate('+position.x+'%, '+position.y+'%) scale('+(settings?.zoomPct??100)/100+')':undefined,
    }}/>
    <span className="lg-studio-drag-hint">{dragging?'A posicionar…':'Arrastar para posicionar'}</span>
  </div>;
}
