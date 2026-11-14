import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type ColorFieldProps = {
  label: string;
  value?: string;
  fallback: string;
  onChange: (value: string | undefined) => void;
};
const SWATCHES = ['#ffffff','#f8faf7','#e8f3d2','#c9f36a','#9bd6bd','#a6cff2','#efd3c5','#f8e8bd','#20392d','#19231f','#3e4750','#101510'];
const validHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

/** A tiny in-place palette; no external colour dialog or navigation is required. */
export function StudioColorField({ label, value, fallback, onChange }: ColorFieldProps) {
  const [typed,setTyped]=useState(value??'');
  useEffect(()=>setTyped(value??''),[value]);
  const apply=(color:string)=>{const clean=color.toLowerCase();setTyped(clean);onChange(clean);};
  return <div className="lg-studio-color-field">
    <div className="lg-studio-color-heading"><strong>{label}</strong><span>{value?'Personalizada':'Cor original'}</span></div>
    <div className="lg-studio-color-input-row">
      <label className="lg-studio-color-native" title={'Escolher '+label.toLowerCase()}>
        <span style={{background:value||fallback}}/>
        <input type="color" aria-label={'Seletor de '+label.toLowerCase()} value={validHex(value||'')?value:fallback} onChange={e=>apply(e.target.value)}/>
      </label>
      <input aria-label={label+' em hexadecimal'} className="lg-studio-color-hex" type="text" spellCheck={false} maxLength={7}
        placeholder={fallback.toUpperCase()} value={typed}
        onChange={e=>{const next=e.target.value;setTyped(next);if(validHex(next))onChange(next.toLowerCase());}}
        onBlur={()=>setTyped(value??'')}/>
      <button type="button" className="lg-studio-color-reset" onClick={()=>{setTyped('');onChange(undefined);}} title={'Repor '+label.toLowerCase()} aria-label={'Repor '+label.toLowerCase()}><RotateCcw size={14}/></button>
    </div>
    <div className="lg-studio-color-swatches" role="group" aria-label={'Paleta para '+label.toLowerCase()}>
      {SWATCHES.map(color=><button type="button" key={color} className={'lg-studio-color-swatch'+((value||fallback).toLowerCase()===color?' is-active':'')}
        title={color.toUpperCase()} aria-label={'Escolher '+color+' para '+label.toLowerCase()}
        aria-pressed={(value||fallback).toLowerCase()===color}
        style={{background:color}} onClick={()=>apply(color)}/>)}
    </div>
  </div>;
}
