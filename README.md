<div align="center">
<img alt="logo" height="120" src="./public/favicon.png" width="120"/>
<h2>今日热榜</h2>
<p>一个聚合热门数据的 API 接口</p>
</div>

## 示例

> 这里是使用该 API 的示例站点

- [今日热榜 - https://hot.imsyy.top/](https://hot.imsyy.top/)

## 总览

> 🟢 状态正常
> 🟠 可能失效
> 🔴 无法使用

| **站点**     | **类别** | **调用名称** | **状态** |
| ------------ | -------- | ------------ | -------- |
| 哔哩哔哩     | 热门榜   | bilibili     | 🟢       |
| 知乎         | 热榜     | zhihu        | 🟢       |
| 百度         | 热搜榜   | baidu        | 🟢       |
| 百度贴吧     | 热议榜   | tieba        | 🟢       |
| 少数派       | 热榜     | sspai        | 🟢       |
| IT 之家      | 热榜     | ithome       | 🟠       |
| 澎湃新闻     | 热榜     | thepaper     | 🟢       |
| 今日头条     | 热榜     | toutiao      | 🟢       |
| 微博热搜     | 热搜榜   | weibo        | 🟢       |
| 36 氪        | 热榜     | 36kr         | 🟢       |
| 稀土掘金     | 热榜     | juejin       | 🟢       |
| 腾讯新闻     | 热点榜   | newsqq       | 🟢       |
| 抖音热榜     | 热点榜   | douyin       | 🟢       |
| 英雄联盟     | 更新公告 | lol          | 🟢       |
| 微信读书     | 飙升榜   | weread       | 🟢       |
| 历史上的今天 | 指定日期 | calendar     | 🟢       |

### 特殊接口说明

#### 获取全部接口信息

获取除了下方特殊接口外的全部接口列表

```http
GET https://{example.com}/all
```

#### 历史上的今天（指定日期）

将指定的月份和日期传入即可得到当天数据，请注意格式

```http
GET https://{example.com}/calendar/date?month=06&day=01
```

## 部署

```js
// 安装依赖
pnpm install

// 运行
pnpm start
```

## Vercel 部署

现已支持 Vercel 部署，无需服务器

### 操作方法

1. fork 本项目
2. 在 `Vercel` 官网点击 `New Project`
3. 点击 `Import Git Repository` 并选择你 fork 的此项目并点击 `import`
4. `PROJECT NAME`自己填，`FRAMEWORK PRESET` 选 `Other` 然后直接点 `Deploy` 接着等部署完成即可

## 调用

### 获取榜单数据

> 获取数据只需在域名后面加上上方列表中的调用名称即可

```http
GET https://api-hot.imsyy.top/bilibili/
```

<details>
<summary>调用示例</summary>

```json
{
    "code": 200,
    "message": "获取成功",
    "title": "哔哩哔哩", // 榜单名称
    "subtitle": "热门榜", // 榜单类别
    "from": "server", // 此处返回是最新数据还是缓存
    "total": 100, // 数据总数
    "updateTime": "2023-03-14T07:40:51.846Z", // 数据获取时间
    "data": [
        {
            "id": "BV1E84y1A7z2",
            "title": "假如我的校园是一款RPG游戏！",
            "desc": "所有取景都是在学校里面拍的，都是真实存在的场景哦！",
            "pic": "http://i2.hdslb.com/bfs/archive/a24e442d0aae6d488db023c4ddcb450e9f2bf5f3.jpg",
            "owner": {
                "mid": 424658638,
                "name": "四夕小田木_已黑化_",
                "face": "https://i1.hdslb.com/bfs/face/afd9ba47933edc4842ccbeba2891a25465d1cf77.jpg"
            },
            "data": {
                "aid": 610872610,
                "view": 4178745,
                "danmaku": 4229,
                "reply": 5317,
                "favorite": 91020,
                "coin": 133596,
                "share": 46227,
                "now_rank": 0,
                "his_rank": 1,
                "like": 616519,
                "dislike": 0,
                "vt": 0,
                "vv": 0
            },
            "url": "https://b23.tv/BV1E84y1A7z2",
            "mobileUrl": "https://m.bilibili.com/video/BV1E84y1A7z2"
        },
        ...
    ]
}
```

</details>

### 获取榜单最新数据

> 获取最新数据只需在原链接后面加上 `/new`，这样就会直接从服务端拉取最新数据，不会从本地缓存中读取

```http
GET https://api-hot.imsyy.top/bilibili/new
```

<details>
<summary>调用示例</summary>

```json
{
    "code": 200,
    "message": "获取成功",
    "title": "哔哩哔哩", // 榜单名称
    "subtitle": "热门榜", // 榜单类别
    "total": 100, // 数据总数
    "updateTime": "2023-03-14T07:40:51.846Z", // 数据获取时间
    "data": [
        {
            "id": "BV1E84y1A7z2",
            "title": "假如我的校园是一款RPG游戏！",
            "desc": "所有取景都是在学校里面拍的，都是真实存在的场景哦！",
            "pic": "http://i2.hdslb.com/bfs/archive/a24e442d0aae6d488db023c4ddcb450e9f2bf5f3.jpg",
            "owner": {
                "mid": 424658638,
                "name": "四夕小田木_已黑化_",
                "face": "https://i1.hdslb.com/bfs/face/afd9ba47933edc4842ccbeba2891a25465d1cf77.jpg"
            },
            "data": {
                "aid": 610872610,
                "view": 4178745,
                "danmaku": 4229,
                "reply": 5317,
                "favorite": 91020,
                "coin": 133596,
                "share": 46227,
                "now_rank": 0,
                "his_rank": 1,
                "like": 616519,
                "dislike": 0,
                "vt": 0,
                "vv": 0
            },
            "url": "https://b23.tv/BV1E84y1A7z2",
            "mobileUrl": "https://m.bilibili.com/video/BV1E84y1A7z2"
        },
        ...
    ]
}
```

</details>

## 其他

- 本项目为了避免频繁请求官方数据，默认对数据做了缓存处理，默认为 `30` 分钟，如需更改，请自行前往 `utils\cacheData.js` 文件修改
- 本项目部分接口使用了 **页面爬虫**，若违反对应页面的相关规则，请 **及时通知我去除该接口**

## 免责声明

- 本项目提供的 `API` 仅供开发者进行技术研究和开发测试使用。使用该 `API` 获取的信息仅供参考，不代表本项目对信息的准确性、可靠性、合法性、完整性作出任何承诺或保证。本项目不对任何因使用该 `API` 获取信息而导致的任何直接或间接损失负责。本项目保留随时更改 `API` 接口地址、接口协议、接口参数及其他相关内容的权利。本项目对使用者使用 `API` 的行为不承担任何直接或间接的法律责任
- 本项目并未与相关信息提供方建立任何关联或合作关系，获取的信息均来自公开渠道，如因使用该 `API` 获取信息而产生的任何法律责任，由使用者自行承担
- 本项目对使用 `API` 获取的信息进行了最大限度的筛选和整理，但不保证信息的准确性和完整性。使用 `API` 获取信息时，请务必自行核实信息的真实性和可靠性，谨慎处理相关事项
- 本项目保留对 `API` 的随时更改、停用、限制使用等措施的权利。任何因使用本 `API` 产生的损失，本项目不负担任何赔偿和责任
