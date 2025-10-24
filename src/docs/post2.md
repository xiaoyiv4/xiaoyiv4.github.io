---
title: JavaScript 编程基础
date: 
lastmod: 
tags: ["JavaScript", "编程", "基础"]
description: JavaScript 编程基础
cover: /images/default-cover.png
---
1. JavaScript 简介
JavaScript 是一种广泛使用的编程语言，主要用于实现网页的动态功能。
1. 基本语法
以下是 JavaScript 的一些基本语法示例：
2.1 变量
使用 `var`、`let` 或 `const` 声明变量：
```javascript
let message = "Hello, World!";
const number = 42;
```
2.2 数据类型
JavaScript 支持多种数据类型，包括字符串、数字、布尔值等：
```javascript
let str = "字符串";
let num = 123;
let bool = true;
```
2.3 条件语句
使用 `if`、`else if` 和 `else` 进行条件判断：
```javascript
if (num > 0) {
  console.log("正数");
} else if (num < 0) {
  console.log("负数");
} else {
  console.log("零");
}
```
2.4 循环
使用 `for` 和 `while` 循环：
```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}

let j = 0;
while (j < 5) {
  console.log(j);
  j++;
}
```
2.5 函数
定义和调用函数：
```javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Alice"));
```
3. 对象
JavaScript 中的对象是键值对的集合：
```javascript
let person = {
  name: "Bob",
  age: 30,
  sayHello: function() {
    console.log("Hello, my name is " + this.name);
  }
};

person.sayHello();
```
4. 数组 
数组用于存储多个值：
```javascript
let fruits = ["苹果", "香蕉", "橙子"];
console.log(fruits[0]); // 输出 "苹果"

fruits.push("葡萄");
console.log(fruits); // 输出 ["苹果", "香蕉", "橙子", "葡萄"]
```
5. DOM 操作
通过 JavaScript 操作网页的 DOM 元素：
```javascript
let header = document.getElementById("header");
header.style.color = "blue";

let newElement = document.createElement("p");
newElement.textContent = "这是一个新的段落";
document.body.appendChild(newElement);
```
