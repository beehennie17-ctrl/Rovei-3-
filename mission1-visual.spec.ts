import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {renderLockedShellDocument} from '../../lib/auth/locked-shell';

// Mission 1 review-only fixtures. Never use a hosted account or payment provider.
const key='rovei:full-process-preview-v3';
function fixtureState(screen='app',appPage='home'){
 return {version:3,screen,appPage,productTourCompleted:true,billing:'monthly',studio:{exists:true,name:'Fixture Studio',timezone:'UTC',services:['lashes'],theme:'wine',customPrimary:'#941651',modules:['consultation','consent']},account:{firstName:'Fixture',email:'fixture@example.invalid',terms:true},clients:[],visits:[],beautyPacks:[{id:'40000000-0000-4000-8000-000000000001',name:'Fixture Pack',service:'lashes',modules:['consultation','consent']}],settings:{subscriptionStatus:screen==='activation'?'inactive':'active',availability:{timezone:'UTC'}},signupDraft:{password:''},clientLinkToken:'10000000-0000-4000-8000-000000000001'};
}
async function guard(page:Page){
 await page.route('**/api/**',route=>route.abort('blockedbyclient'));
 await page.route(/https:\/\/[^/]*(?:paddle\.com|supabase\.co)\//,route=>route.abort('blockedbyclient'));
}
async function stable(page:Page){
 await page.evaluate(async()=>{
  await document.fonts.ready;
  const visible=Array.from(document.images).filter(image=>{const box=image.getBoundingClientRect();return box.bottom>0&&box.top<innerHeight;});
  await Promise.all(visible.map(image=>image.decode().catch(()=>{})));
  await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
 });
 await page.waitForTimeout(150);
}
async function shell(page:Page,state:ReturnType<typeof fixtureState>){
 const html=await readFile('reference/Rovei_APPROVED_FINAL_FRONTEND.html','utf8');
 const seed=`<script>localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(JSON.stringify(state)).replace(/</g,'\\u003c')});</script>`;
 await page.route('**/mission1-approved',route=>route.fulfill({contentType:'text/html',body:html.replace('</head>',seed+'</head>')}));
 await page.route('**/mission1-runtime',route=>route.fulfill({contentType:'text/html',body:renderLockedShellDocument(html,state,null)}));
}
for(const width of [320,390,1440]){
 for(const view of ['activation','home','clients','packs'])test(`approved ${view} pixels retained at ${width}px`,async({page},info)=>{
  await guard(page);await page.setViewportSize({width,height:1000});await shell(page,fixtureState(view==='activation'?'activation':'app',view));
  await page.goto('/mission1-approved');await stable(page);
  const baseline=await page.screenshot({path:info.outputPath(`approved-${view}-${width}.png`),fullPage:true,animations:'disabled',caret:'hide'});
  await page.goto('/mission1-runtime');await stable(page);
  const current=await page.screenshot({path:info.outputPath(`runtime-${view}-${width}.png`),fullPage:true,animations:'disabled',caret:'hide'});
  expect(current.equals(baseline),'Approved-source and runtime PNGs must match exactly').toBe(true);
 });
 test(`public homepage and gallery pixels retained at ${width}px`,async({page},info)=>{
  await guard(page);await page.setViewportSize({width,height:1000});
  const html=await readFile('public/rovei-landing.html','utf8');
  await page.route('**/mission1-approved-public',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('/mission1-approved-public');await stable(page);
  const baseline=await page.screenshot({path:info.outputPath(`approved-home-${width}.png`),animations:'disabled'});
  const gallery=page.locator('.rovei-pack-showcase');await gallery.scrollIntoViewIfNeeded();await stable(page);
  const before=await gallery.screenshot({path:info.outputPath(`approved-gallery-${width}.png`),animations:'disabled'});
  await page.goto('/');await stable(page);
  const current=await page.screenshot({path:info.outputPath(`runtime-home-${width}.png`),animations:'disabled'});
  expect(current.equals(baseline)).toBe(true);
  await gallery.scrollIntoViewIfNeeded();await stable(page);
  const after=await gallery.screenshot({path:info.outputPath(`runtime-gallery-${width}.png`),animations:'disabled'});
  expect(after.equals(before)).toBe(true);
 });
}
async function billingFixture(page:Page,hold=false){
 await guard(page);let calls=0,release:()=>void=()=>{};
 const wait=new Promise<void>(resolve=>{release=resolve;});
 await page.route('https://cdn.paddle.com/**',route=>route.fulfill({contentType:'application/javascript',body:"window.Paddle={Environment:{set(){}},Initialize(){},Checkout:{open(){document.querySelector('.rovei-payment-frame').innerHTML='<div aria-label=\"Mock Paddle frame\">Fixture only</div>'},close(){}}};"}));
 await page.route('**/api/billing/subscription',route=>route.fulfill({json:{status:'inactive',email:'fixture@example.invalid',accessActive:false}}));
 await page.route('**/api/billing/checkout',async route=>{calls++;if(hold)await wait;await route.fulfill({json:{transactionId:'txn_'+'a'.repeat(26)}});});
 return {calls:()=>calls,release};
}
test('approved activation button navigates to the existing premium checkout',async({page})=>{
 await billingFixture(page);await shell(page,fixtureState('activation'));
 await page.goto('/mission1-runtime');await page.locator('#activateStudio').click();
 await expect(page).toHaveURL(/\/activate\/checkout\?billing=monthly$/);
 await expect(page.getByRole('button',{name:'Continue to subscribe'})).toBeVisible();
});
test('duplicate checkout clicks create one fixture request',async({page})=>{
 const fixture=await billingFixture(page,true);await page.goto('/activate/checkout');
 await page.getByRole('button',{name:'Continue to subscribe'}).evaluate(button=>{if(button instanceof HTMLButtonElement){button.click();button.click();}});
 await expect.poll(fixture.calls).toBe(1);fixture.release();
 await expect(page.getByLabel('Mock Paddle frame')).toBeVisible();expect(fixture.calls()).toBe(1);
});
