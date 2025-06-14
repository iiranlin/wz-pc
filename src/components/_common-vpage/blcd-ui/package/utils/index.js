import Clipboard from 'clipboard'
export function copyToClipboard(content, clickEvent, $message, successMsg, errorMsg, name = 'target') {
  const clipboard = new Clipboard(clickEvent[name], {
    text: () => content
  })

  clipboard.on('success', () => {
    $message.success(successMsg)
    clipboard.destroy()
  })

  clipboard.on('error', () => {
    $message.error(errorMsg)
    clipboard.destroy()
  })

  clipboard.onClick(clickEvent)
}

export function sleep(timer = 1500) {
  return new Promise((resolve) => {
      const t = setTimeout(() => {
          clearTimeout(t)
          resolve()
      }, timer)
  }
  )
}