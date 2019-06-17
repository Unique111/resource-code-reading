## vue思想

### 数据驱动
![vue双向数据绑定](https://raw.githubusercontent.com/Unique111/resource-code-reading/master/vue/imgs/01_vue.jpeg)

vue采用双向绑定方式：
- Vue采用MVVM的设计模式；
- M-Model表示模型（js对象）；
- V-View是文档模型DOM（UI界面）；
- ViewModel表示的是一个Vue实例对象。

### 组件化思想

## vue内部运行机制
![vue内部运行机制](https://raw.githubusercontent.com/Unique111/resource-code-reading/master/vue/imgs/02_vue.jpeg)

### 初始化与挂载
- new Vue() => 调用_init函数进行初始化，初始化生命周期、事件、props、methods、data、computed与watch等；
- 其中最重要的是通过`Object.defineProperty`设置setter与getter函数，用来实现响应式以及依赖收集；
- 初始化后，调用$mount会挂载组件。

### 编译三部曲
- `Parser（解析）`：利用正则将模板转换成抽象语法树（AST）；
- `optimize（标记静态节点做优化）`：标记静态节点，以后update的时候，diff算法可以跳过静态节点；
- `generate（转成字符串）`：将抽象语法树转成字符串，供render去渲染DOM。

### 响应式
- 利用Object.defineProperty设置data所返回对象，进行render function渲染时，读取data对象数据，触发getter函数；
- 对data中的属性进行依赖收集，放到观察者（watcher）观察队列中；
- 修改data内属性会触发setter函数，通知观察者数据变化，观察者调用update更新视图。

### 虚拟DOM
render function会被转换成虚拟DOM——实际是一个`js对象`。

### 更新视图
- 数据变化后，执行render function可以得到一个新的VNode节点；
- 得到新视图最简单粗暴的方法：直接解析新VNode节点，用innerHTML全部渲染到真实DOM中；
- update时，执行patch，传入新旧VNode，通过diff算法算出差异，局部更新视图，做到最优化。
