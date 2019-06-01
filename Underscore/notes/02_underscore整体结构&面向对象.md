## Underscore的结构
### 作用域包裹
通过立即执行函数来包裹自身的业务逻辑。

目的：
- 避免全局污染；
- 隐私保护：但凡在立即执行函数中声明的函数、变量等，除非是自己想暴露，否则绝无可能在外部获得。

### _ 对象
_是一个函数对象，所有的api都挂载在这个对象上。
```javascript
var _ = function (obj) {
  if (obj instanceof _) {
    return obj
  }

  if (!(this instanceof _)) {
    return new _(obj)
  }

  this._wrapped = obj
}
```

### _()
underscore也支持面向对象风格的函数调用，仅需要通过_()来包裹对象即可。

### mixin
```javascript
_.mixin = function (obj) {
  _.each(_.functions(obj), function (name) {
    var func = obj[name]

    _.prototype[name] = function () {
      var args = [this._wrapped]
      push.apply(args, arguments)
      return result(this, func.apply(this, args))
    }
  })
}
```

### 链接式调用
#### _.chain()
```javascript
_.chain = function (obj) {
  var instance = _(obj)
  instance._chain = true
  return instance
}

// 帮助函数result，判断方法的调用结果，是否需要链化
var chainResult = function (instance, obj) {
  return instance._chain ? _(obj).chain() : obj
}
```
