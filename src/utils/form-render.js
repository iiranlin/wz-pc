const DEFAULT_READONLY_CLASS = "fixed-readonly-field";

const normalizeFieldKey = (value = "") => String(value || "").replace(/[：:\s]/g, "");

const appendCustomClass = (options, className) => {
  const customClass = options.customClass;
  const classList = Array.isArray(customClass) ? customClass : customClass ? [customClass] : [];

  if (!classList.includes(className)) {
    classList.push(className);
  }

  options.customClass = classList;
};

const traverseWidgets = (widgets, callback) => {
  if (!Array.isArray(widgets)) {
    return;
  }

  widgets.forEach((widget) => {
    if (!widget) {
      return;
    }

    callback(widget);

    traverseWidgets(widget.widgetList, callback);

    if (Array.isArray(widget.cols)) {
      widget.cols.forEach((col) => traverseWidgets(col.widgetList, callback));
    }

    if (Array.isArray(widget.rows)) {
      widget.rows.forEach((row) => {
        (row.cols || []).forEach((col) => traverseWidgets(col.widgetList, callback));
      });
    }

    if (Array.isArray(widget.tabs)) {
      widget.tabs.forEach((tab) => traverseWidgets(tab.widgetList, callback));
    }
  });
};

export function setReadonlyTextFields(formJson, fields, options = {}) {
  const formJsonObj = typeof formJson === "string" ? JSON.parse(formJson) : formJson;
  const readonlyClassName = options.className || DEFAULT_READONLY_CLASS;
  const fieldSet = new Set((fields || []).map(normalizeFieldKey).filter(Boolean));

  traverseWidgets(formJsonObj && formJsonObj.widgetList, (widget) => {
    if (!widget.options || widget.type === "slot") {
      return;
    }

    const widgetKeys = [
      widget.options.name,
      widget.options.i18n,
      widget.options.label,
    ].map(normalizeFieldKey);

    if (!widgetKeys.some((key) => fieldSet.has(key))) {
      return;
    }

    widget.options.readonlyText = true;
    widget.options.readonly = true;
    appendCustomClass(widget.options, readonlyClassName);
  });

  return formJsonObj;
}
