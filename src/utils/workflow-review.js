// 沿用当前菜单已有的审核权限，未配置审核操作的菜单不追加退回入口。
export function withRollbackButton(property) {
  const addButton = buttons => {
    if (!Array.isArray(buttons)) return buttons
    const existing = buttons.findIndex(button => button.buttonCode === 'rollbackToPrevious')
    const index = existing >= 0 ? existing : buttons.findIndex(button => ['reject', 'pass'].includes(button.buttonCode))
    if (index < 0) return buttons
    const result = [...buttons]
    const button = {
      ...buttons[index],
      id: existing >= 0 ? buttons[index].id : `${buttons[index].id || 'review'}-rollback`,
      buttonName: '退回上一步',
      buttonCode: 'rollbackToPrevious',
      buttonIcon: 'Blue-Cancel',
      buttonMode: '1',
      children: [],
      formId: '',
      options: JSON.stringify({ prompt: '将当前审批任务退回上一步重新审核，单据仍处于审核中' })
    }
    if (existing >= 0) result.splice(index, 1, button)
    else result.splice(index, 0, button)
    return result
  }
  return {
    ...property,
    buttonTop: addButton(property.buttonTop),
    buttonRow: addButton(property.buttonRow)
  }
}
