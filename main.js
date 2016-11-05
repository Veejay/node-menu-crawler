const request = require('request')
const cheerio = require('cheerio')
const Q = require('q')

const fetch = (url) => {
  return Q.promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        resolve(body)
      }
    })
  })
}
const HOMEPAGE = 'http://s521389927.siteweb-initial.fr/'

const fetchSubMenuItems = (url) => {
  const subMenuItems = []
  return Q.promise((resolve, reject) => {
    fetch(url).then(body => {
      let $ = cheerio.load(body)
      const links = $('#mainNav2 a')
      links.each((index, link) => {
        subMenuItems.push(link)
      })
      resolve({url: url, items: subMenuItems})
    }).catch(error => {
      console.log(error)
      resolve({url: url, items: []})
    })
  })
}


const fetchMenuItems = (url) => {
  return Q.promise((resolve, reject) => {
    fetch(HOMEPAGE)
      .then(body => {
        const $ = cheerio.load(body)
        const menuLinks = $('#mainNav1 a')
        const urls = menuLinks.map((index, element) => {
          return cheerio(element).attr('href')
        }).toArray()
        const promises = urls.map(url => {
          return fetchSubMenuItems(url)
        })
        Q.all(promises).then(results => {
          resolve(results)
        }).catch(error => {
          console.log(error)
        })
      })
      .catch(error => {
        reject(error)
      })
  })
}

fetchMenuItems(HOMEPAGE).then(links => {
  console.log(links)
})
