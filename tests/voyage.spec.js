import {test,expect} from '@playwright/test';
import {voyageAt,PORT_DISTANCE} from '../src/voyage-timeline.js';

test('ship travels monotonically from Shanghai to a separate Chennai terminal',()=>{
  let previous=0;
  for(let i=0;i<=1000;i++){
    const state=voyageAt(i/1000);
    expect(state.shipX).toBeGreaterThanOrEqual(previous);
    previous=state.shipX;
  }
  expect(voyageAt(0)).toMatchObject({shipX:0,phase:'shanghai',day:0});
  expect(voyageAt(.4)).toMatchObject({shipX:0,phase:'sea',step:3,day:7});
  expect(voyageAt(.62).shipX).toBeCloseTo(PORT_DISTANCE/2);
  expect(voyageAt(.84)).toMatchObject({shipX:PORT_DISTANCE,phase:'chennai',step:4,day:30});
  expect(voyageAt(1)).toMatchObject({shipX:PORT_DISTANCE,phase:'chennai',step:5,day:35});
});

test('forward scrolling arrives in Chennai and stays there through delivery',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','Run the real scroll progression once.');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  const journey=page.locator('#journey');
  for(const progress of [.1,.5,.7,.85,.99]){
    await journey.evaluate((section,p)=>scrollTo({top:section.offsetTop+p*(section.offsetHeight-innerHeight),behavior:'instant'}),progress);
    await expect(journey).toHaveAttribute('data-phase',progress<.4?'shanghai':progress<.84?'sea':'chennai');
    if(progress>=.84)await expect(journey).toHaveAttribute('data-ship-x','520.000');
  }
  await expect(page.locator('[data-step="5"]')).toHaveAttribute('aria-current','step');
  await expect(page.locator('.journey-day')).toHaveText('Day 35');
});
