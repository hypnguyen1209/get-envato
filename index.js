const puppeteer = require('puppeteer')
const fs = require('fs')
const app = require('express')()

const buttonDownload = '[data-test-selector="download-button"]'
const downloadWithout = '[data-test-selector="download-without-license"]';

const getEnvato = async (uri) => {
    let urlDownload = ''
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });

    await page.goto('https://elements.envato.com/fr/');
    let dataCookie = await fs.readFileSync('./cookie.json', { encoding: 'utf8' })
    dataCookie = await JSON.parse(dataCookie)
    await page.setCookie(...dataCookie.cookies)

    await page.goto(uri)

    await page.$eval(buttonDownload, elem => elem.click())
    await page.$eval(downloadWithout, elem => elem.click())
    
    await page.on('request', req => {
        if(req.url().includes('downloads')) {
            urlDownload += req.url()
        }
    })
    
    await page.waitFor(3000)
    await browser.close();
    await console.log('done')
    return await urlDownload
}

app.get('/getlink', async (req, res) => {
    let urlItem = await req.query.url
    let urlDownload = await getEnvato(urlItem)
    await res.json({ data: { urlDownload } })
    
})

app.listen(3000)