import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('test-results/comparison',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
for(const [label,url] of [['reference','https://importnow-concept.vercel.app/'],['replica','http://127.0.0.1:5173/']]){
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForTimeout(label==='reference'?16000:2000);
  await page.screenshot({path:`test-results/comparison/${label}-hero.png`});
  const metrics=await page.locator('section[id]').evaluateAll(sections=>sections.map(s=>({id:s.id,height:s.offsetHeight,headings:[...s.querySelectorAll('h2,h3')].map(h=>h.textContent)})));
  await fs.writeFile(`test-results/comparison/${label}-sections.json`,JSON.stringify(metrics,null,2));
  for(const progress of [0,.27,.52,.64,.84,1]){
    await page.locator('#journey').evaluate((section,p)=>scrollTo({top:section.offsetTop+p*(section.offsetHeight-innerHeight),behavior:'instant'}),progress);
    await page.waitForTimeout(label==='reference'?1800:900);
    await page.screenshot({path:`test-results/comparison/${label}-voyage-${Math.round(progress*100)}.png`});
    if(label==='replica')console.log('Voyage',progress,await page.locator('#journey').evaluate(el=>({phase:el.dataset.phase,shipX:el.dataset.shipX,step:el.querySelector('[aria-current="step"]')?.textContent,day:el.querySelector('.journey-day').textContent})));
  }
}
console.log('Browser errors:',errors);
await browser.close();
