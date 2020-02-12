const puppeteer = require('puppeteer')

const execGTM = async (pushes,endpointDomain) => {  
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36')  
    await page.goto(endpointDomain+'/load', {	  
      waitUntil: 'networkidle0',
    })
    await page.evaluate((pushes) => { 
      pushes.forEach(function(push){
        window.dataLayer.push(push);
      })   
      return "TRUE";      
    }, pushes)
    await page.waitFor(5000);
    //await browser.close()      
  }

  module.exports.execGTM = execGTM