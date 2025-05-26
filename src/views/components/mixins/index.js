import FilterData from "../filterData";
export default {
    data() {
        return {
          changeData: {},
          dataList: []
        }
    },
    methods: {
      renderSpecNameHeader(h, { column, $index }, fieldObj) {
          return h('div', {
              style: 'display:inline-flex; max-width: calc(100% - 24px)',
          }, [
              h("el-tooltip", { props: { placement: "top" } },
                  [
                      h(
                          "div",
                          {
                              slot: 'content',
                          },
                          column.label
                      ),
                      h(
                          "span",
                          {
                              class: {
                                  divHeader: true
                              },
                          },
                          column.label
                      )
                  ]
              ),
              h(FilterData, { style: 'cursor: pointer;margin-left: 5px;', props: {
                'data-arr': this.tableData,
                property: column.property,
                fieldObj
              }, on: { updateFilterData: this.updateFilterData } }),
          ])
      },
      updateFilterData(row) {
          let tableData = JSON.parse(JSON.stringify(this.tableData));
          this.changeData[row.property] = row.data;
          for (const key in this.changeData) {
              tableData = this.filterDataArr(this.changeData[key], tableData, key, row.fieldObj)
          }
          this.dataList = tableData;
      },
      filterDataArr(data, tableData, key, { fieldType, fieldFormat }) {
          let dataArr = [];
          tableData.forEach((item) => {
              if (data.includes(fieldType === 'date' ? this.parseTime(item[key], fieldFormat) : item[key] + '')) {
                  dataArr.push(item);
              }
          })
          return dataArr
      },
    }
}
