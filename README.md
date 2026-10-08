# d11c — Double 11 Calculator

> 双11凑单/满减计算器 / A smart shopping calculator for China's Double 11 festival

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![No Backend](https://img.shields.io/badge/Backend-None-brightgreen)
![HTML](https://img.shields.io/badge/Stack-Pure%20HTML%2BJS-orange)

## 这是什么 / What is this

一个**纯前端**的淘宝/天猫双11满减凑单计算器，帮你：

- 📦 **录入商品** —— 名称、价格、店铺、类目、是否天猫、是否预售
- 🎟 **配置 6 大类优惠** —— 店铺券 / 品类券 / 88VIP / 红包 / 购物金 / 淘金币
- 🧮 **9 步叠加计算** —— 商品原价 → 店铺券 → 官方立减 → 跨店满减 → 品类券 → 88VIP → 红包 → 购物金 → 淘金币
- 🎯 **凑单 Top3** —— 智能推荐最划算的凑单方案（按"节省 - 凑单成本"排序）
- 💾 **历史记录** —— 保存方案、随时恢复

**特点**：
- ✅ **零后端** —— 所有数据存 `localStorage`，刷新不丢
- ✅ **零依赖** —— 纯 HTML + JS，无任何 npm 包
- ✅ **零构建** —— 双击 `.html` 即用
- ✅ **完全离线** —— 不联网也能用
- ✅ **手机宽度优化** —— 430px 容器，体验贴近小程序

## 截图 / Screenshots

| 首页 | 计算结果 |
| --- | --- |
| 订单清单 + 添加商品 + 配置/计算按钮 | 9 步优惠明细 + 凑单 Top3 |

| 优惠配置 | 历史记录 |
| --- | --- |
| 6 大类优惠券编辑器 | 方案卡片 + 恢复/删除 |

## 快速开始 / Quick Start

### 方式 1：直接双击打开
下载后双击 `index.html` 即可使用。

### 方式 2：本地起 HTTP 服务
```bash
# Python 3
python -m http.server 8765 --bind 127.0.0.1

# 或 Node.js
npx serve -l 8765
```
然后浏览器打开 <http://127.0.0.1:8765>

> 为什么不直接 `file://` 打开？localStorage 在某些浏览器对 file:// 协议有兼容问题。

## 部署 / Deploy

### Vercel（推荐，免费，5 分钟）
```bash
npm i -g vercel
vercel --prod
```
部署完成后得到 `https://d11c-xxx.vercel.app`，可直接挂到公众号"阅读原文"。

### GitHub Pages
1. Settings → Pages → Source: `main` branch
2. 访问 `https://<用户名>.github.io/d11c`

### Netlify / Cloudflare Pages
直接拖拽项目文件夹到它们的网页部署面板即可。

## 计算逻辑 / Calculation Logic

按以下 9 步顺序叠加计算"最终实付"：

1. **商品原价合计** —— 累加 `价格 × 数量`
2. **店铺券** —— 按店铺分组，阶梯件数/金额满减，自动选最优
3. **官方立减 15%** —— 仅天猫商品（`type === 'tianmao'`）
4. **跨店满减** —— 仅 C 店商品，`floor(原价 / 200) × 30`
5. **品类券** —— 按类目合并算门槛
6. **88VIP 9 折券** —— `min(原价 × 10%, 券面额)`
7. **红包** —— 累加（最多 10 个）
8. **店铺购物金** —— 按店铺余额，单店最多抵 20%
9. **淘金币** —— 用户输入的可抵扣金额

每步都有"已生效/未生效"状态，未生效的会显示"还差多少"提示。

## 文件结构 / Project Structure

```
双11凑单计算器/
├── index.html         # 首页：订单清单
├── edit.html          # 商品录入/编辑
├── coupons.html       # 优惠配置（6 大类）
├── result.html        # 计算结果 + 凑单 Top3
├── history.html       # 历史记录
├── app.js             # 共享：数据层 + 计算引擎 + 凑单算法
├── styles.css         # 移动端基础样式
└── vercel.json        # 部署配置
```

## 凑单算法 / Coudan Algorithm

`app.js` 的 `coudan.find()` 函数：

1. 遍历所有"未触发/未触底"的券（店铺阶梯件数券、店铺金额满减、跨店满减、品类券）
2. 对每张券算"差多少能触发下一档"
3. 从内置的 30 个常用凑单小件库（手机壳、数据线、耳机保护壳、抽纸、垃圾袋等）里选最便宜的候选
4. 按 `净节省 = 优惠金额 - 凑单成本` 排序，取前 3
5. 净节省 > 0 标"推荐使用"，≤ 0 标"不推荐凑单"

## 公众号引流方案 / WeChat OA Integration

适合公众号挂"阅读原文"或自定义菜单引流：

1. 推文方向：《双11凑单计算器｜算满减、阶梯券、购物金，一键找出最优凑单方案》
2. 工具内放公众号引导：可修改 `index.html` 的 `disclaimer` 部分加上"本工具由 XX 公众号开发"
3. Vercel 部署拿到 https 链接后，挂到公众号菜单

## 后续规划 / Roadmap

- [ ] 微信小程序版（基于现成业务逻辑）
- [ ] 导出方案为图片（方便发朋友圈）
- [ ] 凑单小件库支持自定义
- [ ] 商品对比：多方案并存对比

## License

MIT © 2026 xiaohua-0706
