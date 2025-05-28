---
title: git的基本命令
date: 2025-05-20 12:39:50
tags: git
categories: 编程工具
---
>config：参数是用来配置git环境的
--global：长命令表示配置整个git环境

用户名配置
```
git config --global user.name "你的用户名"
```

邮箱配置
```
git config --global user.email "你的邮箱"
```

创建本地空仓库
init：初始化当前目录为仓库，初始化后会自动将当前仓库设置为master/main
```
git init
```

新建文件添加到本地仓库
add：将文件添加到缓存区
commit：提交到本地仓库
```
git add
git commit -m ""
```
git commit会生成一个40位的哈希值，作为版本id

改写提交