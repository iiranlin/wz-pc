<template>
  <div class="container_div" ref="containerDiv">
    <el-table
      v-if="showIf"
      ref="elTable"
      height="100%"
      :style="styles"
      border
      v-lottieLoading="{ loading, lottieId: menuId }"
      :data="dataList"
      :tree-props="treeProps"
      :row-style="rowStyle"
      highlight-current-row
      :row-key="idName"
      @selection-change="handleSelectionChange"
      @sort-change="sortableColumnChange"
      @row-contextmenu="(row, column, e) => rightClick({ row, column, e })"
      :load="loadTree"
      :lazy="lazy"
      @header-contextmenu="(column, e) => rightClick({ column, e })"
      @row-click="clickTableRow"
      @mousedown.native="mousedown($event)"
      @mousemove.native="mousemove($event)"
      @current-change="handelCurrentChange"
      :default-expand-all="defaultExpandAll"
      :row-class-name="rowClassName"
      :header-cell-style="handleCellStyle"
      :reserve-selection="reserveSelection"
      @mouseup.native="mouseup($event)"
      :header-cell-class-name="handleCellClassName"
      :summary-method="getLocalSummaries"
      :show-summary="showSummary"
      @expand-change="handleExpandChange"
    >
      <el-table-column
        :selectable="selectable"
        v-if="selectShow && isSelection"
        type="selection"
        width="57"
        align="center"
        fixed="left"
        class-name="table-operate"
        key="fields_selection"
      />
      <el-table-column
        type="index"
        width="50"
        align="center"
        :index="tableIndexs"
        label="序号"
        v-if="numberShow"
        key="fields_index"
      />
      <el-table-column width="1" />
      <table-index-column
        :clickLink="clickLink"
        :renderSpecNameHeader="renderSpecNameHeader"
        :renderHeader="renderHeader"
        :field="item"
        v-for="(item, index) in propertyFieldsArr"
        :key="index"
      >
        <template v-for="(_, slot) in $scopedSlots" v-slot:[slot]="props">
          <slot v-if="slot != 'append'" :name="slot" v-bind="props" />
        </template>
      </table-index-column>
      <el-table-column
        fixed="right"
        :label="$t(`field.operate`) || '操作'"
        align="center"
        min-width="70"
        :width="getActionColumnWidth(buttonRow, buttonRows)"
        class-name="small-padding fixed-width table-operate table-action"
        key="fields_button"
        v-if="
          property.buttonRow && property.buttonRow.length > 0 && visibleAction
        "
      >
        <template slot-scope="scope">
          <template v-if="handleShowButton(scope.row)">
            <el-button
              v-for="item in buttonRow"
              :disabled="handleButtonDisable(item, scope.row)"
              :key="item.id"
              size="mini"
              type="text"
              @click.stop="
                newButton(item.buttonCode, scope.row, item.formId, item)
              "
            >
              <svg-icon
                v-if="item.buttonIcon"
                :icon-class="item.buttonIcon ? item.buttonIcon : ''"
              />
              {{ i18nData(item, 'button', 'buttonCode', 'buttonName') }}
              <el-tooltip
                class="slotIcon-color"
                placement="top"
                effect="light"
                v-if="iconShow(item.options)"
              >
                <div slot="content" class="slotIcon-color-content">
                  <div v-html="iconShow(item.options)"></div>
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </el-button>
            <slot :index="scope.$index" :data="scope.row"></slot>
            <el-dropdown
              size="mini"
              @command="
                (command) =>
                  handleCommand(
                    command.buttonCode,
                    scope.row,
                    command.formId,
                    command
                  )
              "
              v-if="buttonRows.length > 0"
            >
              <span class="el-dropdown-link">
                <i class="el-icon-d-arrow-right el-icon--right"></i
                >{{ $t(`button.more`) || '更多' }}
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="item in buttonRows"
                  :command="item"
                  :key="item.id"
                >
                  <div
                    style="
                      display: flex;
                      flex-direction: row;
                      justify-content: flex-start;
                      align-items: center;
                      font-size: 12px;
                    "
                  >
                    <el-button
                      size="mini"
                      type="text"
                      :disabled="handleButtonDisable(item, scope.row)"
                    >
                      {{
                        i18nData(item, 'button', 'buttonCode', 'buttonName')
                      }}</el-button
                    >
                    <el-tooltip
                      class="slotIcon-color"
                      placement="top"
                      effect="light"
                      v-if="iconShow(item.options)"
                    >
                      <div slot="content" class="slotIcon-color-content">
                        <div v-html="iconShow(item.options)"></div>
                      </div>
                      <i class="el-icon-question"></i>
                    </el-tooltip>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </template>
      </el-table-column>
      <template #append>
        <slot name="append"></slot>
      </template>
    </el-table>
    <right-menu
      ref="rightMenu"
      :tabConfig="propertyFields"
      :tableRowText="tableRowText"
      :selectedData="selectedData"
      :listQuery="listQuery"
      @selectChange="selectChange"
      @listSet="listSet"
      @listSort="listSort"
      @collapseAll="handleCollapse"
      @expandAll="handleExpand"
      @checkedAll="handleCheckedAll"
      @uncheckedAll="handleUncheckedAll"
    />
  </div>
</template>

<script>
import PromptHeader from "./components/prompt-header";
import TooltipImg from '../TooltipImg'

import FilterData from "./components/filterData";
import Sortable from "sortablejs";
import indexMixin from "../mixins";
import rightMenu from "./components/right-menu";
import TableIndexColumn from "./components/table-index-column.vue";

function deepFunc (arr = [], obj = {}, props = { bgColor: '', fontColor: '' }) {
  for (let i = 0; i < arr.length; i++) {
    const { fieldCode, bgColor, children, fontColor } = arr[i]
    obj[fieldCode] = { bgColor: bgColor || props.bgColor, fontColor: fontColor || props.fontColor }
    if (Array.isArray(children) && children.length) {
      deepFunc(children, obj, { bgColor: bgColor || '', fontColor: fontColor || '' })
    }
  }
}
export default {
  name: "tableIndex",
  mixins: [indexMixin],
  components: {
    rightMenu,
    TableIndexColumn,
    IconSvg: () => import('../iconComponent')
  },
  props: {
    showSummary: {
      type: Boolean,
      default: false,
    },
    rowClassName: {
      type: Function,
      default: () => {
        return function () { }
      }
    },
    handleCellStyleFunc: {
      type: Function,
      default: undefined
    },
    handleCellClassName: {
      type: Function,
      default: () => {
        return function () { }
      }
    },
    styles: {
      type: Object,
      default: function () {
        return { height: "100%" }
      }
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    // 是否可用操作
    visibleAction: {
      type: Boolean,
      default: true,
    },
    //加载
    loading: {
      type: Boolean,
      default: false,
    },
    //数据id名称
    idName: {
      type: String,
      default: 'id'
    },
    //表格数据
    tableData: {
      type: Array,
      default: [],
    },
    //表格序号是否展示
    numberShow: {
      type: Boolean,
      default: false,
    },
    //表格序号
    tableIndexs: {
      type: Function,
      default: null,
    },
    //表格显示字段、按钮数据
    property: {
      type: Object,
      default: null,
    },
    // 列表字段判断是否可操作
    buttonDisable: {
      type: Function,
      default: null,
    },
    //表格选择是否展示（默认展示）
    selectShow: {
      type: Boolean,
      default: true,
    },
    customnDisabled: {
      type: Boolean,
      default: false,
    },
    // CheckBox 是否可以勾选
    selectable: {
      type: Function,
      default: () => true,
    },
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    reserveSelection: {
      type: Boolean,
      default: false,
    },
    totalNum: {
      type: Object,
      default: function () {
        return {};
      },
    },
    treeProps: {
      type: Object,
      default: () => {
        return { hasChildren: 'hasChildren', children: 'children' }
      }
    },
    showButton: {
      type: Function,
      default: null,
    },
    rowSetStyle: {
      type: Function,
      default: () => null,
    },
    loadTreeData: {
      type: Function,
    },
    getSummaries: {
      type: Function,
    },
    //主+明细Id
    menuId: {
      type: String,
      default: function () {
        return this.$route.meta.id
      }
    }
  },
  data () {
    return {
      expandedRows: [],
      showIf: true,
      dataList: [],
      propertyFields: [],
      propertyFieldsArr: [],
      bgColorsObj: {},
      ids: [],
      buttonRow: [],
      buttonRows: [],
      formData: {},

      //合计
      // sumColumn: [],
      // totalColumn: [],
      // isShowSum: false,

      tableRowText: '',
      listColumn: {},

      //是否需要(允许)处理鼠标的移动事件
      isMouseDown: true,
      select: false,
      // 定义移动元素div
      rect: null,
      // 记录鼠标按下时的坐标
      downX: 0,
      downY: 0,
      // 记录鼠标抬起时候的坐标
      mouseX2: this.downX,
      mouseY2: this.downY,
      // 表格dom元素
      TableDom: null,
      tableHeaderHeight: 0,
      selectedData: '', // 鼠标框选选中的数据

      tableRectTop: 0, // el-table距离window顶部的距离
      tableRectLeft: 0, // el-table距离window左侧的距离

      selection: [], //选中数据

      changeData: {}

    };
  },
  watch: {
    "property.buttonRow": {
      handler: function (newButtonRow) {
        let newButtonRows = newButtonRow;
        if (newButtonRows.length == 3) {
          this.buttonRow = newButtonRows;
        } else {
          this.buttonRow = newButtonRows.slice(0, 2);
          this.buttonRows = newButtonRows.slice(
            2,
            newButtonRows.length
          );
        }
      },
    },
    "property.fields": {
      handler: function (newFields) {
        if (localStorage.getItem("columns_" + this.menuId)) {
          newFields = JSON.parse(
            localStorage.getItem("columns_" + this.menuId)
          );
        }
        this.propertyFields = Object.freeze(JSON.parse(JSON.stringify(newFields)));
        this.propertyFieldsArr = Object.freeze(JSON.parse(JSON.stringify(newFields)));
        deepFunc(this.propertyFields, this.bgColorsObj, {})
        // this.propertyFields.forEach((item) => {
        //     if (item.isSum && item.fieldType == "Number") {
        //         this.sumColumn.push({
        //             filedCode: item.fieldCode,
        //             filedFormat: item.fieldFormat,
        //         });
        //     }
        //     if (item.isTotal) {
        //         this.totalColumn.push(item.fieldCode);
        //     }
        // });
        // if (this.sumColumn.length || this.totalColumn.length) {
        //     this.isShowSum = true;
        // }
      },
    },
    showIf: {
      handler: function (newShowIf) {
        if (newShowIf) {
          this.$nextTick(() => {
            // this.rowDrop();
            // this.columnDrop();
          });
        }
      },
    },
    tableData: {
      handler: function (newData) {
        this.dataList = Object.freeze(newData);
      },
    },
    idName: {
      handler: function (newData) {
        this.dataList = [];
      },
    },
    defaultExpandAll: {
      handler: function (newData) {
        this.showIf = false;
        this.$nextTick(() => {
          this.showIf = true;
        });
      },
    },
  },
  computed: {
    getActionColumnWidth () {
      return (buttons, buttonsArr) => {
        let width = 0
        const btnLength = buttonsArr.length
        const common = 50
        const fontSize = 26
        let q = 0
        const buttonNames = buttons.map((item) => {
          if (item.options) {
            q += 30
          }
          return item.buttonName
        })
        const buttonNamesStr = buttonNames.join('')
        const buttonNamesSize = buttonNamesStr.length
        if (btnLength > 0) {
          width = fontSize * buttonNamesSize + common + q
        } else {
          width = fontSize * buttonNamesSize + q
        }
        return Math.max(width, 120)

      }
    },
    isSelection () {
      if (this.customnDisabled) {
        return true
      }
      const buttonTop = this.property.buttonTop;
      if (buttonTop && buttonTop.length) {
        return !this.property.buttonTop.every(item => !item.buttonMode)
      } else {
        return false
      }
    }
  },
  activated () {

    this.$nextTick(() => {
      if (this.$refs.elTable) this.$refs.elTable.doLayout();

    });
  },
  mounted () {
    // this.rowDrop();
    // this.columnDrop();
    document.addEventListener('mouseup', (e) => {
      const event = e || window.event;
      if (event.button === 0) {
        //鼠标抬起,就不允许在处理鼠标移动事件
        this.select = false;
        //隐藏图层
        if (this.rect) {
          this.$refs.elTable.$el.removeChild(this.rect);
          this.rect = null;
        }
      }
    });
  },
  methods: {
    handleExpandChange (row, expanded) {
      row.expandedRow = expanded
    },
    getLocalSummaries (param) {
      if (this.getSummaries) {
        return this.getSummaries(param)
      }
      return []
    },
    doLayout () {
      this.$refs.elTable.doLayout()
    },
    iconShow (options) {
      if (options) {
        const text = JSON.parse(options);
        return text.prompt;
      } else {
        return false;
      }
    },
    handleCellStyle (obj) {
      if (this.handleCellStyleFunc) {
        return this.handleCellStyleFunc(obj)

      }
      let st = {}
      const property = obj.column.property
      if (property && this.bgColorsObj[property]) {
        const { bgColor, fontColor } = this.bgColorsObj[property]
        const fc = {}
        if (fontColor) {
          fc['color'] = `${fontColor} !important`
        }
        st = { background: bgColor, ...fc }
      }
      return st
    },
    loadTree (tree, treeNode, resolve) {
      if (this.loadTreeData) {
        this.loadTreeData(tree, treeNode, resolve)
      } else {
        const arr = !!tree.childrenNodes && !!tree.childrenNodes.length ? tree.childrenNodes : []
        const nextArr = arr.map(item => {
          const nextItem = {
            ...item,
            children: !!item.childrenNodes ? item.childrenNodes : [],
            hasChildren: !!item.childrenNodes && !!item.childrenNodes.length,
          }
          delete nextItem.children
          return nextItem
        })
        resolve(nextArr)
      }

    },
    rowStyle ({ row, rowIndex }) {
      if (!this.rowSetStyle) {
        return {}
      }
      return this.rowSetStyle(row, rowIndex)
    },
    init (data) {
      this.showIf = false;
      this.propertyFields = JSON.parse(JSON.stringify(data));
      this.propertyFieldsArr = JSON.parse(JSON.stringify(data));
      this.$nextTick(() => {
        this.showIf = true;
      });
    },
    /**
     * 处理按钮是否禁用
     * @param buttonInfo 按钮信息
     * @param row 行信息
     */
    handleButtonDisable (buttonInfo, row) {
      if (this.buttonDisable) {
        return this.buttonDisable(buttonInfo, row)
      } else {
        return false
      }
    },
    handleCommand (command, row, formId, buttonData) {
      if (!this.handleButtonDisable(command, row)) {
        this.newButton(command, row, formId, buttonData);
      }
    },
    //行拖拽
    rowDrop () {
      const tbody = document.querySelector(
        ".el-table__body-wrapper tbody"
      );
      const _this = this;
      Sortable.create(tbody, {
        onEnd ({ newIndex, oldIndex }) {
          const currRow = _this.tableData.splice(oldIndex, 1)[0];
          _this.tableData.splice(newIndex, 0, currRow);
        },
      });
    },
    //列拖拽
    columnDrop () {
      const wrapperTr = document.querySelector(
        ".el-table__header-wrapper tr"
      );
      this.sortable = Sortable.create(wrapperTr, {
        animation: 180,
        delay: 0,
        onEnd: (evt) => {
          const oldItem = this.propertyFieldsArr[evt.oldIndex - 1];
          this.propertyFieldsArr.splice(evt.oldIndex - 1, 1);
          this.propertyFieldsArr.splice(evt.newIndex - 1, 0, oldItem);
          this.propertyFields = JSON.parse(
            JSON.stringify(this.propertyFieldsArr)
          );
          this.showIf = false;
          this.$emit("columnDrop", this.propertyFieldsArr);
          this.$nextTick(() => {
            this.showIf = true;
          });
        },
      });
    },
    renderHeader (h, { column, $index }, row) {
      let data = JSON.parse(JSON.stringify(row))
      if (data.options) {
        data.options = JSON.parse(data.options);
        data.options.placement = data.options.placement || []
        if (data.options.prompt && data.options.prompt.indexOf('slot') != -1) {
          const [, s] = data.options.prompt.split('#')
          data.options.prompt = ''
          data.options.slot = s
        }
      }
      return h(
        "div",
        {
          style: column.sortable ? "display:inline-flex; max-width: calc(100% - 24px)" : "display:inline-flex; max-width: 100%",
        },
        [
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
                [
                  data.required && h(
                    "span",
                    {
                      style: "color: red;padding-right: 2px;"
                    },
                    '*'
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
              )
            ]
          ),
          data.options && data.options.prompt && data.options.placement.includes('table') ?
            h(PromptHeader, {
              style: "cursor: pointer;margin-left: 5px;",
              props: {
                value: data.options.prompt,
              },
            }) : '',
          data.options && data.options.slot ?
            h(TooltipImg, {
              props: {
                tooltipType: data.options.slot,
                width: '700px'
              },
            }, [h("i", { class: 'el-icon-question' })]) : '',
        ]
      );
    },
    renderSpecNameHeader (h, { column, $index }, row) {
      let data = JSON.parse(JSON.stringify(row));
      if (data.options) {
        data.options = JSON.parse(data.options);
        data.options.placement = data.options.placement || []
      }
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
        h(FilterData, { style: 'cursor: pointer;margin-left: 5px;font-size:20px;', props: { 'data-arr': this.tableData, property: column.property, propertyFields: this.propertyFields }, on: { updateFilterData: this.updateFilterData } }),
        data.options && data.options.prompt && data.options.placement.includes('table') ?
          h(PromptHeader, {
            style: "cursor: pointer;margin-left: 5px;",
            props: {
              value: data.options.prompt,
            },
          }) : '',
      ])
    },
    setCurrentRow (row) {
      this.$refs.elTable.setCurrentRow(row);
    },
    updateFilterData (row) {
      let tableData = JSON.parse(JSON.stringify(this.tableData));
      this.changeData[row.property] = row.data;
      for (const key in this.changeData) {
        tableData = this.filterDataArr(this.changeData[key], tableData, key, row.fieldObj)
      }
      this.dataList = tableData;
    },
    filterDataArr (data, tableData, key, { fieldType, fieldFormat }) {
      let dataArr = [];
      tableData.forEach((item) => {
        if (data.includes(fieldType === 'date' ? this.parseTime(item[key], fieldFormat) : item[key] + '')) {
          dataArr.push(item);
        }
      })
      return dataArr
    },
    setExpandOrCollapse (row, flag = true) {
      const that = this
      const prop = this.treeProps.children
      function calculateLevel (row, arr) {
        that.$refs["elTable"].toggleRowExpansion(row, flag)
        row.isExpand = flag
        arr.forEach(element => {
          if (element[prop]) {
            element.hasChildren = !!element[prop].length
            calculateLevel(element, element[prop])
          }
        });
      }
      calculateLevel(row, row[prop])
    },
    async setCheckedOrUnchecked (row, flag = true) {
      await this.handleCollapse(row, flag)
      const that = this
      const prop = this.treeProps.children
      function calculateLevel (row, arr) {
        that.$refs["elTable"].toggleRowSelection(row, flag)
        row.isChecked = flag
        arr.forEach(element => {
          if (element[prop]) {
            element.hasChildren = !!element[prop].length
            calculateLevel(element, element[prop])
          }
        });
      }
      calculateLevel(row, row[prop])
    },
    handleCheckedAll (row) {
      this.setCheckedOrUnchecked(row, true)
    },
    handleUncheckedAll (row) {
      this.setCheckedOrUnchecked(row, false)
    },
    handleExpand (row) {
      this.setExpandOrCollapse(row, false)
    },
    handleCollapse (row) {
      this.setExpandOrCollapse(row, true)
    },
    //选择框回调
    selectChange (data) {
      if (data) {
        let { fieldType, type, value, watch } = data;
        this.createTime(fieldType, type, value);
        this.$emit("selectChange", {
          formData: this.formData,
          isWatch: watch,
        });
      } else {
        this.$emit("selectChange", {
          formData: this.formData,
          isWatch: false,
        });
      }
    },
    createTime (fieldType, type, value) {
      if (fieldType && fieldType.indexOf("date") !== -1) {
        if (value) {
          this.formData[type + "Start"] = value[0];
          this.formData[type + "End"] = value[1];
        } else {
          this.formData[type + "Start"] = null;
          this.formData[type + "End"] = null;
        }
      } else {
        this.formData[type] = value;
      }
    },
    handelCurrentChange (row, a, d) {
      this.$emit(
        "handleCurrentChange",
        row
      );
    },
    handleSelectionChange (selection) {
      this.selection = selection;
      this.ids = selection.map((item) => item[this.idName]);
      let single = selection.length !== 1;
      let multiple = !selection.length;
      this.$emit(
        "handleSelectionChange",
        this.ids,
        single,
        multiple,
        selection
      );
    },
    emitAblFilter () {
      this.$emit("emitAblFilter", this.listQuery);
    },
    newButton (buttonCode, row = {}, formId, buttonData = '') {
      let idArr = [], rowArr = [], type = '';
      if (JSON.stringify(row) != "{}") {
        idArr = [row[this.idName]];
        rowArr = [row];
        type = 'list';
      } else {
        idArr = this.ids;
        rowArr = this.selection;
        type = 'top';
      }
      this.$emit("handleButton", buttonCode, idArr, rowArr, { formId, type, buttonData });
    },
    // 列表超链接 row行数据 fieldCode 表的字段 linkText 为链接页面的内容
    clickLink (row = {}, fieldCode, linkText) {
      this.$emit("clickLink", row, fieldCode, linkText);
    },
    // getRowValue(values, columnProperty) {
    //     let sumColumn = this.sumColumn;
    //     let sumColumnFields = this.sumColumn.map((item) => item.filedCode);
    //     return values.reduce((prev, curr) => {
    //         const value = Number(curr);
    //         if (!isNaN(value)) {
    //             return (Number(prev) + Number(curr)).toFixed(
    //                 sumColumn[sumColumnFields.indexOf(columnProperty)]
    //                     .filedFormat
    //             );
    //         } else {
    //             return Number(prev).toFixed(
    //                 sumColumn[sumColumnFields.indexOf(columnProperty)]
    //                     .filedFormat
    //             );
    //         }
    //     }, 0);
    // },
    // getSummaries(param) {
    //     let { columns, data } = param;
    //     const sums = [];
    //     let sumColumnFields = this.sumColumn.map((item) => item.filedCode);
    //     let sumColumn = this.sumColumn;
    //     let totalColumn = this.totalColumn;
    //     columns.forEach((column, index) => {
    //         if (index === 0) {
    //             if (sumColumn.length && totalColumn.length) {
    //                 sums[index] = (
    //                     <div>
    //                         <div>小计</div>
    //                         <br />
    //                         <div>合计</div>
    //                     </div>
    //                 );
    //             } else {
    //                 if (sumColumn.length) {
    //                     sums[index] = <div>小计</div>;
    //                 }
    //                 if (totalColumn.length) {
    //                     sums[index] = <div>合计</div>;
    //                 }
    //             }
    //             return;
    //         }

    //         const values = data.map(
    //             (item) =>
    //                 sumColumnFields.indexOf(column.property) > -1 &&
    //                 Number(item[column.property])
    //         );
    //         if (sumColumn.length && totalColumn.length) {
    //             if (
    //                 sumColumnFields.indexOf(column.property) > -1 &&
    //                 totalColumn.indexOf(column.property) > -1
    //             ) {
    //                 sums[index] = (
    //                     <div>
    //                         <div>
    //                             {this.getRowValue(values, column.property)}
    //                         </div>
    //                         <br />
    //                         <div>{this.totalNum[column.property]}</div>
    //                     </div>
    //                 );
    //             } else {
    //                 if (sumColumnFields.indexOf(column.property) > -1) {
    //                     sums[index] = (
    //                         <div>
    //                             <div>
    //                                 {this.getRowValue(
    //                                     values,
    //                                     column.property
    //                                 )}
    //                             </div>
    //                             <br />
    //                             <div>-</div>
    //                         </div>
    //                     );
    //                 }
    //                 if (totalColumn.indexOf(column.property) > -1) {
    //                     sums[index] = (
    //                         <div>
    //                             <div>-</div>
    //                             <br />
    //                             <div>{this.totalNum[column.property]}</div>
    //                         </div>
    //                     );
    //                 }
    //             }
    //         } else {
    //             if (sumColumn.length) {
    //                 if (sumColumnFields.indexOf(column.property) > -1) {
    //                     sums[index] = this.getRowValue(
    //                         values,
    //                         column.property
    //                     );
    //                 }
    //             }
    //             if (totalColumn.length) {
    //                 sums[index] = this.totalNum[column.property];
    //             }
    //         }
    //     });
    //     return sums;
    // },
    rightClick ({ row, column, e }) {
      const event = e || window.event;
      const eventDiv = event.target || event.srcElement;
      this.listColumn = column;
      this.tableRowText = eventDiv.innerText;
      event.preventDefault();
      this.$refs.rightMenu.show(event, this.$refs.elTable.$el, row, this.treeProps.children);
    },
    clickTableRow (row, column, event) {
      if (column && column.label == '操作') {
        return
      }
      this.$emit('clickTableRow', row);
      this.$refs.rightMenu.hide(event);
      // 多选选中行
      // 根据id判断当前点击的是否被选中
      const selected = this.selection.some(item => item[this.idName] === row[this.idName])
      if (!selected) {
        this.$refs.elTable.toggleRowSelection(row, true);
      } else {
        this.$refs.elTable.toggleRowSelection(row, false);
      }
    },
    updateSelection (arr = []) {
      for (let i = 0; i < arr.length; i++) {
        this.$refs.elTable.toggleRowSelection(arr[i], true);
      }
    },
    listSet () {
      this.$parent.$refs.rightToolbar.listClick()
    },
    tabConfigSuccess (row) {
      this.init(row);
    },
    listSort (order) {
      this.sortableColumnChange({ order, prop: this.listColumn.property });
    },
    getParentName (obj) {
      let node = obj;
      let ofDiv = true;
      while (ofDiv && node) {
        if (node.parentNode && typeof node.parentNode.className === 'string' && node.parentNode.className.includes("el-table__header-wrapper")) {  // 条件示例
          node = node.parentNode;
          ofDiv = false;
        } else {
          node = node.parentNode;
        }
      }
      return node
    },
    mousedown (e) {
      const event = e || window.event;
      const eventDiv = event.target || event.srcElement;
      // 当允许鼠标按下时,才允许处理鼠标的移动事件,这里结合项目其他问题所以设置了判断条件
      if (this.isMouseDown && event.button === 0 && eventDiv.className != 'el-input__inner') {

        if (typeof eventDiv.className === 'string' && eventDiv.className.indexOf('el-table__body-wrapper') == -1) {
          const tableBody = this.$refs.elTable.$el.querySelector(".el-table__body");
          tableBody.children[1].childNodes.forEach((element) => {
            for (let index = 0; index < element.childNodes.length; index++) {
              // 获取当前单元格
              const cell = element.childNodes[index];
              cell.style.border = "";
            }
          })
        }

        this.select = false;
        if (this.rect) {
          this.$refs.elTable.$el.removeChild(this.rect);
          this.rect = null;
        }

        this.selectedData = '';

        //阻止表头显示框选功能
        if (this.getParentName(eventDiv)) {
          return false
        }

        this.select = true;
        this.rect = document.createElement("div");
        // 框选div 样式
        this.rect.style.cssText =
          "position:absolute;width:0px;height:0px;font-size:0px;margin:0px;padding:0px;border:1px solid #0099FF;background-color:#C3D5ED;z-index:1000;filter:alpha(opacity:60);opacity:0.6;display:none;";
        this.rect.id = "selectDiv";
        this.getTableMarginLeft();

        const container = this.$refs.elTable.$el.querySelector(
          ".el-table__body-wrapper"
        ); // 获取table容器元素
        this.$refs.elTable.$el.appendChild(this.rect); // 添加到table元素下

        // 取得鼠标按下时的坐标位置
        this.downX =
          event.x ||
          event.clientX + container.scrollLeft - this.tableRectLeft; // 鼠标按下时的x轴坐标 event.x 兼容火狐浏览器, event.clientX 兼容谷歌浏览器
        this.downY =
          event.y ||
          event.clientY + container.scrollTop - this.tableRectTop; // 鼠标按下时的y轴坐标

        this.rect.style.left = this.downX + "px"; // 设置你要画的矩形框的起点位置
        this.rect.style.top = this.downY + "px"; // 设置你要画的矩形框的起点位置
        //设置你要画的矩形框的起点位置
        this.rect.style.left = this.downX; // 因为在火狐浏览器下,上面的代码不起作用,所以在这里再写一遍，为什么火狐浏览器不起作用,因为火狐浏览器下,我们的div是绝对定位的,所以我们要加上px，为什么这里没加px,因为我们下面要加上px,所以这里不用加
        this.rect.style.top = this.downY;
      } else {
        return;
      }
    },
    mousemove (e) {
      const event = e || window.event;
      /*
      这个部分,根据你鼠标按下的位置,和你拉框时鼠标松开的位置关系,可以把区域分为四个部分,根据四个部分的不同,
      我们可以分别来画框,否则的话,就只能向一个方向画框,也就是点的右下方画框.
      */
      if (this.select && this.isMouseDown && event.button === 0) {
        this.$refs.rightMenu.hide(event);
        // 取得鼠标移动时的坐标位置
        this.mouseX2 = event.clientX; // 鼠标移动时的x轴坐标
        this.mouseY2 = event.clientY; // 鼠标移动时的y轴坐标

        //处理rect定位影响列表点击事件
        const W = Math.abs(this.mouseX2 - this.downX), H = Math.abs(this.mouseY2 - this.downY);
        if (W >= 2 && H >= 2) {
          // 框选元素的显示与隐藏
          if (this.rect.style.display == "none") {
            this.rect.style.display = "";
          }
        } else {
          this.rect.style.display = "none";
        }

        // 框选元素的位置处理
        this.rect.style.left =
          Math.min(this.mouseX2, this.downX) -
          this.tableRectLeft +
          "px";

        this.rect.style.top =
          Math.min(this.mouseY2, this.downY) -
          this.tableRectTop +
          "px"; // 取得鼠标拉框时的起点坐标

        this.rect.style.width = W + "px"; // 取得鼠标拉框时的宽度

        this.rect.style.height = H + "px"; // 取得鼠标拉框时的高度
        // A part
        if (this.mouseX2 < this.downX && this.mouseY2 < this.downY) {
          this.rect.style.left = this.mouseX2 + this.tableRectLeft;
          this.rect.style.top = this.mouseY2 + this.tableRectTop;
        }

        // B part
        if (this.mouseX2 > this.downX && this.mouseY2 < this.downY) {
          this.rect.style.left = this.downX + this.tableRectLeft;
          this.rect.style.top = this.mouseY2 + this.tableRectTop;
        }

        // C part
        if (this.mouseX2 < this.downX && this.mouseY2 > this.downY) {
          this.rect.style.left = this.mouseX2 + this.tableRectLeft;
          this.rect.style.top = this.downY + this.tableRectTop;
        }

        // D part
        if (this.mouseX2 > this.downX && this.mouseY2 > this.downY) {
          this.rect.style.left = this.downX + this.tableRectLeft;
          this.rect.style.top = this.downY + this.tableRectTop;
        }
      } else {
        return;
      }

      this.stopEvent(event);
    },
    mouseup (e) {
      const event = e || window.event;
      if (this.select && this.isMouseDown && event.button === 0) {
        const rectW = this.rect.offsetWidth, rectH = this.rect.offsetHeight;
        if (rectW <= 10 && rectH <= 10) {
          return
        }
        const container = this.$refs.elTable.$el.querySelector(
          ".el-table__body-wrapper"
        ); // 获取table容器元素
        const scrollTop = container.scrollTop; // 获取el-table的scrollTop和scrollLeft
        const scrollLeft = container.scrollLeft;

        const headerWrapper = this.$refs.elTable.$el.querySelector(
          ".el-table__header-wrapper"
        );
        const tableHeaderHeight = Math.ceil(
          headerWrapper.getBoundingClientRect().height
        );

        const rectLeft = this.rect.offsetLeft + scrollLeft - this.tableRectLeft;
        const rectTop = this.rect.offsetTop + scrollTop - this.tableRectTop - tableHeaderHeight;

        const tableBody = this.$refs.elTable.$el.querySelector(".el-table__body");

        let selectedArr = [], columnIndex = [];

        tableBody.children[1].childNodes.forEach((element) => {
          for (let index = 0; index < element.childNodes.length; index++) {
            // 获取当前单元格
            const cell = element.childNodes[index];

            if (
              // 判断选中的单元格是否在鼠标拉框的范围内
              rectLeft < cell.offsetLeft - this.tableRectLeft + cell.offsetWidth &&
              rectLeft + this.rect.offsetWidth > cell.offsetLeft - this.tableRectLeft &&
              rectTop < cell.offsetTop - this.tableRectTop + cell.offsetHeight &&
              rectTop + this.rect.offsetHeight > cell.offsetTop - this.tableRectTop
            ) {
              cell.style.border = "1px solid #409eff";
              const cellText = cell.innerText;
              selectedArr.push(cellText);
              if (columnIndex.indexOf(index) === -1) {
                columnIndex.push(index);
              }
            }
          }
        });
        let str = '';
        selectedArr.forEach((val, i) => {
          if (((i + 1) / columnIndex.length) % 1 === 0) {
            str += `${val}\n`;
          } else {
            str += `${val} `;
          }
        })
        this.selectedData = str;

        //鼠标抬起,就不允许在处理鼠标移动事件
        this.select = false;
        //隐藏图层
        if (this.rect) {
          this.$refs.elTable.$el.removeChild(this.rect);
          this.rect = null;
        }
      } else {
        return;
      }
    },
    // 阻止默认事件
    stopEvent (event) {
      if (event.stopPropagation) {
        // 标准浏览器
        event.stopPropagation(); // 阻止事件冒泡
        event.preventDefault(); // 阻止默认事件
      } else {
        // IE浏览器
        event.cancelBubble = true;
        event.returnValue = false;
      }
    },
    // 获取table距离页面左侧和上方的距离
    getTableMarginLeft () {
      const tableRect = this.$refs.elTable.$el.getBoundingClientRect(); // 获取el-table元素的位置信息
      this.tableRectTop = Math.ceil(tableRect.top);
      this.tableRectLeft = Math.ceil(tableRect.left);
    },
    handleShowButton (row) {
      if (this.showButton) {
        return this.showButton(row)
      } else {
        return true
      }
    }
  },
  beforeUpdate () {
    this.$nextTick(() => {
      if (this.$refs.elTable) {
        this.$refs.elTable.doLayout();
      }
    });
  },
};
</script>
<style lang="scss" scoped>
.container_div {
  position: relative;
  flex: 1;
  min-height: 100px;
  -webkit-user-select: none;
  /* Safari */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* IE10+/Edge */
  user-select: none;
  /* Standard syntax */
}

::v-deep .table-action {
  text-overflow: inherit;
}

::v-deep .table-action .cell {
  overflow: hidden;
  text-overflow: inherit;
  word-break: normal;
}

::v-deep .divHeader {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slotIcon-color {
  color: #1890ff;
  font-size: 16px;
  margin-right: 10px;
}

.slotIcon-colorA {
  color: #1890ff;
  font-size: 16px;
  line-height: 30px;
  margin-left: 2px;
  position: absolute;
  top: 0;
  right: 8px;
}
</style>
