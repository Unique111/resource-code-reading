## vue事件绑定
### 事件绑定格式
格式：<v-on:事件名=函数名>
- 函数名：定义在vue实例的methods对象中，vue实例可以直接访问其中的方法。

### 事件修饰符
| 修饰符 | 用法 |
| -------------- | --------- |
| .stop | 阻止单击事件冒泡：`<a v-on:click.stop="doThis"></a>` |
| .prevent | 提交事件不再重载页面：`<form v-on:submit.prevent="onSubmit"></form>` |
| .capture | 添加事件侦听器时使用事件捕获模式：`<div v-on:click.capture="doThis"></div>` |
| .self | 只当事件在该元素本身触发时调用：`<div v-on:click.self="doThis"></div>` |
| .once | 只触发一次：`<div v-on:click.once="doThis"></div>` |

键盘事件，可以添加按键修饰符：
- .enter
- .tab
- .delete
- .esc
- .space
- .up
- .down
- .left
- .right
```html
<input v-on:keyup.enter="submit />
```

## Watch和Computed
Watch和Computed都是以Vue的`依赖追踪机制`为基础的，它们都试图处理：当某一个数据（称为依赖数据）发生变化时，所有依赖这个数据的”相关“数据”自动“发生变化，即`自动调用相关的函数去实现数据的变动`。

### Watch和Computed的区别
- Computed：计算属性，事实上，和data对象里的数据属性使用方式是一致的。
- Watch：类似于监听机制 + 事件机制。

```javascript
computed: {
  fullName: function () {
    return this.firstName + this.lastName
  }
}

watch: {
  firstName: function (val) {
    this.fullName = val + this.lastName
  }
}
```

### Watch和Computed的使用

#### Computed
- Computed擅长处理的场景：`一个数据受多个数据影响`；
- Computed：对于`不存在依赖型数据时`，计算属性不会重新计算，会缓存之前得到的值；

#### Watch
- watch和computed很相似，watch用于`观察和监听页面上的vue实例`；
- 如果要在`数据变化的同时，进行异步操作或是比较大的开销`，watch为最佳选择；
- Watch擅长处理的场景：`一个数据影响多个数据`。
