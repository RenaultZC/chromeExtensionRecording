const Koa = require('koa')
const Router = require('koa-router')
const Cors = require('@koa/cors')
const koaBody = require('koa-body');
const puppeteer = require('puppeteer')

const app = new Koa()
const router = new Router()

app.use(Cors({
  credentials: true,
}))

app.use(koaBody());

let _handleKeyDown = async (page, selector, value) => {
  await page.waitForSelector(selector)
  await page.$eval(selector, el => {
    console.log(el.value)
    el.value = ''
  })
  await page.type(selector, value)
}

let _handleClick = async (page, selector) => {
  console.log(selector)
  await page.waitForSelector(selector)
  await page.click(selector)
}

let _handleGoto = async (page, href) => {
  await page.goto(href)
}

let _handleViewport = async (page, width, height) => {
  await page.setViewport({width, height})
}

router.post('/puppeteer', async ctx => {
  let event = JSON.parse(ctx.request.body)
  const frame = {
    frameId: 0
  }
  const browser = await puppeteer.launch({headless: false})
  frame['0'] = await browser.newPage() 
  let page = frame['0']

  for(let i = 0, len = event.value.length; i < len; i ++){
    let { action, selector, value, href, tagName, frameId, frameUrl } = event.value[i]
    frame.frameId = frameId
    if (selector) {
      selector = selector.split(' > ')[4]
    }
    if (!frame[`${frameId}`]) {
      let frames = await frame['0'].frames()
      frame[`${frameId}`] = await frames.find(f => f.url() === frameUrl)
    }

    page = frame[`${frameId}`]

    switch (action) {
      case 'keydown':
        await _handleKeyDown(page, selector, value)
        break
      case 'click':
        await _handleClick(page, selector)
        break
      case 'change':
        if (tagName === 'SELECT') {
          await _handleClick(page, selector)
        } else if (tagName === 'INPUT') {
          await _handleKeyDown(page, selector, value)
        }
        break
      case 'goto*':
        await _handleGoto(page, value)
        break
      case 'viewport*':
        await _handleViewport(page, value.width, value.height)
        break
      default: break
    }
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

const port = 1000; 0.

app.listen(port, ()=>{
  console.log(`API server started on ${port}`)
})