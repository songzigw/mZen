# mZen
移动手机端CSS组件库

## 概序
mZen为移动手机端，网页界面快熟开发而定义的一套CSS库，网页布局采用容器+布局结构+控件的嵌套形式，遵循Google Material 设计规范。

### 页面模版
＊ HTML5文档类型

＊ 更好手机端体验

基于以上两点，每个页面参照如下格式设置：

``` html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0" />
</head>
  ......
</html>
```

### 跨浏览器

在每一种浏览器上有一致的表现形式

## 核心样式
* 布局容器

.mzen 顶级容器，使用该套样式库需要引入的最外层容器，不可以嵌套使用

.m-container 可以嵌套使用

.m-container-padded 可以嵌套使用

* 栅格系统

栅格系统采用12等分布局

.m-grid-row 定义一行

.m-grid-col-xs-* 定义一列，“ * ”标示这一列占用这一行多少等分

## 组件库
