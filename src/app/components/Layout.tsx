import { useCallback, useEffect, useState } from 'react';
import { LuxGrowthSidebar } from './LuxGrowthSidebar';
import { LuxGrowthTopNav } from './LuxGrowthTopNav';
import { destinationFor } from './luxgrowth-menu-data';
import { LuxGrowthModulePreview } from './LuxGrowthModulePreview';
import { ClientsPage } from './luxgrowth/clients/ClientsPage';
import { Dashboard } from './Dashboard';
import { Analytics } from './Analytics';
import { Configuration } from './Configuration';
import { Reports } from './Reports';
import { Settings } from './Settings';
import { useLocalSetting } from './useLocalSetting';

const pageFromHash=()=>{
 const value=window.location.hash.replace(/^#\/?/,'');
 return destinationFor(value)?value:'dashboard';
};
export function Layout(){
 const [currentPage,setCurrentPage]=useState(pageFromHash);
 const [isDark,setIsDark]=useLocalSetting<boolean>('ems-original-dashboard-dark-v2',false);
 const [userName,setUserName]=useLocalSetting<string>('ems-demo-name-v1','Liam Gallagher');
 const navigate=useCallback((page:string)=>{if(!destinationFor(page))return;setCurrentPage(page);const hash='#/'+page;if(window.location.hash!==hash)window.location.hash=hash},[]);
 useEffect(()=>{const sync=()=>setCurrentPage(pageFromHash());window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',isDark);return()=>document.documentElement.classList.remove('dark')},[isDark]);
 return <div className="ems-preserved-app lg-app">
  <LuxGrowthSidebar currentPage={currentPage} onPageChange={navigate} isDark={isDark} onThemeToggle={()=>setIsDark(v=>!v)} userName={userName}/>
  <main id="main-content" className="ems-preserved-content lg-main">
   <LuxGrowthTopNav currentPage={currentPage} onPageChange={navigate} />
   <div className="lg-current-page" key={currentPage}>
   {currentPage==='dashboard'&&<Dashboard/>}
   {currentPage==='analytics'&&<Analytics/>}
   {currentPage==='configuration'&&<Configuration/>}
   {currentPage==='reports'&&<Reports/>}
   {currentPage==='settings'&&<Settings userName={userName} onSaveUserName={setUserName} isDark={isDark} onThemeToggle={()=>setIsDark(v=>!v)}/>}
   {currentPage==='lg/crm-vendas/clientes'&&<ClientsPage/>}
   {currentPage.startsWith('lg/')&&currentPage!=='lg/crm-vendas/clientes'&&<LuxGrowthModulePreview page={currentPage} onGoBack={()=>navigate('dashboard')}/>}
   </div>
  </main>
 </div>
}