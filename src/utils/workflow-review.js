export function isRollbackAudit({ auditStatus, message }) {
  return auditStatus === 'back' || String(auditStatus) === '7' ||
    (typeof message === 'string' && /^退回上一步\s*[:：]/.test(message.trim()))
}

export function withoutRollbackButton(property) {
  const filterButtons = buttons => {
    if (!Array.isArray(buttons)) return buttons
    return buttons.reduce((result, button) => {
      if (button.buttonCode === 'rollbackToPrevious') return result
      if (button.children?.length) {
        const children = filterButtons(button.children)
        if (children.length) result.push({ ...button, children })
      } else {
        result.push(button)
      }
      return result
    }, [])
  }
  return {
    ...property,
    buttonTop: filterButtons(property.buttonTop),
    buttonRow: filterButtons(property.buttonRow)
  }
}

export function canRollbackToPrevious(tasks) {
  if (!Array.isArray(tasks) || tasks.length !== 1 || !tasks[0]?.taskId) return false
  const flag = tasks[0].prevIsStartNodeFlag
  return flag === 0 || flag === '0'
}

export function canShowRollbackButton(query) {
  if (query?.name !== 'audit' || query.type !== 'view' || !query.auditArr) return false
  try {
    return canRollbackToPrevious(JSON.parse(query.auditArr))
  } catch {
    return false
  }
}
