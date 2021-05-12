console.log('N background')

window.n = {
  config: {
    safetyLevel: .7,
  }
}

const filterImagesByStatus = (images, status) => images.filter(i => i.status === status)

const keyBy = (arr, attr) => arr
  .reduce((acc, x) => ({ ...acc, [x.attr]: x }), {})

const blobToBase64 = blob => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };
  });
};

const processImages = async (images) => {
  const classificationServerUrl = await getSetting('classification-server-url')
  const detectionServerUrl = await getSetting('detection-server-url')

  console.log('processing', images)
  if (!images.length) {
    return []
  }

  let fetchedImages = await Promise.allSettled(
    images.map(async ({ src }) => ({ src, response: await fetch(src) }))
  )
  fetchedImages = fetchedImages
    .filter(x => x.status === 'fulfilled')
    .map(x => ({ ...x.value, status: 'fetched' }))

  images = Object.values(
    _.merge(
      _.keyBy(images.map(x => ({ ...x, status: 'error' })), 'src'),
      _.keyBy(fetchedImages, 'src')
    )
  )

  console.log('after fetch')
  console.log(images)

  images = await Promise.all(
    images.map(async x => {
      if (x.status !== 'fetched') {
        return x
      }
      const blob = await x.response.blob()
      const base = await blobToBase64(blob)
      return { ...x, base }
    })
  )

  console.log('after base')

  const classifiableImages = filterImagesByStatus(images, 'fetched')
  const classification = classifiableImages.length
    ? await (await fetch(`${classificationServerUrl}/sync`, {
      method: 'POST',
      body: JSON.stringify({
        data: classifiableImages
          .reduce((acc, x) => ({ ...acc, [x.src]: x.base }), {})
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })).json()
    : {}

  console.log('classification', classification)

  const classifiableCount = classifiableImages.length
  Object.keys(classification.prediction || {}).forEach(k => {
    const imgIndex = _.findIndex(images, i => i.src.includes(k))
    images[imgIndex].classification = classification.prediction[k]
    images[imgIndex].status = 'classified'
  })

  const classifiedImages = filterImagesByStatus(images, 'classified')

  console.log('after classification', classifiableImages.length, classifiedImages.length)

  const unsafeImages = classifiedImages
    .filter(i => i.classification.unsafe > window.n.config.safetyLevel)

  unsafeImages.forEach(u => {
    images.find(i => i.src === u.src).status = 'unsafe'
  })

  const safeImages = classifiedImages
    .filter(i => i.classification.unsafe <= window.n.config.safetyLevel)

  safeImages.forEach(s => {
    images.find(i => i.src === s.src).status = 'safe'
  })

  const detection = unsafeImages.length
    ? await (await fetch(`${detectionServerUrl}/sync`, {
      method: 'POST',
      body: JSON.stringify({
        data: unsafeImages
          .reduce((acc, x) => ({ ...acc, [x.src]: x.base }), {})
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })).json()
    : {}

  Object.keys(detection.prediction || {}).forEach(k => {
    const imgIndex = _.findIndex(images, i => i.src.includes(k))
    images[imgIndex].detection = detection.prediction[k]
    images[imgIndex].status = 'censored'
  })

  console.log('after detection', images)

  images = images.map(x => {
    if (x.detection) {
      x.detection = x.detection.map(d => ({
        ...d,
        box: {
          topLeft: {
            x: d.box[0],
            y: d.box[1],
          },
          bottomRight: {
            x: d.box[2],
            y: d.box[3],
          },
        }
      }))
    }
    return x
  })

  images = images.map(x => _.omit(x, ['base', 'response', 'el']))

  return images
}

chrome.runtime.onMessage.addListener(
  (payload, _, sendResponse) => {
    processImages(payload.images).then(x => {
      console.log('sending response!', x)
      sendResponse(x)
    })
    return true
  }
);

chrome.tabs.onUpdated.addListener(
  (tabId, changeInfo, tab) => {
    console.log('background change info', changeInfo)
    // read changeInfo data and do something with it
    // like send the new url to contentscripts.js
    if (changeInfo.url) {
      chrome.tabs.sendMessage(tabId, 'urlChanged')
    }
  }
);