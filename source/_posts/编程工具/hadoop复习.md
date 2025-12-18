---
title: hadoop
date: 2025-11-16 14:39:50
tags: hadoop
categories: 编程工具
---
# hive

## 命令的三种执行方式

1.进入hive终端
2.不进入终端，hive-e ‘hql命令’适合短命令的执行
3.不进入终端，hive-f *.hql，命令放在hql文件中，适合复杂的命令执行。

## 数据库的操作

1.创建数据库：
>create database [if not exists] dbname;
2.显示数据库
>show database[like "*"]
3.查看数据库信息
>desc database [extended] dbname
4.切换数据库
>use database
5.删除数据库
>drop database dbname

## 表操作

1.建表
>create table tbname(
    属性 类型，
)row format delimited fields teminated by '\t';

>create table tbnamel like tbname;//以tbname表为模板建立表

>create table tbnamel as select * from tbname;已查询结果建表。

2.查看表及结构
>查看当前数据库所有表
show tables;
>查看表结构
describe tbname;
describe formatted tbname;
3.修改表结构
>alter table tbname rename to tbnamel;
4.删除表格
>drop table tbname;
5.导入数据
>load data local inpath '' overwrite into table tbnaem;导入本地数据。
>load data inpath '' overwrite into table tbname;从hdfs中导入。
6.导出数据
>insert overwrite local  directory ''
row format delimeted field teminated by '\t'
select 属性 from dbname;

>insert overwrite directory ''
row format delimited fields teminated by '\t'
select 属性 from dbname;

## 查询

1.查询表中所有数据
>select * from tbname;
2.查询某个属性
>select 属性 from tbname;
3.显示前三条
>select 属性 from tbname limit 3;
4.带条件查询
>select * form tbname where ;

## 举例
建立外部表

```hive
create external table if not exists stu_pratition(
    name string,
    phone string)
partitioned by(class int)
row format delimeted fields teminated by '\t';

```

查看分区表结构
```hive
desc formated dbname.tbname;
```

查看分区表中有多少分区
```hive
show partitions dbname.tbname;
```

创建单个分区
```hive
alter table tbname add partition(class_number='3')
```

创建多个分区
```hive
alter table tbname add partition (class_number='4') (class_number='5');
```

删除分区
```hive
alter table tbname dope partition (class_number='3')
```

删除多个分区
```hive
alter table tbname dope partition(class_number='3'),partition(class_number='4')
```

创建二级分区表
```hive
create external table if not exists stu_partition(
    name string,
    no int)
    partitioned by(class_number int,phone_type string)
    row format delimeted fields teminated by '-';
```



# 第一章 hadoop技术概述

大数据的核心技术：分布式存储：hdfs，Hbase，nosql，newsql
    分布式处理：MapReduce

hadoop:最主要的是HDFS、MapReduce和YARN。HDFS负责大数据的存储、MapReduce负责大数据的计算、YARN负责集群资源的调度。

hadoop起源于三篇论文；《The Google File System 》 2003年
    《 MapReduce: Simplified Data Processing on Large Clusters》 2004年
    《Bigtable: A Distributed Storage System for Structured Data》 2006年

hadoop优势：方便：可以运行在一般商业服务器构成的大型集群上
    弹性：可以通过增加节点方式来线性地扩展集群规模
    健壮：可以从容处理通用计算平台上出现硬件失效的情况
    简单：Hadoop允许用户快速编写出高效的分布式计算程序

hadoop应用领域：电子商务，移动数据，在线旅游，诈骗检测，医疗保健，能源开采

云计算特点：按需提供服务；宽带网络访问；资源池化；高可伸缩性；可量化服务；大规模；服务非常廉价；

云计算包含三个模式：iaas，paas，saas

spark是基于内存计算的大数据并行计算框架。

spark特点：运行速度快，易用性，支持复杂查询，实时的流处理，容错性。

传统关系型数据库RDBMS是指对应于一个关系模型的所有关系的集合。

RDMS特点：容易理解；使用方便；易于维护；支持sql；

# 第二章 hdfs

hdfs优点：高容错性：数据自动保存多个副本
    适合大数据处理：能够处理GB、TB、甚至PB级别的数据规模
    流式文件访问：HDFS能保证数据的简单一致性
    可构建在廉价的机器上：HDFS 提供了容错和恢复机制

hdfs缺点：不适合低延时数据访问：HDFS更适合高吞吐率的场景，就是在某一时间内写入大量的数据。
    不适合大量小文件的存储：这些小文件的元数据信息会占用NameNode大量的内存空间
    不适合并发写入、文件随机修改：不支持文件的随机修改。

# 第三章 yarn

# 第四章 MapReduce

mapreduce思想:分而治之，把一个复杂的问题，按照一定的分解方法分为等价的规模较小的若干部分，然后逐个解决，分别找出各部分的结果。然后把各部分的结果组成整个问题的最终结果。它是个分布式计算框架

map:对一组数据元素进行某种重复式的处理。（拆分阶段）

reduce：对map的中间结果进行某种进一步的结果整理（合并阶段）

mapreduce进程有三类：MRAppMaster，MapTask，ReduceTask。

一个mapreduce编程中只能包含一个map阶段和一个reduce阶段。

mapreduce程序中，数据都是以ky键值成对出现。

MapReduce的优点：易于编程：开发者仅需关注Map/Reduce 函数，无需处理分布式通信、数据分片等复杂细节；
良好的扩展性：支持横向扩展，通过增加集群节点即可提升处理能力，适配 PB 级海量数据；
高容错性：框架对节点故障、任务失败自动容错，无需人工干预；
适合PB级以上数据集的离线处理

MapReduce缺点不适合实时计算；不适合流式计算；不适合DAG计算

# 第七章 hive

Hive的优点
Hive适合数据的批处理，解决了传统关系型数据库在海量数据处理上的瓶颈。
Hive构建在Hadoop之上，充分利用了集群的存储资源、计算资源。
Hive学习使用成本低，支持标准的SQL语法，这样就免去了编写MapReduce程序的过程，减少了开发成本。
具有良好的扩展性，且能够实现与其他组件的集成开发。

Hive的缺点
HQL的表达能力依然有限，不支持迭代计算，有些复杂的运算用 HQL不易表达，还需要单独编写MapReduce来实现。
Hive的运行效率低、延迟高，这是因为Hive底层计算引擎默认为MapReduce，而MapReduce是离线计算框架。
Hive的调优比较困难，由于HQL语句最终会转换为MapReduce任务，所以Hive的调优还需要考虑MapReduce层面的优化。

Hive与Hadoop之间的关系总结如下。
Hive需要构建在Hadoop集群之上。
Hive中的所有数据都存储在Hadoop分布式文件系统中。
对HQL查询语句的解释、优化、生成查询计划等过程均是由 Hive 完成的，而查询计划被转化为 MapReduce 任务之后需要运行在 Hadoop 集群之上。

Hive的原理
Hive 是一种构建在Hadoop之上的数据仓库工具，可以使用HQL 语句对数据进行分析和查询，而Hive 的底层数据都存储在HDFS中。Hive 在加载数据过程中不会对数据进行任何的修改，只是将数据移动到指定的HDFS目录下，因此，Hive 不支持对数据的修改。

Hive的特点
支持索引，加快数据查询。
不同的存储类型，例如，纯文本文件、HBase 中的文件。
将元数据保存在关系数据库中，大大减少了在查询过程中执行语义检查的时间。
可以直接使用存储在Hadoop 文件系统中的数据。
内置大量用户自定义函数(user define function，简称UDF)来对时间、字符串进行操作，支持用户扩展UDF 函数来完成内置函数无法实现的操作。
HQL语句最终会被转换为MapReduce任务运行在Hadoop集群之上。

# 第八章 Hbase

HBase是一个高可靠、高性能、面向列、可伸缩的分布式数据库

特点：容量巨大：单表可以有百亿行、数百万列。

    无模式：同一个表的不同行可以有截然不同的列。

    面向列：HBase是面向列的存储和权限控制，并支持列独立索引。

    稀疏性：表可以设计得非常稀疏，值为空的列并不占用存储空间。

    扩展性：HBase底层文件存储依赖HDFS，它天生具备可扩展性。

    高可靠性：HBase提供了预写日志(WAL)和副本(Replication)机制，防止数据丢失。

    高性能：底层的LSM（Log-Structured Merge Tree）数据结构和RowKey有序排列等架构上的独特设计，使得HBase具备非常高的写入性能。
