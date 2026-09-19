---
title: "Vue 组件封装与可见性"
date: 2026-09-19
slug: vue-component-visibility
tags:
  - vue
  - frontend
draft: false
---

从《项目知识库》迁出的首篇样例（Phase A）。语雀 CDN 配图未迁入仓库，避免已知热链 403；正文可独立阅读。

## 组件封装：.sync / visible / v-if

**问题：** 弹窗/抽屉子组件在父组件数据未就绪时提前初始化，导致 props 监听失效；关闭后可见状态与父组件不同步。

**原因：** 仅用父组件一个 `visible` 不够稳；子组件内部 Drawer 的 `update:visible` 需要回写父级；`data` 与 `computed` 不能同名，否则计算属性失效。

**做法：**

- 从 HTML 梳理功能所需数据/方法/子组件，写入 props；父组件不需要的删掉。
- 父传 `:dshow.sync="dshow"`，子内用内部变量接 `:visible.sync="detailShow"`，再 watch `dshow`/`detailShow` 双向同步。
- `.sync` 等价于 `:visible` + `@update:visible`。
- 或用 computed getter/setter 兼监听与回写。
- 两种稳妥模式：① `visible` + `v-if`（子组件不必自己控显隐）；② 双 `visible`（父属性名与子 props 名对齐）。本质都是「两个可见状态」：仅打开时才创建子组件，父数据就绪后再挂载。

## 父组件调用子组件函数

**问题：** 父组件需要直接调用子组件方法。

**做法：** 通过 `$refs` 拿到子实例后调用其方法。

## mounted + watch 获取父组件数据

**问题：** 子组件既要处理首次打开/刷新时已有数据，也要处理后续动态点开详情时数据变化。

**原因：** 仅 `mounted` 或仅 `watch` 都会漏场景。

**做法：** `mounted` 处理首次已有数据；`watch` 处理动态变更。

## el :value 与 v-model 类型一致

**问题：** `el-select` 想默认选中某 option，却显示成字符串 `"1"` 或选不中。

**原因：** option 的 `:value` 是 number，而 `v-model` 绑定成了 string，类型不一致。

**做法：** 默认值也用 number（如 `parseInt(this.$route.query.type)`），与 option value 类型对齐。
