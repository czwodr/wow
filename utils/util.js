
function isIphoneX() {
  let o = wx.getSystemInfoSync(), is;
  if (o.model.indexOf('iPhone X') >= "0") {
    is = true
  } else {
    is = false
  }
  return is;
}


function setsort(data){
  
}

module.exports = {
  isIphoneX
}
