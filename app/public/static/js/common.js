const getSettings = () => new Promise(resolve => {
  chrome.storage.local.get(['n__settings'], (settings) => {
    resolve(settings['n__settings'])
  })
})

const getSetting = async k => {
  const settings = await getSettings()
  return settings[k]
}