import debounce from 'lodash/debounce.js'

const DEFAULT_REPEAT_SUBMIT_INTERVAL = 1000
const pendingRepeatSubmitKeys = new Map()

function stringifyRequestData(data) {
  return typeof data === 'object' ? JSON.stringify(data) : data
}

export function getRepeatSubmitKey(config) {
  return [
    config.method,
    config.url,
    stringifyRequestData(config.data)
  ].join('&')
}

export function shouldRejectRepeatSubmit(config, interval = DEFAULT_REPEAT_SUBMIT_INTERVAL) {
  const requestKey = getRepeatSubmitKey(config)

  if (pendingRepeatSubmitKeys.has(requestKey)) {
    pendingRepeatSubmitKeys.get(requestKey)()
    return true
  }

  const releaseRepeatSubmitKey = debounce(() => {
    if (pendingRepeatSubmitKeys.get(requestKey) === releaseRepeatSubmitKey) {
      pendingRepeatSubmitKeys.delete(requestKey)
    }
  }, interval)

  pendingRepeatSubmitKeys.set(requestKey, releaseRepeatSubmitKey)
  releaseRepeatSubmitKey()
  return false
}

export function clearRepeatSubmitState() {
  pendingRepeatSubmitKeys.forEach(releaseRepeatSubmitKey => {
    releaseRepeatSubmitKey.cancel()
  })
  pendingRepeatSubmitKeys.clear()
}
