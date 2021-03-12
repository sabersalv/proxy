// Login don't forget to click "keep me logged in"
// user.php?id=x  -> empty body, reponse is too large?
// 400 bad request, cloudflare -> URL加?a

const rcs = [
  { name: 'btn', cookieUrlPattern: /broadcasthe.net/, cookiePattern: /keeplogged=.*?;/, url: 'https://broadcasthe.net/index.php', bodyPattern: /Index :: BroadcasTheNet/ },
  { name: 'ptp', cookieUrlPattern: /passthepopcorn.me/, cookiePattern: /session=.*?;/, url: 'https://passthepopcorn.me/', bodyPattern: /News :: PassThePopcorn/ }
]
const DEBUG = false

async function main() {
  try {
    if (isRequest) {
      getCookie(rcs)
    } else {
      for (const rc of rcs) {
        await checkin(rc)
      }
    }
  } catch (err) {
    notify({ title: `签到失败: ${err.message}` })
  }
}

function getCookie(rcs) {
  const { name, cookiePattern } = rcs.find(rc => $request.url.match(rc.cookieUrlPattern))
  const cookie = $request.headers['Cookie']
  if (cookie && cookie.match(cookiePattern)) {
    const value = cookie.match(cookiePattern)[0]
    $persistentStore.write(value, `${name}.cookie`)
    notify({ title: `${name}获取Cookie成功` })
    debug(`Cookie: ${value}`)
  }
}

async function checkin({ name, url, bodyPattern }) {
  try {
    const cookie = $persistentStore.read(`${name}.cookie`)
    if (!cookie) {
      notify({ title: `${name}签到失败! 请获取Cookie.` })
      return
    }
    const body = await request({
      url,
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.16; rv:84.0) Gecko/20100101 Firefox/84.0',
      }
    })
    const matches = body.match(bodyPattern)
    if (matches) {
      notify({ title: `${name}签到成功!` })
    } else {
      notify({ title: `${name}签到失败! 请重新获取Cookie.` })
    }
  } catch (err) {
    notify({ title: `${name}签到错误`, content: err.message })
  }
}

function notify({ title, subtitle, content }) {
  $notification.post(title || '', subtitle || '', content || '')
}

function debug(...args) { 
  if (DEBUG) {
    console.log(...args)
  }
}

function request(options)  {
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        resolve(body)
      }
    })
  })
}

function getStorageKey(name) {
  return `${name}.cookie`
}

const isRequest = typeof $request !== 'undefined' 

main()
