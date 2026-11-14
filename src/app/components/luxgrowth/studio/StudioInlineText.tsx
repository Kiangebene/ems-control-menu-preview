import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

type EditableTag = 'small'|'h2'|'p'|'span';
type Props = {
  as:EditableTag;
  value:string;
  label:string;
  onSelect:()=>void;
  onCommit:(next:string)=>void;
  multiline?:boolean;
  maxLength?:number;
  className?:string;
};

/**
 * Inline copy editor for the isolated Studio preview.
 * A single click selects the section; double click edits the text in place.
 * Enter confirms one-line fields, Ctrl/Cmd+Enter confirms multiline text,
 * Escape cancels, and leaving the field commits. Never submits or publishes.
 */
export function StudioInlineText({
  as, value, label, onSelect, onCommit, multiline=false, maxLength=1200, className=''
}:Props) {
  const Tag=as;
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(value);
  const inputRef=useRef<HTMLInputElement|HTMLTextAreaElement|null>(null);
  const cancelBlur=useRef(false);
  useEffect(()=>{if(!editing)setDraft(value);},[value,editing]);
  useEffect(()=>{
    if(editing){
      const element=inputRef.current;
      element?.focus();
      if(element && 'select' in element)element.select();
    }
  },[editing]);
  const apply=()=>{
    if(cancelBlur.current){cancelBlur.current=false;return;}
    const next=draft.slice(0,maxLength);
    setEditing(false);
    if(next!==value)onCommit(next);
  };
  const cancel=()=>{
    cancelBlur.current=true;
    setDraft(value);
    setEditing(false);
  };
  const handleKey=(event:KeyboardEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
    if(event.key==='Escape'){
      event.preventDefault();
      cancel();
    }else if(event.key==='Enter' && (!multiline||event.ctrlKey||event.metaKey)){
      event.preventDefault();
      apply();
    }
  };
  return <Tag className={'lg-studio-inline-text '+className+(editing?' is-editing':'')}
    title={editing?undefined:'Duplo clique para editar '+label.toLowerCase()}
    onClick={onSelect}
    onDoubleClick={event=>{event.stopPropagation();onSelect();cancelBlur.current=false;setDraft(value);setEditing(true);}}>
    {editing
      ? multiline
        ? <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} aria-label={'Editar '+label.toLowerCase()} rows={3}
            maxLength={maxLength} value={draft} onChange={event=>setDraft(event.target.value)}
            onKeyDown={handleKey} onBlur={apply} onClick={event=>event.stopPropagation()} />
        : <input ref={inputRef as React.Ref<HTMLInputElement>} aria-label={'Editar '+label.toLowerCase()}
            maxLength={maxLength} value={draft} onChange={event=>setDraft(event.target.value)}
            onKeyDown={handleKey} onBlur={apply} onClick={event=>event.stopPropagation()} />
      : value || <span className="lg-studio-inline-placeholder">Duplo clique para editar</span>}
  </Tag>;
}
