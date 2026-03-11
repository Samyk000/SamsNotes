const puppeteer = require('puppeteer');

const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded. Looking for note card...');
  await page.waitForSelector('.group.relative.p-4.rounded-lg', { timeout: 5000 });
  await page.click('.group.relative.p-4.rounded-lg');

  console.log('Looking for editor...');
  await page.waitForSelector('.ProseMirror', { timeout: 5000 });
  
  // Click inside editor
  await page.click('.ProseMirror');
  await page.keyboard.type('Test selection color ');
  
  // Double click to select "color"
  await page.click('.ProseMirror', { clickCount: 2 });
  await wait(500);
  
  // Find Color Button
  const colorButton = await page.$('button[title="Text Color"]');
  if (colorButton) {
    console.log('Found Color Button, clicking...');
    await colorButton.click();
    await wait(500);
    
    // Click red color button
    const redButton = await page.$('button[title="Red"]');
    if (redButton) {
      console.log('Found Red Color Button, clicking...');
      await redButton.click();
      await wait(500);
    } else {
      console.log('Red button not found');
    }
  }
  
  const html = await page.$eval('.ProseMirror', el => el.innerHTML);
  console.log('Editor HTML:', html);

  const imageButton = await page.$('button[title="Insert Image"]');
  if (imageButton) {
     console.log('Found Image Button, clicking...');
     await imageButton.click();
     await wait(500);
     
     const clicked = await page.$$eval('button', btns => {
        const btn = btns.find(b => b.textContent.includes('Insert from URL'));
        if (btn) { btn.click(); return true; }
        return false;
     });
     
     if (clicked) {
        console.log('Found Insert from URL button, clicking...');
        await wait(1000);
        
        const modalInput = await page.$('input[type="url"]');
        if (modalInput) {
           console.log('Success! Modal input found.');
        } else {
           console.log('FAILURE! Modal not found.');
        }
     }
  }

  await browser.close();
  console.log('Done.');
})();
