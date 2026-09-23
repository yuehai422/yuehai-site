---
title: 项目知识库
date: 2026-09-19
slug: vue-component-visibility
draft: false
tags: []
---

# 项目知识库

**目录**

- [Vue 组件封装与可见性](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#vue-%E7%BB%84%E4%BB%B6%E5%B0%81%E8%A3%85%E4%B8%8E%E5%8F%AF%E8%A7%81%E6%80%A7)
- [响应式与渲染更新](#响应式与渲染更新)
- [路由守卫与页面标题](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#%E8%B7%AF%E7%94%B1%E5%AE%88%E5%8D%AB%E4%B8%8E%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98)
- [国际化 i18n](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#%E5%9B%BD%E9%99%85%E5%8C%96-i18n)
- [axios 传参（params / data）](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#axios-%E4%BC%A0%E5%8F%82%EF%BC%88params-data%EF%BC%89)
- [Promise 与 async](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#promise-%E4%B8%8E-async)
- [表格勾选与跨页选择](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#%E8%A1%A8%E6%A0%BC%E5%8B%BE%E9%80%89%E4%B8%8E%E8%B7%A8%E9%A1%B5%E9%80%89%E6%8B%A9)
- [列表展示与行内编辑](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#%E5%88%97%E8%A1%A8%E5%B1%95%E7%A4%BA%E4%B8%8E%E8%A1%8C%E5%86%85%E7%BC%96%E8%BE%91)
- [表单、数字与校验](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#%E8%A1%A8%E5%8D%95%E3%80%81%E6%95%B0%E5%AD%97%E4%B8%8E%E6%A0%A1%E9%AA%8C)
- [导出、打印与下载](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#%E5%AF%BC%E5%87%BA%E3%80%81%E6%89%93%E5%8D%B0%E4%B8%8E%E4%B8%8B%E8%BD%BD)
- [uni-app / 小程序 / CRM](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#uni-app-%E5%B0%8F%E7%A8%8B%E5%BA%8F-crm)
- [业务模块备忘](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#%E4%B8%9A%E5%8A%A1%E6%A8%A1%E5%9D%97%E5%A4%87%E5%BF%98)
- [Git、地图与其它工具](file:///Users/aaron/Desktop/zambiaIP/%E9%A1%B9%E7%9B%AE-%E7%9F%A5%E8%AF%86%E5%BA%93-ghost.html#git%E3%80%81%E5%9C%B0%E5%9B%BE%E4%B8%8E%E5%85%B6%E5%AE%83%E5%B7%A5%E5%85%B7)

## Vue 组件封装与可见性

### 组件封装：.sync / visible / v-if

**问题：** 弹窗/抽屉子组件在父组件数据未就绪时提前初始化，导致 props 监听失效；关闭后可见状态与父组件不同步。

**原因：** 仅用父组件一个 `visible` 不够稳；子组件内部 Drawer 的 `update:visible` 需要回写父级；`data` 与 `computed` 不能同名，否则计算属性失效。

**做法：**

- 从 HTML 梳理功能所需数据/方法/子组件，写入 props；父组件不需要的删掉。
- 父传 `:dshow.sync="dshow"`，子内用内部变量接 `:visible.sync="detailShow"`，再 watch `dshow`/`detailShow` 双向同步。
- `.sync` 等价于 `:visible` + `@update:visible`。
- 或用 computed getter/setter 兼监听与回写。
- 两种稳妥模式：① `visible` + `v-if`（子组件不必自己控显隐）；② 双 `visible`（父属性名与子 props 名对齐）。本质都是「两个可见状态」：仅打开时才创建子组件，父数据就绪后再挂载。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847140-7be85776-0603-495c-9627-0a7ab86adbd6.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847094-ea6ce963-a64e-4105-9ad9-53d37f885082.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847133-00864cb3-ebb8-4ec1-8252-51bba77dc81a.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847124-61a5b7f0-83d8-4477-b71e-37ded19e41a9.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847954-a2ccc0a8-e572-4ccf-aa76-2416052bbdc5.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847714-e0bc35af-dc2c-4c19-b7a1-30a5bade42f4.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847762-9dd65096-3129-4c49-aa8e-da87a9ea8aa3.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847893-3c4968c9-2391-4f45-92e9-8c1b33730cc6.png)

### 父组件调用子组件函数

**问题：** 父组件需要直接调用子组件方法。

**做法：** 通过 `$refs` 拿到子实例后调用其方法（见截图）。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847153-01f94237-9916-4c3c-b735-66fafc916e09.png)

### mounted + watch 获取父组件数据

**问题：** 子组件既要处理首次打开/刷新时已有数据，也要处理后续动态点开详情时数据变化。

**原因：** 仅 `mounted` 或仅 `watch` 都会漏场景。

**做法：** `mounted` 处理首次已有数据；`watch` 处理动态变更。

### 嵌套与动态增减表单

**问题：**（备忘）嵌套表单与动态增减字段。

**说明：** 创建题目页与答题页这类场景会用到嵌套 + 动态增减。

**做法：** 按业务拆嵌套表单项，用数组驱动增删。

### v-for 遍历嵌套对象

**问题：** `v-for` 遍历数组里嵌套对象时字段取不到。

**做法：** `v-for="item in 数组"`，再用 `item.对象字段` 访问。

### el :value 与 v-model 类型一致

**问题：** `el-select` 想默认选中某 option，却显示成字符串 `"1"` 或选不中。

**原因：** option 的 `:value` 是 number，而 `v-model` 绑定成了 string，类型不一致。

**做法：** 默认值也用 number（如 `parseInt(this.$route.query.type)`），与 option value 类型对齐。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1767576909558-aeae5471-c03c-4ad2-910c-be4fd86a06b3.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1767577132502-ad5a0222-ec80-48a1-828e-f1e82d907d97.png)

### $modalForm 等自定义插件方法

**问题：**（备忘）项目里自定义弹窗/表单插件。

**说明：** 概念备忘。

**做法：** 使用 `$modalForm` 等挂在实例上的自定义插件方法；配合 `$refs` / `$nextTick` 做组件交互。

## 响应式与渲染更新

### 响应式原理与 render / watchEffect / $set

**问题：** 何时会触发重新运行？为何原始类型「响应式」会失效？

**原因：** 响应式依赖「对象形态的数据」+「函数运行期间读到了该数据」；原始类型在部分场景（如 VueUse 取 props）会失效。

**做法：**

- 用 render / watch（Vue2）/ watchEffect（Vue3）/ computed 监听响应式对象（ref、reactive）。
- render、watchEffect 一开始就会同步跑一遍。
- 给对象新增属性用 `$set`，否则视图不更新。

### $set 的使用

**问题：** 给对象/数组新增属性后视图不更新；或要把后端列表重组为「姓名→年龄」映射。

**原因：** Vue2 无法探测直接赋值的新属性；需 `$set(target, key, value)`。

**做法：**

- 新增：`this.$set(this.myInfo, 'age', 24)`，不要 `this.myInfo.age = 23`。
- 重组：遍历 info，`$set(this.newInfo, item.name, item.age)` 得到 name→age。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764906534168-665c66cc-b54e-4e23-882a-a3e694a42407.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764906867520-01a854a1-dc91-42ec-a433-6dff6ba1ceef.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764907064408-7920672c-42c7-4355-a227-3eb55402d6bc.png)

### 删除对象属性与 $forceUpdate

**问题：** 用 `delete` 删掉对象键后界面不刷新，又不想再请求接口。

**原因：** 直接 `delete this.tableDetail[no]` Vue 侦测不到。

**做法：** 用 `previousNumber` 记上次审批单号；`@change` 调 `setFinance`，对比当前 `currentAuthNumbers` 做增删；删除后调用 `$forceUpdate()` 强制重渲染。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851911-cb87c092-f557-4159-842d-6139061cf617.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851961-f144fed8-1b2f-4250-83a3-696c4e8be213.png)

### fee 对象重组与 Object.keys

**问题：** 返回数据是对象或数组，要把 id/fee_id/currency_id/money_input/remark 收进 fee，再随 dataForm 提交。

**原因：** 对象结构需按 key 下钻；数组可直接遍历；后端若不需要 fee 则不必收集。

**做法：**

- 对象：`Object.keys` 遍历，再 foreach 推入 feeItems。
- 数组：直接遍历。
- 不需要 fee：直接发 dataForm 的 money_input、remarkWriteoff。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849609-5a3880ea-56e3-46df-904e-7405c7e9fb30.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849666-223b070c-fe20-4f9c-9f6e-368f6c73586e.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1767780138888-fcf214ba-0353-4d78-8a85-c9e6bb39a1e3.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849954-c3c79cf8-ab17-4784-9353-173ec7e048e8.png)

### JS 对象间映射（fee_type）

**问题：** table 遍历 B，却要用 A 上的 fee_type（两边通过共同 no 关联）。

**原因：** 两对象字段分散，需要先建映射再查。

**做法：** 遍历 A 建 `feeTypeMap[no] = fee_type`，模板里 `{{ feeTypeMap[key] }}`。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849977-a660c0e3-1c5a-4fb0-9093-812cefa716f3.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850146-ff79df5b-0f6b-49d6-ae73-46378c623d9d.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850226-92ef7783-47ba-4aa8-a348-eda28d4dd99c.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850321-3852e93b-df65-4029-8a3c-1b4f8c182d50.png)

### 数组去重

**问题：** finance 列表里 uid 重复，需要唯一 uid 列表。

**做法：** `[...new Set(res.data.finance.map(item => item.uid))]`。

### Array.isArray 判断数组

**问题：** `typeof` 得到 `"object"`，分不清对象和数组。

**原因：** JS 里数组的 typeof 也是 `"object"`。

**做法：** 用 `Array.isArray(...)`。

### null / undefined 与 0 的比较

**问题：**（备忘）`null`/`undefined` 和 `0` 怎么比。

**说明：** 概念备忘。

**做法：** `null !== 0`、`undefined !== 0`、`null != 0`、`undefined != 0` 均为 true；`Number(undefined)` 是 NaN，`NaN !== 0` 也是 true。

### price_edit_open !== false

**问题：** 接口可能返回 true/false/undefined/null，开关默认该开还是关？

**原因：** 直接赋值会把 undefined/null 原样带下去；业务要「只有明确 false 才关」。

**做法：** `this.price_edit_open = res.data.price_edit_open !== false` → false 才为 false，其余（含未返回）为 true。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1772261153464-de791979-064f-45dd-8dcf-ec3d30039885.png)

### 浮点数相加精度 bug

**问题：** `123.08 + 1.1` 期望 124.18，截断后却得到 124.17。

**原因：** 0.08、0.1 二进制无限循环，IEEE754 只能存近似值，和为 `124.17999999999999`，截断变 124.17。

**做法：** ① 整数分/厘累加再除 100/1000；② decimal.js / big.js；③ 四舍五入。

### JS 默认参数

**问题：**（备忘）函数参数想有默认值。

**说明：** 概念备忘。

**做法：** `function test(a, b = 10)`：有传用传入值，没传用默认；打开详情可写 `test(1)` 不必 `test(1, 10)`。

### encodeURIComponent

**问题：**（备忘）URI 组件编码。

**说明：** 概念备忘。

**做法：** `encodeURIComponent(str)` 把非字母数字（除 `-_.!~*'()`）编成 `%` + 两位十六进制（UTF-8）。

### Bootstrap 栅格断点

**问题：**（备忘）多端栅格适配。

**说明：** 概念备忘。

**做法：** xs<576 / sm≥576 / md≥768 / lg≥992 / xl≥1200；用 `col` 的 `xs/sm/md/lg/xl` 列数（如大屏 8、小屏 24 整行）。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765246287610-74cb524b-5406-495b-aa07-1f122670b5b7.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765246323038-6d6af7dd-da17-4db5-8ca6-0f98f5c64341.png)

## 路由守卫与页面标题

### 路径参数与 Query 参数

**问题：** path 参数和 query 参数怎么写、有何区别。

**做法：** 路径参数写在 path 段；Query 用 `?key=`。见截图对比。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811847818-537b9bc9-d4bc-4dd6-af63-b6e2c4c36934.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811848394-ed61a744-2209-4ec0-b456-9d301085278a.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811848538-046db90f-0eba-47d2-a4ea-f26b249861f1.png)

### 路由标题：is_draft 与 beforeRouteEnter / Update

**问题：** 采购管理与草稿共用页、靠 `is_draft` 区分，但 meta 标题要不同。

**原因：** 只写 `beforeRouteUpdate` → 首次直达带 query 不触发；只写 `beforeRouteEnter` → 同组件内切参数不触发。

**做法：** 两个守卫都写：按 `to.query.is_draft === '1'` 设「采购计划-草稿」否则「采购计划管理」。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766139515353-23bcd59f-084e-4a70-b2a8-0fabf29ec6e2.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766139773708-4f675d11-6017-44ee-ac03-84e91f2aa825.png)

### 拆分新建 / 编辑项目路由

**问题：** 新建与编辑共用一个路由配置时，页签标题/权限混乱（如编辑却显示新建）。

**原因：** router 里只配了一条路由。

**做法：** 拆成 `newProject` 与 `editProject` 两条（可共用同一组件文件），各自 meta.title / auth。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1782459814322-2159d42a-269b-4a8a-b9d5-ccb2634c2e45.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1782459775528-ae431a4d-4846-43be-a25b-9fae0f1cadb8.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1782459673506-99e6ee9e-5131-47ef-b7ba-4cccae8d2dd6.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1782526426350-d25036f4-e98d-494f-9093-18ccd680faaf.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1782526456393-75329c68-bde0-4542-a459-7ef96de0780e.png)

### 客户 list_trade / list_clearance 路由

**问题：** 贸易客户与清关客户列表要分路由、分标题，组件可复用。

**做法：** 配 `list_trade`（`meta.is_trade: 1`）与 `list_clearance`（`is_trade: 2`），同组件 `ClientManage`，keepalive + 各自 title。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1782526539132-27b3de20-026c-4e50-bd6b-2195589f406e.png)

## 国际化 i18n

### 下拉选项按 locale 切换与 $t 占位符

**问题：** 接口返回中英文字段的下拉，要随当前语言切换；静态文案与带变量确认文案怎么翻。

**原因：** 选项 label 来自接口字段；静态文靠语言包；占位符名不能带空格。

**做法：**

- `const currentLang = this.$i18n.locale`，map 时 `label: currentLang === 'en' ? (name_en || name) : name`。
- 静态：`{{ $t('message....') }}`。
- 占位符：词条用 `{source}`/`{target}`（不能 `{ source }`），调用 `$t(key, { source, target })`。
- watch `$i18n.locale` 重新拉选项。`$i18n` 来自 `/src/i18n/index.js`。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765163436748-d1050393-dac8-4c0b-bd16-372ea51eb2e0.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765163466511-6ba8af4a-91b5-46f8-9b62-2fc6e6809265.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765163739095-f23befd1-f9cf-4a62-b8fe-f2e84c29e60c.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765953316532-15435e1f-feea-4b25-9c2e-0036493df224.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765953344743-ae826227-5a4b-4798-8d18-4ff2e65f1adc.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765163503027-ea2bfed1-df79-4bee-a97d-8ff393ba2c24.png)

### 项目中，中英语言切换实现：

[📎2026-09-14-default-locale-english-design.md](https://www.yuque.com/attachments/yuque/0/2026/markdown/57443523/1789703574039-89be7f9a-a157-42ac-bbb6-0512c530b6cb.markdown)

## axios 传参（params / data）

### params 与 data：数组传参

**问题：** 要把数组参数正确发给后端（尤其 PUT）。

**原因：** GET/部分场景 params 会序列化成 `ids[]=1&ids[]=2`；body 应用 data。

**做法：** PUT 等 body 用 `data` 而非 `params: data`。

### API 请求的五种参数格式

**问题：**（备忘）项目里常见的五种入参写法。

**说明：** 概念备忘。

**做法：** ① 多参数（多用于 GET）；② 对象 `{params, data, options}`；③ 请求体（POST/PUT，含简写）；④ 路径+对象混合；⑤ REST 路径参数。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811848331-76f4ddbd-de10-4426-b68e-80c495f83e6b.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811848451-cdffa40c-14d2-4e96-a3d1-08fc317993b8.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811848503-9b7e2342-31b6-4003-8fbf-fb31fa58d0f7.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811848859-78b46925-4db4-4100-87c4-685a5866549d.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849329-cb40c012-8d11-49cf-a05c-eb8e64e31e2c.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849021-b8d6c5cd-7815-4296-9221-f0e1005f9b35.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849005-a8a51883-7939-4c91-b894-282f5432f342.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849162-9b4abcf9-f7c9-4ba4-a107-ddb83456b098.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849434-d6696320-e3e1-4b28-8bfa-73d6503cbeb0.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811849566-f83d9b23-20c0-4099-8421-587fac809e43.png)

### 多选下拉数组序列化

**问题：** 多选提交出现 `industry_ids[]=…` 等非预期格式，后端解析失败或格式不对。

**原因：** `multiple` 使 v-model 成数组；若用 `params` 发送，axios 默认 PHP 风格 `industry_ids[]=13&industry_ids[]=14`。

**做法：**

- 需要字符串：调用前 `industry_ids: this.formData.industry_ids.join(',')`。
- 需要真正数组 JSON：改用 `data`（body）。
- 口诀：params=信封地址（筛选/分页）；data=信封内容（提交/复杂 JSON）。GET/DELETE 一般用 params；POST/PUT/PATCH 一般用 data。GET 用 data 常传不出去。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766716747180-728c09dd-56ff-484e-9634-088539a02f59.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766717154308-fa97a674-bbba-417f-8564-262ec272a231.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1768962946440-bab18262-8ff3-4c83-b651-4a3466424df4.png)

### 传参为 0 时勿用假值判断

**问题：** 接口合法值是 `0`，前端却丢成空。

**原因：** `0 || ''` 在 JS 里把 0 当假值。

**做法：** 显式判空：`this.source = (res.source !== null && res.source !== undefined) ? res.source : ''`。

### 接口封装与 axios 层

**问题：** API 要同时支持 `.then` 与 `async/await`。

**做法：** API 函数 `return request({...})` 返回 Promise；`request.js` 用 axios.create + 请求/响应拦截（token、status!==200 则 reject）。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765529018205-6e01b665-fb82-48a9-be51-fdced5e43e8a.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765529138207-0a28cd3c-450c-49b8-b589-e1ba4b42bffb.png)

## Promise 与 async

### Promise 链式 vs async/await

**问题：** Vue 里调接口用哪种写法。

**说明：** 两者本质都是 Promise；async/await 是语法糖，现代首选。

**做法：** `.then/.catch` 链式，或 `async` + `try/catch/finally`；接口必须返回 Promise。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765528404297-0557a03a-d22e-41fd-a54b-1f7245578d09.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765528431922-6a89c338-2ed3-4f5d-a820-b82323efffbb.png)

### Promise.all / race / allSettled

**问题：** 多请求并发时选哪个聚合 API。

**说明：**

- **all**：全成功才成功，一败俱败（快失败）；适合首屏缺一不可。
- **race**：谁先 settle 听谁；适合超时、多源竞速。
- **allSettled**：全结束再看各自 status；适合尽量多拿结果、统一关 loading。

**做法：** 订单详情+收支列表并发用 `allSettled`；初始化用户+权限+配置用 `all`；超时用 `race(fetch, timeout)`。注意 all 短路后其他请求仍在跑；allSettled 要判 `status` 再取 `value`。

### Promise 实用模版

**问题：**（备忘）常见并发/超时/降级/重试写法。

**说明：** 概念备忘。

**做法：**

1. 首屏 `Promise.all` + finally 关 loading。
2. 多区域 `allSettled` 按 status 分别赋值/警告。
3. `withTimeout` = `race(promise, timeoutPromise)`。
4. 主接口失败 try 兜底接口。
5. `retry(fn, times, delay)` 循环重试。
6. 当前场景：先开 loading，起两个 promise，`await allSettled`，再关 loading。 避坑：勿 `forEach(async)` 控串行；all 结果顺序=输入顺序；用 finally 或 allSettled 后统一关 loading；频繁刷新加「最后一次请求生效」。

## 表格勾选与跨页选择

### 分页勾选数据丢失与跨页回显

**问题：** 翻页后勾选丢失；或 ids 里还有、勾选框却空；下载/打印后需清空。

**原因：** 表格 DOM 随 dataList 重建，仅当前页 selection 不够；`$nextTick` 前 toggle 找不到新行；`reserve-selection` alone 仍有局限。

**做法：**

- 维护全局 `selectedRows` / `selectedIdsSet` + 提交用 `ids`。
- `@select` / `@select-all` → `handleSelectRow(selection)`：对当前页 ids，选中则加入集合、取消则移除，再 `ids = [...selectedIdsSet]`。
- `getList` 赋值后 `$nextTick` → `restoreSelection`：对当前页每行 `toggleRowSelection(row, true/false)`。
- 下载/打印成功后清空选择。
- Element Plus 的 `row-key` + `reserve-selection` 可作辅助，但仍建议手动集合 + 回显。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850567-19a58cdb-c8e1-4f6d-99ea-eb3619f7cf8e.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850513-be607cdd-1e52-4987-9e85-eef38c326174.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850746-d7e9aeeb-0840-4fdf-85c4-4872cf66ee20.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851047-e8a77ef2-ff61-495a-96c9-7d82f3344e2f.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850874-dfe36130-4692-4ef4-82ee-8378fd1308ef.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811850961-d55e86f5-69d3-412d-9b83-e47682024dd6.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851140-bb8495d0-c9b3-47ac-9229-2162a8461832.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851430-44df4404-c315-4c78-a45b-844d35b4fb0a.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851404-d4e3c28c-2273-43b3-805f-08dd1d2421bb.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851527-641fae79-e84c-4cda-84fb-7b81eac4a481.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851708-1373f40a-0910-4c03-a3d9-dbd328a691b4.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811851700-1c0c4aba-db3c-42a4-b180-47bda91cb962.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1768878084059-5c93a8c5-bdcc-4719-9a69-13c92bb29b73.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1770188282495-758a8429-15a5-46ef-96d6-b22a29a12e4e.png)

## 列表展示与行内编辑

### 列表 on-change 与 fastEdit 误触发

**问题：** 查询刷新时批量打 fastEdit；清空单元格时 fastEdit 打两次。

**原因：** getList 更新 v-model 触发 on-change；清空时 clear + v-model 同步各触发一次。

**做法：**

- `isLoadingData`：拉数前 true，双 `$nextTick` 后再 false；`updateProductField` 开头若 loading 则 return。
- 防抖：记录 `rowId_field_value` 时间戳，100ms 内重复跳过。
- 或 `@on-clear` → `handleClear` 传 `''`，`updateProductField` 对 `undefined` 直接 return。
- on-change 用事件参数：`(value) => updateProductField(row, field, value)`，勿依赖 `row.xxx` 时序。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766472263625-3965c9b6-3a33-4d25-b57f-60579810283f.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766472409545-96cda903-1664-40c6-bea3-7e08fc900cb9.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766472518798-4bd13dc5-3ee7-4404-b35b-c54281c63173.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766474224390-4e3986b4-b50c-4214-959e-66186bd32b55.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766474408759-47ada5b4-9a90-4b9d-942a-ec2e1ce2c1ce.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766475112590-b8599423-8624-415c-95e5-e8c27456df3d.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766475057472-5725c74a-640e-4884-8287-690f9504707e.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766475341912-917017f5-b559-4f1a-9c59-ebfdcb99c543.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766475423917-14e67fd4-840d-4a95-8641-e70d28bb4ce8.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766477539998-0355f9d6-edff-496f-9de0-8becb7ad34fa.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766477564509-389f77a4-7775-4a28-9406-cf274aea738e.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766477796792-aebcd897-6c79-4914-9b6d-a85ed78af898.png)

### 关闭弹窗后再刷新列表

**问题：** 操作成功后立刻开列表仍是旧数据，再开才是新数据。

**做法：** 成功回调里先关弹窗（`formShow = false`），再 `getList()`。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1766567605884-b69ca1bd-49f2-48c1-8cb7-ef5f7e553b13.png)

### el-table :data 必须是数组

**问题：** `:data` 绑对象时报错/不渲染。

**原因：** el-table 的 data 只接受数组。

**做法：** `tableDetail` 为对象时 `v-for="(value, key)"` 且 `:data="value"`（value 已是数组）；为数组时 `:data="[item]"`。

### iview Table render 可编辑单元格

**问题：** iview 表格列要可编辑输入。

**做法：** columns 的 `render(h, params)` 返回 `h('Input', { props, on: { 'on-change': e => formData.contacts[params.index].name = e.target.value } })`；`params.row/index/column` 可用。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1767599821919-586c2036-7912-4b03-bb7f-0c50752eacb6.png)

### 列表最后一行单独样式

**问题：** 只要最后一行特殊样式。

**做法：** 模板三元 + JS 函数返回布尔，决定是否加 class。

### 操作后更新行状态

**问题：** 行操作成功后要改该行状态，不必整表重拉。

**做法：** 在成功回调里直接改当前行字段（见截图）。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852907-1efb45fd-4ba1-4e84-82e1-3710edacc506.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852993-ba40c765-7d7b-4c69-af5b-bf781ef98869.png)

### 状态字段映射

**问题：** 后端 status 为 0/1/-1/100，要显示文案和颜色。

**做法：** `getStatusText` / `getStatusColor` 用 map；模板里 Tag 绑定二者。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1768985571294-30dbe496-a2c1-4348-b217-9fd4ef16bc43.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1768985603894-d2feb87d-1f40-4e99-9fa0-2db300a366c6.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1768986017869-4cd0a897-a8bd-4f0f-aa12-6408d724c2f6.png)

### id→name 供应商映射（iview + element）

**问题：** 行里只有 supplier_id，要显示 fullName，且数据量大不能手写 statusMap。

**做法：** 拉供应商列表建 `supplierMap[id]=fullName`。 - iview：`render` 里 `h('span', this.supplierMap[params.row.supplier_id])`。 - element：`formatter` / 作用域插槽 / computed 预处理加 `supplier_name`。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769672211126-61a9c51a-7f14-4760-aeaa-17523d1bdba3.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769741610497-06200add-fceb-480d-99e8-897cdfedbd0b.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769741974232-2300b868-8603-40e2-b5e2-89c286d98710.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769742025003-ba5ff05b-b15a-4181-8710-1bc199634d27.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769742073493-641ad975-0b39-4abd-9faa-fc8adbb9119b.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769743121655-57c700b5-d13c-4723-8953-2409df055249.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769743107806-4bb0b6ac-c611-483b-a2f1-f44e534a213d.png)

### iview Select 宽度与 filterable

**问题：** 未开搜索时选框可随 label 自适应，开 `filterable` 后宽度不再自适应。

**说明：** 组件行为备忘。

**做法：** 需要固定/百分宽时手动设 `style="width:…"`；知悉 filterable 会关掉自适应。

### 欠款报表：动态列与多级表头

**问题：**（备忘）欠款报表要动态列 + 多级表头。

**说明：** 源笔记仅有主题名，无具体实现细节。

**做法：** 按业务配置动态 columns / 多级表头（待补实现笔记）。

## 表单、数字与校验

### 下拉框「不限」与 null

**问题：** 「不限」用空字符串时，初始化若也设 `''`，占位符不生效且默认像已选不限；接口选项会覆盖手写「不限」。

**原因：** 空串与「不限」option value 冲突；直接赋值数组会冲掉前置不限项。

**做法：** 初始用 `null` 让 placeholder 生效；请求前把 null 滤掉；接口选项用中间变量拼 `[不限, ...res]` 再赋给 options。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852012-33289e97-0de9-47c6-8671-697e5ae909c3.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852223-c911e033-684d-437f-8874-5820ee6908f1.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852251-86c34e1a-918c-43f9-a4c0-6629ad5b93bc.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852472-2a746e28-388f-4549-8420-39f2841d3658.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852444-44a43247-c279-474e-a0ff-2804a717c0c0.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852564-7bbcb42d-1067-4201-b7b0-416e9cae072d.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1764811852785-99e51fd6-5724-471d-a891-f0039ce54d1a.png)

### 千位分隔符与 toLocaleString

**问题：**（备忘）金额千分位、百分比、货币、位数、时间格式化。

**说明：** 概念备忘。

**做法：** 正则 `toFixed(2)` 后整数部 `replace(/\B(?=(\d{3})+(?!\d))/g, ',')`；或 `num.toLocaleString()` / 带 `style:'percent'|'currency'`、最小最大小数位、日期 `toLocaleString`。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765180458541-45f6aa3c-231c-4de6-b31d-3440a9311cf0.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765180493809-38cc8522-fe56-40c8-ad7b-291eb8fed1a3.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769590566499-75c5b02e-f23e-4c23-8f1a-69072f5fe670.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769590608241-28751a00-8371-4f1f-b7fd-bd060c72a418.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769590637095-a9a13177-5fca-4b9b-9991-da2fb2730eda.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769590667560-c1fbc996-06e4-40cd-af78-8355db371582.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769590726137-c9b08715-dfd3-4d33-9fba-0df5c4f12f40.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769590755025-e8b35edc-b229-4315-a424-670badbc2d1f.png)

### 表单验证 trigger 与 number 类型

**问题：** 输入数字后校验失败且提示为空；不知用 blur 还是 change。

**原因：** 默认 rule type 是 string；number 值类型不匹配。

**做法：** Input 用 `trigger:'blur'`；Select/Date/Checkbox/Radio 用 `change`；数值字段加 `type:'number'`。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765262387068-d7665747-6cd3-4fd0-87b4-9d3806a50af3.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1767522407037-7cab574a-5e23-4316-9441-c4e0d8f55330.png)

### Select 严格相等 === 类型匹配

**问题：** Select 有值却显示不出选中项。

**原因：** 用 `===` 匹配，`"1" !== 1`。

**做法：** option 数组元素类型与 v-model 一致；后端是数字则用数字/`parseInt`，初始别用 `''` 而用 `0`（若业务允许）。

### validator.js 与 props validator

**问题：**（备忘）邮箱/手机/URL 校验，以及限制 prop 枚举。

**说明：** 概念备忘。

**做法：** 第三方 `validator.isEmail/isMobilePhone/isURL`；props 里 `validator: v => ['trade','order','commission'].includes(v)`（Vue 内置，非同一库）。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1770111377780-ddffb11b-589b-484e-abfb-f43ab55f08d8.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1770111458174-d30813ad-4da4-4f4b-84f5-c91c8d1b6be2.png)

## 导出、打印与下载

### 打印弹窗：先 window.open 空白页

**问题：** 异步拿到打印 URL 后再 `window.open`，被浏览器当弹窗拦截。

**原因：** 非用户手势同步上下文打开窗口易被拦。

**做法：** 点击时立刻 `printWindow = window.open('', '_blank')`；拦截则提示；成功后 `printWindow.location.href = res.data.url`；失败/`!url` 则 `close()` 并报错。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1778308467812-01f54f0a-916a-46c7-92a2-e6b8e2df1063.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1778308507568-8fa4cd20-d026-4df6-9b5c-6a012eab5200.png)

### 打印与导出方法

**问题：** 打印/导出文件怎么触发下载。

**做法：**

- 打印：`window.open(res.data.url)`（或空白页方案）。
- 导出：① 后端返回 URL → `location.href`；② `<a download>`；③ `window.open`；④ Blob + `URL.createObjectURL` + a.click + revoke（适合文件流）。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769066561975-a2fb83aa-d722-4b19-a8b8-dade171fa217.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769066601960-01935c6e-06b7-43f1-a3ba-fc6a9ed8c015.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769066827579-bb999a39-55ff-4393-ad00-ee0f99e473d5.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769067161863-b0f32cb6-ae59-4135-97a6-8120eaea9617.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769067190337-70b5b529-daa6-4ce9-b00b-d2d59928bf37.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769067240625-a25e2da0-85a9-4125-9cff-197a2a36914e.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769067304041-662a877f-5987-4f24-9775-fa30236cdeea.png)

### 打印 / 导出 icon

**问题：**（备忘）按钮图标。

**做法：** `el-icon-printer` / `el-icon-download`。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1775614977869-0f9fa869-94d1-42a2-bd23-67ff7ca27bef.png)

## uni-app / 小程序 / CRM

### getSystemInfoSync

**问题：**（备忘）取状态栏高度、屏幕、平台等。

**做法：** `uni.getSystemInfoSync()`，Android/iOS/H5 返回字段不同（如 statusBarHeight、platform）。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1767004247932-d782e899-3e64-46d1-9558-ac140007a51b.png)

### image aspectFill / widthFix

**问题：**（备忘）小程序 image mode 怎么选。

**说明：** 缩放/裁剪共 13 种；常用 aspectFill（短边填满可裁切）、widthFix（宽固定高自适应）等。

**做法：** 按展示需求选 mode（见表截图）。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1768621520574-14a04e5c-77f8-4cdf-bdcd-4f8364921930.png)

### swiper iOS 高度塌陷

**问题：** iOS 上 swiper 默认高 150px，图片上半被裁。

**原因：** iOS 默认高度；`#ifdef APP-IOS` 打包后可能不生效。

**做法：** 用 `getSystemInfoSync().platform === 'ios'` 动态算高度/marginTop（可参考 statusBarHeight\*2+110）。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1769397076127-3e88c085-a175-4fe2-9348-2661ab96c3df.png)

### safeAreaInsetBottom

**问题：** iOS 弹窗底部多一块空白。

**原因：** u-popup `safeAreaInsetBottom` 默认为 true，预留底部安全区。

**做法：** 不需要留白时设 `false`；需要防手势条遮挡则保持 true。

### Token：Vuex + 本地存储

**问题：** 重启 App 丢失登录态；登录页重复进。

**做法：**

1. 登录成功 mutation：写 Vuex + `uni.setStorageSync`。
2. `onLaunch`：`getToken()` 有则 commit 恢复。
3. 登录页 `onLoad`：本地已有 token 则 `reLaunch` 首页。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1776913580363-139d972e-c135-469e-9c10-2ac823effdaf.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1776913620575-5e0008aa-2af0-4634-8974-f00aae7fd66c.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1776913945133-15a3da9a-e6be-4f6a-999b-46eb06eee854.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1776914088927-53e16020-d3e5-427e-9721-05efbaf74724.png)![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1776914105601-9c43cd2e-673c-4f77-b20c-2a74dda4336b.png)

### 懒加载方案

**问题：** 是否等全部图加载完再揭开整页。

**原因：** 整页等齐拖垮 TTFB、浪费流量，不适合信息流。

**做法：** 骨架/固定槽位 → 接口先渲染文案 → 列表 `lazy-load` → 可选仅预加载 Banner/分类图标。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1786345323692-010d2311-0e1f-4eaf-9f0a-d7e8311a52c1.png)

### Google Play 照片选择器与 excludePermissions

**问题：** 上架被拒：不能靠宽泛媒体权限/`uni.chooseImage` 扫相册。

**原因：** Play 政策要求系统照片选择器，target 高版本勿申请 READ_MEDIA_\*（除非核心功能无法替代）。

**做法：** 优先 `uni.chooseMedia` 或 Photo Picker 插件；manifest 加 Camera 模块；`excludePermissions` 排除 READ_MEDIA_IMAGES/VIDEO 等；注意 abiFilters、min/targetSdk。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1784701094182-17df12ff-b928-4241-8ac7-dff8bf614228.png)

## 业务模块备忘

### 核销 → 审批 → 任务 → 收支

**问题：**（备忘）核销业务链路怎么点进去。

**说明：** 领域路径备忘。

**做法：** 核销管理 → 审批单号 → 任务单号 → 任务详情 → 收支费用 → 收支详情。

### Spring Boot 连接数据库

**问题：** 如何用 application.yml 连库，表从无到有。

**做法：** pom 加驱动/连接池 → yml 配 URL/用户/密码 → 建表可用 JPA ddl、SQL 脚本、Flyway/Liquibase；库本身通常需先手动创建（Boot 默认不建库，除非额外配置）。

## Git、地图与其它工具

### git stash → pull → stash pop

**问题：** 有本地未提交改动时 pull 失败/怕被覆盖。

**做法：** `git stash` → `git pull`（可用 `--rebase`）→ 冲突则处理并 `rebase --continue` → `git stash pop`。![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765963583607-14d0eea0-04d7-4b34-bb58-3a191aa6d6fc.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765963597896-2868d9a9-b33e-4485-ba0e-18344518e776.png)![](https://cdn.nlark.com/yuque/0/2025/png/57443523/1765963607379-076cf395-859e-4cbd-87e5-c766382496b7.png)

### Cursor 生成提交信息

**问题：**（备忘）用 AI 根据 diff 生成 commit message。

**做法：** 使用「生成提交信息」/`@diff of working state` 从当前差异生成。![](https://cdn.nlark.com/yuque/0/2026/png/57443523/1787710622003-67e3ab47-539c-4a48-a192-928b929b4394.png)

### API key 保护

**问题：** 密钥怎么存放才相对安全。

**做法：** 私密仓可写 config + 控制台限制；公开仓用 `.env.*`（示例用 `.env.example`）+ 限制；或接口下发 key；或 Vault。

### Google 地图 API

**问题：**（备忘）地图相关 API 分工。

**做法：** Static（静态图）、Maps JavaScript（动态）、Places（搜索提示）、Geocoding（经纬度↔地址）。

### 防止浏览器缓存

**问题：** 页面/资源被旧缓存卡住。

**做法：** HTML meta 禁缓存；URL 加时间戳；服务端 Cache-Control 等响应头。

### useRouter / useRoute / openAPI / byteMD

**问题：**（备忘）零散工具名。

**说明：** 源笔记一句话备忘，无展开。

**做法：** `useRouter` 跳转；`useRoute` 读当前路由；openAPI 按接口文档生成请求；byteMD 作 Markdown 相关能力。
