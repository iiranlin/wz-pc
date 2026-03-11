import Decimal from 'decimal.js'

export function toNumber(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

export function getNegativeContractSummary(source = {}) {
  const currentAmount = toNumber(source.amount)
  const negativeAmount = toNumber(source.negative)
  const originalAmount = new Decimal(currentAmount)
    .plus(new Decimal(negativeAmount).abs())
    .toNumber()

  return {
    currentAmount,
    negativeAmount,
    originalAmount
  }
}
