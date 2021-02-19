const puppeteer = require('puppeteer');
const fs = require('fs')
const superagent = require('superagent');
require('superagent-proxy')(superagent);

let devs = [{
    defaultViewport: {
      width: 1920,
      height: 1080
    },
  },
  {
    defaultViewport: {
      width: 1366,
      height: 700
    },
  },
  {
    defaultViewport: {
      width: 768,
      height: 1024
    },
  },
  {
    defaultViewport: {
      width: 375,
      height: 812
    },
  },
  {
    defaultViewport: {
      width: 320,
      height: 568
    },
  }
]

async function run(options) {
  let opt = Object.assign({
    headless: true
  }, options)
  console.log('current-dev-info: ', options) // show current dev info
  const browser = await puppeteer.launch(opt);
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  await page.setDefaultNavigationTimeout(0);

  let num = 0
  await page.on('request', req => {
    if (req.resourceType() === 'image') {
      num++
      downloadImg(req.url(), num)
    }
    req.continue();
  })

  async function downloadImg(url, num) {
    // console.log(url)
    let fileName = url.substring(url.indexOf('com/') + 4)
    if (!/[^A-Za-z0-9_\-\=]/.test(fileName)) {
      let proxy = process.env.http_proxy || 'http://127.0.0.1:1086';
      await superagent
        .get(url)
        // .set({
        //   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
        // }, {
        //   'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        // })
        .proxy(proxy)
        .end((err, response) => {
          if (err) {
            // console.log(`${num}下载错误 - (${url})`)
          } else {
            // console.log(`${num}下载成功 - `, (response.body))
            saveImg(fileName, response.body)
          }
        })
    }
  }

  async function saveImg(fileName, data) {
    await fs.writeFileSync(`./img/${fileName}`, data, {
      encoding: 'binary'
    })
  }

  await page.goto('http://www.imcreator.com/');
  await browser.close();
}

async function init() {
  for (let i = 0, l = devs.length; i < l; i++) {
    await run(devs[i])
  }
}

init()