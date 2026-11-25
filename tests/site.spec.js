import { test, expect } from '@playwright/test';

test('home loads all sections, local assets, and Earth without browser errors',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith('http://127.0.0.1')&&response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Without the guesswork.');
  await expect(page.locator('.globe-stage')).toHaveClass(/loaded/);
  await expect(page.locator('.globe-label')).toHaveCount(6);
  for(const id of ['services','journey','products','shanghai','trips','work','stories','guides','faq','contact'])await expect(page.locator('#'+id)).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('FAQ supports mouse and keyboard disclosure',async({page})=>{
  await page.goto('/#faq');
  const item=page.locator('.faq-list details').nth(1);
  await expect(item).not.toHaveAttribute('open');
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open','');
  await item.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(item).not.toHaveAttribute('open');
});

test('quote validates the name and creates a correctly encoded WhatsApp message',async({page})=>{
  await page.addInitScript(()=>{window.open=(url)=>{window.lastOpenedUrl=url;return null;};});
  await page.goto('/#contact');
  await page.getByRole('button',{name:'Send on WhatsApp'}).click();
  expect(await page.evaluate(()=>window.lastOpenedUrl)).toBeUndefined();
  await page.getByLabel('Your name').fill('Asha & Co.');
  await page.getByLabel('City',{exact:true}).fill('Hyderabad');
  await page.getByLabel('What do you want to import?').selectOption('Electronics & tech');
  await page.getByLabel('Approx. quantity').fill('200 units');
  await page.getByLabel('Budget',{exact:true}).selectOption('₹5–25 lakh');
  await page.getByLabel('Details',{exact:true}).fill('LED screens, 4K + mounting brackets');
  await page.getByRole('button',{name:'Send on WhatsApp'}).click();
  const url=new URL(await page.evaluate(()=>window.lastOpenedUrl));
  expect(url.origin).toBe('https://wa.me');
  expect(url.pathname).toBe('/919989724320');
  const message=url.searchParams.get('text');
  for(const part of ['Asha & Co.','Hyderabad','Electronics & tech','200 units','₹5–25 lakh','4K + mounting brackets'])expect(message).toContain(part);
  await expect(page.getByRole('status')).toContainText('Your quote is ready');
  await expect(page.getByRole('link',{name:'continue to WhatsApp'})).toHaveAttribute('href',url.href);
});

test('trip enquiry preselects the trip in the quote form',async({page})=>{
  await page.goto('/#trips');
  await page.getByRole('link',{name:'Join the next trip'}).click();
  await expect(page.getByLabel('What do you want to import?')).toHaveValue('China business trip / Canton Fair');
  await expect(page).toHaveURL(/#contact$/);
});

test('mobile menu has accessible state, closes on navigation and Escape',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile','Mobile navigation only');
  await page.goto('/');
  const toggle=page.getByRole('button',{name:'Open menu'});
  await toggle.click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(page.getByRole('button',{name:'Close menu'})).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.menu-close-icon')).toHaveCSS('opacity','1');
  await expect(page.locator('.menu-open-icon')).toHaveCSS('opacity','0');
  const size=await page.locator('.menu-toggle').boundingBox();
  expect(size.width).toBeGreaterThanOrEqual(44);expect(size.height).toBeGreaterThanOrEqual(44);
  await page.locator('#mobile-menu').getByRole('link',{name:'Services',exact:true}).click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await page.getByRole('button',{name:'Open menu'}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('html')).not.toHaveClass(/menu-is-open/);
  await expect(page.locator('.menu-open-icon')).toHaveCSS('opacity','1');
  await page.goto('/#contact');
  await page.getByRole('button',{name:'Open menu'}).click();
  await expect(page.locator('#mobile-menu')).toBeInViewport();
  await page.getByRole('button',{name:'Close menu'}).click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
});

test('blog pagination, categories, search, and empty-state reset work together',async({page})=>{
  await page.goto('/blog.html');
  await expect(page.locator('#post-results .post-card')).toHaveCount(6);
  await page.getByRole('button',{name:'Page 2',exact:true}).click();
  await expect(page.locator('#post-results .post-card')).toHaveCount(3);
  await page.getByRole('button',{name:'Shipping',exact:true}).click();
  await expect(page.locator('#post-results .post-card')).toHaveCount(1);
  await expect(page.locator('#post-results h3')).toContainText('FCL vs LCL');
  await page.getByRole('button',{name:'All',exact:true}).click();
  await page.getByRole('searchbox').fill('furniture');
  await expect(page.locator('#post-results .post-card')).toHaveCount(1);
  await page.getByRole('searchbox').fill('nothing-matches-this-123');
  await expect(page.getByRole('heading',{name:'No articles found'})).toBeVisible();
  await page.getByRole('button',{name:'Clear filters'}).click();
  await expect(page.locator('#post-results .post-card')).toHaveCount(6);
});

test('guide links open the right article and unknown slugs have a recovery path',async({page})=>{
  await page.goto('/blog.html');
  await page.locator('#post-results .post-card').first().getByRole('link',{name:'Read more'}).click();
  await expect(page).toHaveURL(/post.html\?p=how-to-import-from-china-to-india/);
  await expect(page.locator('h1')).toContainText('How to Import from China to India');
  await expect(page.locator('.prose h2')).toHaveCount(9);
  await page.goto('/post.html?p=does-not-exist');
  await expect(page.getByRole('heading',{name:'This guide isn’t here.'})).toBeVisible();
  await page.getByRole('link',{name:'Browse all articles'}).click();
  await expect(page).toHaveURL(/blog.html$/);
});

test('reduced-motion journey is readable and all steps can be selected',async({page})=>{
  await page.goto('/#journey');
  const last=page.locator('[data-step="5"]');
  await last.click();
  await expect(last).toHaveAttribute('aria-current','step');
  await expect(page.locator('.journey-day')).toHaveText('Day 33');
  for(const description of await page.locator('.step-description').all())await expect(description).toBeVisible();
});

test('site remains usable when WebGL is unavailable',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};
  });
  await page.goto('/');
  await expect(page.locator('.globe-stage')).toHaveClass(/fallback-only/);
  await page.goto('/#journey');
  await expect(page.locator('[data-step="0"]')).toBeVisible();
  await page.locator('[data-step="4"]').click();
  await expect(page.locator('[data-step="4"]')).toHaveAttribute('aria-current','step');
});

test('responsive pages have no horizontal overflow',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','One viewport matrix is sufficient');
  for(const width of [320,390,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of ['/','/blog.html','/post.html?p=how-to-import-from-china-to-india']){
      await page.goto(route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}px`).toBe(true);
    }
  }
});
