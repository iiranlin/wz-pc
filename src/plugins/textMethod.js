export default {
  money (val) {
    if(val == 0) {
      return `${val} 元`
    }
    return val?fmoney(val)+ ' 元' : ''
  }
}
//千分位格式化：10000转为10,000.00
function fmoney (s, n) {
  if (s == '' || s == null || s == undefined | isNaN(Number(s))) {
      return s
  }
  s = Number(s) ? Number(s) : s
  n = ((n || n == 0) && n > -1 && n <= 20) ? n : 2;
  s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
  var l = s.split(".")[0].split("").reverse();
  var r = s.split(".")[1];
  var t = "";
  for (var i = 0; i < l.length; i++) {
      t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
  }
  if (n > 0) {
      r = '.' + r
  } else if (n == 0) {
      r = ''
  }
  let returnT = t.split("").reverse().join("") + r;
  //负数处理
  if (returnT[0] == '-' && returnT[1] == ',') {
      returnT = '-' + returnT.substring(2)
  }
  return returnT;
}