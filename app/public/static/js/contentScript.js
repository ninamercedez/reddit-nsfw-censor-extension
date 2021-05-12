window.n = {
  config: {
    minImgWidth: 100,
    censor: {
      breastsNude: {
        medium: {
          blur: 9,
          pixelation: .94,
        },
        'very-high': {
          background: 'black',
        },
      },
      breastsCovered: {
        medium: {
          blur: 4,
          pixelation: .85,
        },
        'very-high': {
          background: 'black',
        },
      },
      genitalsNude: {
        medium: {
          background: 'rgba(0, 0, 0, .87)',
          zIndex: 2,
          blur: 7,
          pixelation: .95,
        },
        'very-high': {
          background: 'black',
        },
      },
      genitalsCovered: {
        medium: {
          blur: 7,
          pixelation: .9,
        },
        'very-high': {
          background: 'black',
        },
      },
      anus: {
        medium: {
          blur: 4,
          pixelation: .93,
        },
        'very-high': {
          background: 'black',
        },
      },
      buttocksNude: {
        medium: {
          blur: 6,
          pixelation: .92,
        },
        'very-high': {
          background: 'black',
        },
      },
      buttocksCovered: {
        medium: {
          blur: 3,
          pixelation: .85,
        },
        'very-high': {
          background: 'black',
        },
      },
      belly: {
        medium: {
          blur: 3,
          pixelation: .9,
        },
        'very-high': {
          background: 'black',
        },
      },
      face: {
        medium: {
          blur: 7,
          pixelation: .94,
        },
        'very-high': {
          background: 'black',
        },
      },
      armpits: {
        medium: {
          blur: 2,
          pixelation: .8,
        },
        'very-high': {
          blur: 10,
        },
      }
    }
  },
  images: [],
  videos: [],
}

const wrapperClassName = "n__wrapper"
const blockerClassName = "n__blocker"
const pixelBlockerClassName = 'n__blocker--pixel'
const censorClassName = "n__censor"
const blurClassName = "n__blur"
const barClassName = "n__bar"
const tagClassName = "n__tag"
const sanitizingTagClassName = 'n__tag--sanitizing'

const DEFAULT_SETTINGS = {
  'censor-level': 'medium',
  'detection-server-url': 'http://localhost:8040',
  'classification-server-url': 'http://localhost:8041',
}

let CENSOR_LEVEL

const initSettings = async () => {
  const settings = await getSettings()
  if (_.isEmpty(settings)) {
    window.chrome.storage.local.set({ 'n__settings': DEFAULT_SETTINGS })
  }
  CENSOR_LEVEL = await getSetting('censor-level')
}
initSettings()

jQuery($ => {
  console.log('censor level is', CENSOR_LEVEL)

  window.n.$ = $
  const findImages = () => $('img').toArray().filter(x => x.getBoundingClientRect().width > 100 && x.getBoundingClientRect().height > 100)
  const findIframes = () => $('iframe[class*="media-element"]').toArray()
  const findVideos = () => $('video[class*="media-element"]').toArray()
  const isNsfw = () => ($(':contains(nsfw)').length + $(':contains(Adult Content)').length) > 0

  // Setup isScrolling variable
  var isScrolling;

  const hasParentWithClassName = (el, className) => (
    Boolean(el.closest(`.${className}`))
  )

  const wrapImages = (imgs, opts) => {
    imgs.forEach(img => wrapImage(img, opts))
  }

  const wrapImage = (img, opts) => {
    const wrapper = $(img).parent()
    wrapper.addClass(wrapperClassName)
    if (opts?.type) {
      wrapper.addClass(`${wrapperClassName}--${opts.type}`)
    }

    if (!wrapper.find(`.${blockerClassName}`).length) {
      const blocker = $('<div />');
      blocker.addClass(blockerClassName);
      wrapper.append(blocker)
    }

    if (!wrapper.find(`.${tagClassName}`).length) {
      const tag = $('<div />');
      tag.addClass([tagClassName, `${tagClassName}--status-${opts?.status || 'working'}`]);
      wrapper.append(tag)
    }

    if (
      !['iframe', 'video'].includes(opts?.type)
      && !wrapper.find(`.${sanitizingTagClassName}`).length
    ) {
      const sanitizingTag = $('<div>Adjusting...</div>')
      sanitizingTag.addClass(sanitizingTagClassName)
      wrapper.append(sanitizingTag)
    }
  }

  const pixelateImages = imgs => {
    imgs.forEach(img => {
      if (
        img.parentNode.querySelector('canvas')
      ) {
        return
      }
      pixelateImg(img)
      $(img).parent().addClass('n__wrapper--pixel-blocked')
    })
  }

  const selectImage = src => window.n.images.find(i => i.src === src)

  const updateImage = (src, update) => {
    const imgIdx = window.n.images.findIndex(i => i.src === src)
    const img = window.n.images[imgIdx]
    window.n.images[imgIdx] = { ...img, ...update }
    return window.n.images[imgIdx]
  }

  const pixelateImg = (img, opts) => {
    let pixelation
    if (img.src) {
      pixelation = new Pixelate(img, { amount: .95, classList: [pixelBlockerClassName], ...opts })
      updateImage(img.src, { pixelation })
      return pixelation
    }
  }

  const handleClassification = (images) => {
    if (images.length) {
      const merged = Object.values(
        _.merge(
          _.keyBy(window.n.images, 'src'),
          _.keyBy(images || [], 'src')
        )
      )
      window.n.images = merged

      censorImages(images)
    }
  }

  const isWrapped = el => (
    $(el).parent().hasClass(wrapperClassName)
    && $(el).find(pixelBlockerClassName)
    && $(el).find(blockerClassName)
    && $(el).find(tagClassName)
  )

  const censorImages = images => {
    if (!CENSOR_LEVEL) {
      console.error('censor level not set')
    }
    // console.log('censoring images', images)
    images.map(({ src, detection, status }) => {
      const els = $(`img[src="${src}"]`).toArray()

      if (els.length > 1) {
        // console.log('multiple els', els)
      }

      if (!els) {
        console.error('NO img found for', src)
      }

      const wrapperStatusClassName = `n__wrapper--status-${status}`

      els.forEach(el => {
        if (
          // already censored
          $(el).parent().hasClass(wrapperStatusClassName)
          // not ready
          || !isWrapped(el)
        ) {
          return
        }

        const femaleNudityLabels = [
          'EXPOSED_GENITALIA_F',
          'EXPOSED_BREAST_F',
          'EXPOSED_BUTTOCKS',
          'EXPOSED_ANUS',
        ]
        const containsFemaleNudity = (detection || []).some(d => femaleNudityLabels.includes(d.label))
        const wrapperFemaleNudityClassName = `${wrapperClassName}--nudity-${containsFemaleNudity ? 'f' : 'x'}`
        const wrapperLevelClassName = `${wrapperClassName}--level-${CENSOR_LEVEL}`

        const containsFemaleFeatures = (detection || []).some(d => d.label.endsWith('_F'))

        if (!detection) {
          return
        }

        detection.forEach(d => {
          const box = document.createElement('div');

          box.classList.add(censorClassName, `${censorClassName}--${d.label}`)

          // scale to displayed size of image
          const heightScale = el.offsetHeight / el.naturalHeight
          const widthScale = el.offsetHeight / el.naturalHeight

          const scaledTop = d.box.topLeft.y * heightScale
          const scaledLeft = d.box.topLeft.x * widthScale
          const scaledHeight = (d.box.bottomRight.y - d.box.topLeft.y) * heightScale
          const scaledWidth = (d.box.bottomRight.x - d.box.topLeft.x) * widthScale

          const scaledTopPx = `${scaledTop}px`
          const scaledLeftPx = `${scaledLeft}px`
          const scaledHeightPx = `${scaledHeight}px`
          const scaledWidthPx = `${scaledWidth}px`

          let cfg = {}

          switch (d.label) {
            case 'EXPOSED_BELLY':
              cfg = containsFemaleFeatures ? window.n.config.censor.belly[CENSOR_LEVEL] : {}
              break
            case 'FACE_F':
              cfg = window.n.config.censor.face[CENSOR_LEVEL]
              break
            case 'EXPOSED_GENITALIA_F':
              cfg = window.n.config.censor.genitalsNude[CENSOR_LEVEL]
              break
            case 'COVERED_GENITALIA_F':
              cfg = window.n.config.censor.genitalsCovered[CENSOR_LEVEL]
              break
            case 'COVERED_BREAST_F':
              cfg = window.n.config.censor.breastsCovered[CENSOR_LEVEL]
              break
            case 'EXPOSED_BUTTOCKS':
              cfg = window.n.config.censor.buttocksNude[CENSOR_LEVEL]
              break
            case 'COVERED_BUTTOCKS':
              cfg = window.n.config.censor.buttocksCovered[CENSOR_LEVEL]
              break
            case 'EXPOSED_BREAST_F':
              cfg = window.n.config.censor.breastsNude[CENSOR_LEVEL]
              break
            case 'EXPOSED_ARMPITS':
              cfg = window.n.config.censor.armpits[CENSOR_LEVEL]
              break
            case 'EXPOSED_ANUS':
              cfg = window.n.config.censor.anus[CENSOR_LEVEL]
              break
          }

          // for now censors are only pixels
          const pixelated = pixelateImg(el, {
            amount: cfg.pixelation,
            classList: [censorClassName, `${censorClassName}__pixel`, `${censorClassName}__pixel--${d.label}`],
            crop: [scaledLeft, scaledTop, scaledLeft + scaledWidth, scaledTop + scaledHeight]
          })

          box.style.top = scaledTopPx
          box.style.left = scaledLeftPx
          box.style.height = scaledHeightPx
          box.style.width = scaledWidthPx

          let zIndex = 1

          box.style.zIndex = zIndex

          if (cfg.blur) {
            box.style.backdropFilter = `blur(${cfg.blur}px)`
          }

          if (cfg.background) {
            box.style.background = cfg.background
            box.style.zIndex = 2
          }

          // el.parentNode.insertBefore(box, el)
        })

        if ($(el).parent().find(`canvas.${censorClassName}`).length) {
          // if censors were PHYSICALLY added
          el.parentNode.classList.add(
            wrapperClassName,
            wrapperStatusClassName,
            wrapperFemaleNudityClassName,
            wrapperLevelClassName,
          )

          const tagEl = el.parentNode.querySelector(`.${tagClassName}`)
          if (tagEl) {
            tagEl.className = ''
            tagEl.classList.add(tagClassName, `${tagClassName}--status-${status}`)
          } else {
            console.log('no tag el for', el)
          }
        }
      })
    })
  }

  const fixImages = imgs => {
    imgs.forEach(img => {

      if (img.classList.contains('new-image')) {
        return
      }

      const newImg = new Image()
      newImg.style = img.style
      newImg.classList = img.classList
      newImg.src = img.src
      newImg.crossOrigin = '*'

      if (img.src.includes('external-preview')) {
        let el = img
        let externalLink
        while (!externalLink) {
          el = el.parentNode
          externalLink = el.querySelector('a[href*="i.imgur.com"]')
        }

        newImg.src = externalLink.href
      }

      newImg.classList.add('new-image')
      img.replaceWith(newImg)

    })
  }

  const sanitizeThumbnails = () => {
    Array.from(document.querySelectorAll('[style*="url("]')).forEach(x => {
      x.style.backgroundImage = ''
      x.style.background = ''
    })
  }

  const refreshImages = () => {
    // console.log('refreshing images')
    // console.log('existing', window.n.images)

    // fix external links to imgur
    fixImages(findImages())

    const newImages = findImages()
      .filter(i => !window.n.images.map(x => x.src).includes(i.src))
      .map(x => ({ el: x, src: x.src, status: 'working' }))

    const newVideos = findVideos()
      .filter(v => !window.n.videos.map(x => x.src).includes(v.src))

    window.n.images = [...window.n.images, ...(newImages || [])]
    wrapImages(findImages())
    pixelateImages(findImages())
    wrapImages(findIframes(), { status: 'censored', type: 'iframe' }) // .map(x => x.parentNode))
    wrapImages(findVideos(), { status: 'censored', type: 'video' })
    sanitizeThumbnails()

    if (newImages.length) {
      chrome.runtime.sendMessage({ images: newImages }, handleClassification);
    }

    censorImages(window.n.images)
  }

  const initWindow = () => {
    document.body.classList.add('loaded')
  }

  const observer = new MutationObserver(() => {
    refreshImages()
  })

  const handleScroll = () => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
      refreshImages()
    }, 66)
  }

  const register = () => {
    console.log('REGISTERING')
    document.body.classList.add('nsfw')
    document.body.classList.remove('sfw')
    window.addEventListener('DOMContentLoaded', initWindow)
    window.addEventListener('scroll', handleScroll, false)
    observer.observe(document.body, { subtree: true, childList: true })
  }

  const unregister = () => {
    console.log('UNREGISTERING')
    document.body.classList.add('sfw')
    document.body.classList.remove('nsfw')
    window.removeEventListener('DOMContentLoaded', initWindow)
    window.removeEventListener('scroll', handleScroll)
    observer.disconnect()
  }

  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      // listen for messages sent from background.js
      console.log('heard message from background', request)
      if (request === 'urlChanged') {
        unregister()
        considerRegistering()
      }
    });

  const considerRegistering = () => {
    if (isNsfw()) {
      console.log('ITS NSFW')
      register()
      window.n.wrapImages = wrapImages
      window.n.refreshImages = refreshImages
    } else {
      console.log('ITS SFW')
      unregister()
    }
  }

  considerRegistering()

  window.n.isNsfw = isNsfw
  window.n.Pixelate = Pixelate
  window.n.findImages = findImages
  window.n.wrapImages = wrapImages
  window.n.censorImages = censorImages
})
