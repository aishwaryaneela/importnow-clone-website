import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('https://importnow-concept.vercel.app/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: '../.reference/hero-desktop.png' });
console.log(await page.locator('section').evaluateAll(nodes => nodes.map(n=>({id:n.id,top:n.offsetTop,height:n.offsetHeight}))));
for (const id of ['services','journey','products','trips','work','guides','contact']) {
  await page.locator('#'+id).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../.reference/'+id+'.png' });
}
await page.setViewportSize({width:390,height:844});
await page.goto('https://importnow-concept.vercel.app/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({path:'../.reference/hero-mobile.png'});
await browser.close();
