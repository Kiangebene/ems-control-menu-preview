import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Check, ImagePlus, Trash2, X } from 'lucide-react';

/**
 * Isolated browser-only media library. Never calls the production media APIs.
 * Image files are stored as Blobs in IndexedDB, not in localStorage drafts or JSON exports.
 * The native LuxGrowth Studio uses authenticated, signed URLs and tenant media IDs.
 */
const DB_NAME = 'luxgrowth-studio-preview-media-v1';
const STORE = 'media';
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_SIZE = 4 * 1024 * 1024;

export type StoredMedia = {
  id: string;
  siteId: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: number;
  blob: Blob;
};
export type PreviewMedia = Omit<StoredMedia,'blob'> & {url:string};

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Este navegador não suporta armazenamento IndexedDB.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onerror = () => reject(request.error ?? new Error('Erro ao abrir a biblioteca.'));
    request.onsuccess = () => resolve(request.result);
  });
}
async function transaction<T>(mode: IDBTransactionMode, action: (store:IDBObjectStore)=>IDBRequest<T>):Promise<T> {
  const db = await openMediaDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode);
    const request=action(tx.objectStore(STORE));
    let value:T;
    request.onsuccess=()=>{value=request.result;};
    request.onerror=()=>reject(request.error ?? new Error('Erro na biblioteca.'));
    tx.oncomplete=()=>{db.close();resolve(value);};
    tx.onerror=()=>{db.close();reject(tx.error ?? new Error('Erro de armazenamento.'));};
    tx.onabort=()=>{db.close();reject(tx.error ?? new Error('Operação cancelada.'));};
  });
}
async function readAll(siteId:string):Promise<StoredMedia[]> {
  const all=await transaction<StoredMedia[]>('readonly',store=>store.getAll());
  return all.filter(item=>item.siteId===siteId).sort((a,b)=>b.createdAt-a.createdAt);
}
async function storeMedia(item:StoredMedia) {
  await transaction<IDBValidKey>('readwrite',store=>store.put(item));
}
async function deleteMedia(id:string) {
  await transaction<undefined>('readwrite',store=>store.delete(id) as IDBRequest<undefined>);
}

export function usePreviewMedia(siteId:string) {
  const [items,setItems]=useState<PreviewMedia[]>([]);
  const [version,setVersion]=useState(0);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    const urls:string[]=[];
    setItems([]);
    readAll(siteId).then(rows=>{
      if(cancelled)return;
      const next=rows.map(({blob,...meta})=>{
        const url=URL.createObjectURL(blob);urls.push(url);
        return {...meta,url};
      });
      setItems(next);
    }).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:String(e));});
    return ()=>{cancelled=true;urls.forEach(url=>URL.revokeObjectURL(url));};
  },[siteId,version]);
  const upload=useCallback(async(file:File)=>{
    if(!ALLOWED_TYPES.has(file.type))throw new Error('Apenas JPEG, PNG, WebP ou AVIF são aceites.');
    if(file.size===0||file.size>MAX_SIZE)throw new Error('O ficheiro deve ter entre 1 byte e 4 MiB.');
    setBusy(true);setError('');
    try {
      const id=(typeof crypto!=='undefined'&&'randomUUID'in crypto)?crypto.randomUUID():'media-'+Date.now()+'-'+Math.random().toString(36).slice(2);
      await storeMedia({id,siteId,name:file.name.slice(0,140),mimeType:file.type,size:file.size,createdAt:Date.now(),blob:file});
      setVersion(v=>v+1);
    } catch(e){const msg=e instanceof Error?e.message:String(e);setError(msg);throw e;}
    finally{setBusy(false);}
  },[siteId]);
  const remove=useCallback(async(id:string)=>{
    setBusy(true);setError('');
    try{await deleteMedia(id);setVersion(v=>v+1);}
    catch(e){setError(e instanceof Error?e.message:String(e));}
    finally{setBusy(false);}
  },[]);
  return {items,error,busy,upload,remove};
}

type Props={
  open:boolean;siteName:string;items:PreviewMedia[];selectedId?:string;
  busy:boolean;error:string;
  onUpload:(file:File)=>Promise<void>;
  onRemove:(id:string)=>Promise<void>;
  onSelect:(id:string|undefined)=>void;
  onClose:()=>void;
};
export function LocalMediaLibrary({open,siteName,items,selectedId,busy,error,onUpload,onRemove,onSelect,onClose}:Props){
  const [message,setMessage]=useState('');
  useEffect(()=>{if(open)setMessage('');},[open]);
  if(!open)return null;
  const handleFile=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.currentTarget.files?.[0];
    if(!file)return;
    try{await onUpload(file);setMessage('Imagem guardada localmente. Seleciona-a para associar ao Hero.');}
    catch(e){setMessage(e instanceof Error?e.message:String(e));}
    event.currentTarget.value='';
  };
  return <div className="lg-studio-media-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section role="dialog" aria-modal="true" aria-label="Biblioteca multimédia local" className="lg-studio-media-modal">
      <header className="lg-studio-media-heading">
        <div><small>WEBSITE STUDIO · DEMONSTRAÇÃO LOCAL</small><h2>Biblioteca multimédia</h2><p>{siteName} · Apenas imagens guardadas neste navegador</p></div>
        <button type="button" aria-label="Fechar biblioteca" onClick={onClose}><X size={19}/></button>
      </header>
      <div className="lg-studio-media-actions">
        <label className="lg-studio-button lg-studio-button--save">
          <ImagePlus size={17}/> Adicionar imagem
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={handleFile} />
        </label>
        <span>JPEG, PNG, WebP, AVIF · até 4 MiB</span>
      </div>
      {(error||message)&&<p role="status" className="lg-studio-media-message">{error||message}</p>}
      <div className="lg-studio-media-grid">
        {items.length===0&&<p className="lg-studio-panel-subtitle">Ainda não existem imagens para este website. Adiciona uma imagem para começar.</p>}
        {items.map(item=><article key={item.id} className={'lg-studio-media-item'+(item.id===selectedId?' is-selected':'')}>
          <button type="button" className="lg-studio-media-select" onClick={()=>{onSelect(item.id);onClose();}} title="Usar imagem na secção selecionada">
            <img src={item.url} alt={item.name}/>
            <span>{item.name}</span>
            {item.id===selectedId&&<Check size={16}/>}
          </button>
          <button className="lg-studio-media-remove" type="button" disabled={busy} title="Remover imagem local" aria-label={'Remover '+item.name}
            onClick={()=>{if(window.confirm('Remover esta imagem apenas da biblioteca local?'))void onRemove(item.id);}}><Trash2 size={15}/></button>
        </article>)}
      </div>
      <footer className="lg-studio-media-footer">
        <span>Sem upload para servidores, sem publicação ou associação a um mediaId de produção.</span>
        {selectedId&&<button type="button" onClick={()=>{onSelect(undefined);onClose();}}>Desassociar imagem</button>}
      </footer>
    </section>
  </div>;
}
