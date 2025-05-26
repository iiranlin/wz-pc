function formatAmount(el, binding) {
    // 获取绑定的值
    let value = binding.value;

    // 获取参数（小数点后保留的位数）
    const decimalPlaces = binding.arg || 2; // 默认保留 2 位小数

    // 如果值是数字或可以转换为数字的字符串
    if (!isNaN(value) && value !== '') {
        // 转换为数字
        value = parseFloat(value);
        // 格式化为千分位，并保留指定的小数位数
         const val = value.toLocaleString('en-US', {
            style: 'decimal', // 格式化为数字
            minimumFractionDigits: decimalPlaces, // 保留的小数位数
            maximumFractionDigits: decimalPlaces
        });
        el.textContent = val
    } else {
        // 如果值无效，显示原始值或空
        el.textContent = value || '';
    }
}
const thousandSeparator = {
    inserted(el, binding) {
        formatAmount(el, binding);
    },
    update(el, binding) {
        formatAmount(el, binding);
    }
}
export default thousandSeparator