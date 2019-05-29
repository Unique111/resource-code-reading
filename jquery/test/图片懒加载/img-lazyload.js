/**
 * 1.将img中的src设为同一张图片，真正的图片地址存储在img自定义属性中；
 * 2.js监听图片进入可视窗口时，将自定义属性的地址存储到src中。
 */

(function () {
  var imgList = [],  // 页面所有img元素集合
    timer,           // setTimeout 对象
    offset,          // 偏移量，用于指定图片距离可视区域多少距离，进行加载
    time,            // 延迟载入时间
    _selector;       // 选择器 默认为 .m-lazyload

  function _isShow(el) {
    var coords = el.getBoundingClientRect();
    return ((coords.top >= 0 && coords.left >= 0 && coords.top) <= (window.innerHeight || document.documentElement.clientHeight) + parseInt(offset));
  }

  function _loadImage() {
    for (var i = imgList.length; i--;) {
      var el = imgList[i];
      if (_isShow(el)) {
        el.src = el.getAttribute('data-src');
        el.className = el.className.replace(new RegExp("(\\s|^)" + _selector.substring(1, _selector.length) + "(\\s|$)"), " ");
        imgList.splice(i, 1);
      }
    }
  }

  function _delay() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      _loadImage();
    }, time);
  }

  function ImageLazyload(selector, options) {
    var defaults = options || {};
    offset = defaults.offset || 0;
    time = defaults.time || 250;
    _selector = selector || '.m-lazyload';

    this.getNode();
    _delay();   // 避免首次加载未触发touch事件,主动触发一次加载函数

    if (defaults.iScroll) {
      defaults.iScroll.on('scroll', _delay);
      defaults.iScroll.on('scrollEnd', _delay);
    } else {
      window.addEventListener('scroll', _delay, false);
    }
  }

  ImageLazyload.prototype.getNode = function () {
    imgList = [];
    var nodes = document.querySelectorAll(_selector);
    for (var i = 0, l = nodes.length; i < l; i++) {
      imgList.push(nodes[i]);
    }
  };

  return ImageLazyload;
})();
