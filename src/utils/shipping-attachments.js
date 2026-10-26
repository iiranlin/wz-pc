// 发货单级附件；与物资明细中的合格证、厂检报告分别存储。
export const loadingPhotoFields = [
  { key: 'zczp', label: '装车照片1(车牌)' },
  { key: 'zczp2', label: '装车照片2(车尾)' },
  { key: 'zczp3', label: '装车照片3(货位)' }
];

export const qualityFileFields = [
  { key: 'hgz', label: '合格证' },
  { key: 'zjbg', label: '自检报告' },
  { key: 'xssybg', label: '型式实验报告' }
];

export const shippingAttachmentLabels = {
  ...Object.fromEntries([...loadingPhotoFields, ...qualityFileFields].map(field => [field.key, field.label])),
  zlzmwj: '其他质量文件',
  zlzm: '其他质量文件'
};

export function readShippingAttachments(value, qualityProp = 'zlzmwj', qualityKey = 'zlzmwj') {
  const files = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {});
  const result = {};
  [...loadingPhotoFields, ...qualityFileFields].forEach(({ key }) => {
    result[key] = files[key] || [];
  });
  const alternateKey = qualityKey === 'zlzm' ? 'zlzmwj' : 'zlzm';
  result[qualityProp] = files[qualityKey] || files[alternateKey] || [];
  return result;
}

// 后台表单配置未包含新增字段时，也需提前建立响应式模型，供 setFormData 回填。
export function initShippingAttachments(form) {
  [...loadingPhotoFields, ...qualityFileFields].forEach(({ key }) => {
    form.$set(form.formDataModel, key, []);
  });
}

export function writeShippingAttachments(files, model, qualityProp = 'zlzmwj', qualityKey = 'zlzmwj') {
  [...loadingPhotoFields, ...qualityFileFields].forEach(({ key }) => {
    if (Object.prototype.hasOwnProperty.call(model, key)) files[key] = model[key] || [];
  });
  // 空数组也写入，确保删除附件后不会保留旧文件。
  files[qualityKey] = model[qualityProp] || [];
}

// 将附件组拆为原表单的独立栅格，避免多个表单项挤在同一单元格。
export function prepareShippingAttachmentLayout(value, slotGroups) {
  const json = typeof value === 'string' ? JSON.parse(value) : JSON.parse(JSON.stringify(value));
  const clone = value => JSON.parse(JSON.stringify(value));
  const fieldsFor = groups => (Array.isArray(groups) ? groups : [groups]).flatMap(group => group === 'photos'
    ? loadingPhotoFields
    : [...qualityFileFields, { key: 'otherQuality' }]);

  function expandGrid(grid) {
    const hasAttachments = grid.cols.some(col => (col.widgetList || []).some(widget => slotGroups[widget.options?.name]));
    if (!hasAttachments) return [grid];
    const cells = grid.cols.flatMap(col => {
      const widgets = col.widgetList || [];
      const slot = widgets.find(widget => widget.type === 'slot' && slotGroups[widget.options?.name]);
      if (!slot) return widgets.length ? [col] : [];
      // 每组附件独占一个栅格；不复制同格中的其他业务字段。
      if (widgets.length !== 1) return [col];
      return fieldsFor(slotGroups[slot.options.name]).map(({ key }) => {
        const cell = clone(col);
        cell.id = `${col.id}_${key}`;
        cell.options.name = `${col.options.name}_${key}`;
        const field = cell.widgetList[0];
        field.id = `${slot.id}_${key}`;
        field.options.name = `${slot.options.name}_${key}`;
        field.options.shippingAttachmentSlot = slot.options.name;
        field.options.shippingAttachmentKey = key;
        return cell;
      });
    });
    const rows = [];
    let columns = [];
    let used = 0;
    const flush = () => {
      if (!columns.length) return;
      const row = clone(grid);
      row.id = `${grid.id}_attachments_${rows.length}`;
      row.options.name = `${grid.options.name}_attachments_${rows.length}`;
      row.cols = columns;
      rows.push(row);
      columns = [];
      used = 0;
    };
    cells.forEach(col => {
      const span = Number(col.options.span || col.options.md || 12);
      if (used + span > 24) flush();
      columns.push(col);
      used += span;
      if (used >= 24) flush();
    });
    flush();
    return rows;
  }

  function visit(widgets) {
    return widgets.flatMap(widget => {
      if (widget.widgetList) widget.widgetList = visit(widget.widgetList);
      if (widget.cols) widget.cols.forEach(col => { if (col.widgetList) col.widgetList = visit(col.widgetList); });
      if (widget.tabs) widget.tabs.forEach(tab => { if (tab.widgetList) tab.widgetList = visit(tab.widgetList); });
      return widget.type === 'grid' ? expandGrid(widget) : [widget];
    });
  }
  json.widgetList = visit(json.widgetList || []);
  return json;
}
