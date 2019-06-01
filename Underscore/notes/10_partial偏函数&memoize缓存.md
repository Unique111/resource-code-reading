## _.partial偏函数
使用：
```javascript
var add = function (a, b) {
  return a + b
}

var partialAdd = _.partial(add, 5)
console.log(partialAdd(10)) // 15
```

```javascript
// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. _ acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
_.partial = restArguments(function(func, boundArgs) {
  var placeholder = _.partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});
```

## _.memoize缓存
使用：
```javascript
var fibonacci = _.memoize(function (n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2)
})
fibonacci(10)
console.log(fibonacci.cache)
```

```javascript
// Memoize an expensive function by storing its results.
_.memoize = function(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
};
```
