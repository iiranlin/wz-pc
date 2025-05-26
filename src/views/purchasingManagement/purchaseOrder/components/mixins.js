export default {
    filters: {
        orderTypeFilter(val, code) {
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        }
    }
}
    