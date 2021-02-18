const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let num = 0
  await page.on('request', req=>{
    // console.log(req)
    if(req.resourceType() === 'image'){
      console.log(num, req._url)
      num++
    }else {
      req.continue();
    }
  })
  // const imgUrls = await page.evaluate(() => {
  //   let imgs = document.querySelectorAll('img')
  //   let imgUrls = []
  //   for (let i = 0, l = imgs.length; i < l; i++) {
  //     imgUrls.push({[i]:imgs[i].getAttribute('src')})
  //   }
  //   return imgUrls
  // });
  // console.log('all-imgs-src:', imgUrls)
  await page.goto('https://www.imcreator.com/');
  await browser.close();
})();