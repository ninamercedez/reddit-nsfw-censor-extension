const DEFAULT_SETTINGS = {
  'censor-level': 5,
  'detection-server-url': 'http://localhost:8040',
  'classification-server-url': 'http://localhost:8041',
  'censor-areas': [
    'face',
    'breasts-exposed',
    'breasts-covered',
  ]
}

window.n = {}
window.n.detectionServerStatus = 0
window.n.classificationServerStatus = 0

const getSettings = () => new Promise(resolve => {
  chrome.storage.local.get(['n__settings'], (settings) => {
    resolve(settings['n__settings'])
  })
})

const getSetting = async k => {
  const settings = await getSettings()
  return settings[k]
}

const prepData = settings => {
  const data = _.omitBy(settings, x => _.isEmpty(x))
  console.log('prepped data', data)
  return data
}

const initSettings = async settings => {
  const prevSettings = await getSettings()
  return chrome.storage.local.set({ 'n__settings': prepData({ ...settings, ...prevSettings }) })
}

const updateSettings = async settings => {
  const prevSettings = await getSettings()
  return chrome.storage.local.set({ 'n__settings': prepData({ ...prevSettings, ...settings }) })
}

const clearSettings = (e) => {
  e.preventDefault()
  chrome.storage.local.set({ 'n__settings': DEFAULT_SETTINGS }, (...args) => {
    console.log('cleared settings')
    console.log(...args)
    updateForm()
  })
}

const saveSettings = (e) => {
  e.preventDefault()
  const data = Object.fromEntries(Array.from((new FormData(e.target)).entries()));
  console.log('saving settings', data)
  return updateSettings(data)
}

const updateForm = async () => {
  const form = document.querySelector('form')
  const settings = await getSettings()
  Object.keys(settings).forEach(k => {
    form.elements[k].value = settings[k]
  })
}

const checkServers = async () => {
  const detectionServerUrl = await getSetting('detection-server-url')
  const classificationServerUrl = await getSetting('detection-server-url')
  
  const detectionServerResult = await fetch(`${detectionServerUrl}/sync`)
  window.n.detectionServerStatus = detectionServerResult.status === 405
 
  const classificationServerResult = await fetch(`${classificationServerUrl}/sync`)
  window.n.classificationServerStatus = classificationServerResult.status === 405
}

const handleSettings = async () => {
  initSettings(DEFAULT_SETTINGS)

  const form = document.querySelector('form')
  const clear = form.querySelector('#clear')

  updateForm()

  form.addEventListener('submit', saveSettings)
  clear.addEventListener('click', clearSettings)

  setInterval(checkServers, 5000)
}

document.addEventListener('DOMContentLoaded', handleSettings)
