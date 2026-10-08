/* 双11凑单计算器 - 共享逻辑
 * 数据：localStorage 持久化
 * - items: 商品数组 [{id,name,price,shop,category,type,qty,deposit,depositDeduct,presale}]
 * - coupons: 优惠配置 {shopCoupons:[], catCoupons:[], vip:{enabled,denom}, redPackets:[], shopCoins:[{}], goldCoin:0}
 * - history: 历史方案数组 [{id,name,time,amount,itemsSnapshot,total,thumbs}]
 * - hasInitDemo: 是否已预置演示数据
 */

const STORAGE_KEY = 'd11c_v1';

/* ============ Storage ============ */
const store = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  },
  save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  },
  get() {
    let data = this.load();
    if (!data || !data.hasInitDemo) {
      // 首次进入：预置演示数据（商品 + 优惠 + 3 条历史）
      const d = demo.build();
      d.hasInitDemo = true;
      this.save(d);
      return d;
    }
    return data;
  },
  update(fn) {
    const data = this.get();
    fn(data);
    this.save(data);
    return data;
  },
  reset() { localStorage.removeItem(STORAGE_KEY); }
};

function emptyCoupons() {
  return {
    shopCoupons: [],   // [{id, shop, type:'ladder'|'amount', rules:[{threshold,reduce}], note}]
    catCoupons: [],    // [{id, category, threshold, reduce}]
    vip: { enabled: false, denom: 150 },
    redPackets: [],    // [{id, value}]
    shopCoins: [],     // [{id, shop, balance}]
    goldCoin: 0,       // 淘金币可抵扣金额
  };
}

/* ============ Demo 演示数据（仅首次） ============ */
const demo = {
  isFirst() { return !store.load(); },
  build() {
    return {
      hasInitDemo: true,
      items: [
        { id: uid(), name: '雅诗兰黛小棕瓶精华 50ml', price: 900, shop: '雅诗兰黛官方旗舰店', category: '美妆护肤', type: 'tianmao', qty: 1, presale: false, deposit: 0, depositDeduct: 0, thumb: '🧴' },
        { id: uid(), name: 'AirPods 4 无线耳机', price: 999, shop: 'Apple Store 官方旗舰店', category: '数码家电', type: 'tianmao', qty: 1, presale: false, deposit: 0, depositDeduct: 0, thumb: '🎧' },
        { id: uid(), name: '纯棉短袖T恤', price: 79, shop: '淘宝之家', category: '服饰鞋包', type: 'cshop', qty: 2, presale: false, deposit: 0, depositDeduct: 0, thumb: '👕' },
      ],
      coupons: {
        shopCoupons: [
          { id: uid(), shop: '瑞特旗舰店', type: 'ladder', rules: [{ threshold: 1, reduce: 10 }, { threshold: 2, reduce: 30 }] },
          { id: uid(), shop: 'Apple Store 官方旗舰店', type: 'amount', rules: [{ threshold: 1000, reduce: 50 }] },
        ],
        catCoupons: [
          { id: uid(), category: '美妆护肤', threshold: 300, reduce: 50 },
        ],
        vip: { enabled: true, denom: 150 },
        redPackets: [
          { id: uid(), value: 5 }, { id: uid(), value: 10 },
          { id: uid(), value: 8 }, { id: uid(), value: 6 },
        ],
        shopCoins: [
          { id: uid(), shop: '瑞特旗舰店', balance: 200 },
          { id: uid(), shop: 'Apple Store 官方旗舰店', balance: 500 },
        ],
        goldCoin: 20,
      },
      history: [
        { id: uid(), name: '双11购物方案-3', time: '2025-11-08 14:30', amount: 400.05, total: 1520, thumbs: ['🧴', '🎧', '👕'] },
        { id: uid(), name: '护肤囤货方案', time: '2025-11-07 20:11', amount: 662.20, total: 1880, thumbs: ['💧', '🧴', '🧪'] },
        { id: uid(), name: '数码家电方案', time: '2025-11-06 19:20', amount: 1288.00, total: 3200, thumbs: ['🎮', '📱', '🎧'] },
      ],
    };
  },
  init() { store.save(this.build()); }
};

/* ============ ID 工具 ============ */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function fmt(n) { return Number(n || 0).toFixed(2); }
function fmtMoney(n) { return '¥' + fmt(n); }
function nowStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ============ 内置凑单小件库 ============ */
const COUDAN_LIBRARY = [
  { name: '手机壳', emoji: '📱', price: 9.9, category: '数码家电' },
  { name: '钢化膜', emoji: '🪞', price: 12.9, category: '数码家电' },
  { name: '数据线', emoji: '🔌', price: 15.9, category: '数码家电' },
  { name: '充电头', emoji: '🔋', price: 19.9, category: '数码家电' },
  { name: '充电宝', emoji: '🔋', price: 29.9, category: '数码家电' },
  { name: '耳机保护壳', emoji: '🎧', price: 19.9, category: '数码家电' },
  { name: 'AirPods 保护套', emoji: '🎵', price: 19.9, category: '数码家电' },
  { name: 'iPhone 手机壳', emoji: '📱', price: 19.9, category: '数码家电' },
  { name: '键盘膜', emoji: '⌨️', price: 14.9, category: '数码家电' },
  { name: '鼠标垫', emoji: '🖱️', price: 12.9, category: '数码家电' },
  { name: '扩展坞', emoji: '🔗', price: 29.9, category: '数码家电' },
  { name: '转接线', emoji: '🔀', price: 9.9, category: '数码家电' },

  { name: '纯棉短袖T恤', emoji: '👕', price: 29.9, category: '服饰鞋包' },
  { name: '纯棉中袖T恤', emoji: '👚', price: 29.9, category: '服饰鞋包' },
  { name: '袜子', emoji: '🧦', price: 9.9, category: '服饰鞋包' },
  { name: '发圈', emoji: '🎀', price: 5.9, category: '服饰鞋包' },

  { name: '护手霜', emoji: '🧴', price: 9.9, category: '美妆护肤' },
  { name: '眉笔', emoji: '✏️', price: 12.9, category: '美妆护肤' },
  { name: '化妆棉', emoji: '🧽', price: 8.9, category: '美妆护肤' },
  { name: '美妆蛋', emoji: '🥚', price: 9.9, category: '美妆护肤' },

  { name: '抽纸', emoji: '🧻', price: 9.9, category: '日用百货' },
  { name: '垃圾袋', emoji: '🗑️', price: 6.9, category: '日用百货' },
  { name: '密封袋', emoji: '📦', price: 8.9, category: '日用百货' },
  { name: '湿巾', emoji: '🧴', price: 12.9, category: '日用百货' },
  { name: '棉签', emoji: '🧷', price: 5.9, category: '日用百货' },
  { name: '挂钩', emoji: '🪝', price: 4.9, category: '日用百货' },

  { name: '马克杯', emoji: '☕', price: 14.9, category: '家居家纺' },
  { name: '桌垫', emoji: '🟫', price: 19.9, category: '家居家纺' },
  { name: '便签纸', emoji: '📝', price: 5.9, category: '家居家纺' },
  { name: '笔记本', emoji: '📓', price: 12.9, category: '家居家纺' },
  { name: '笔芯', emoji: '🖊️', price: 5.9, category: '家居家纺' },

  { name: '牙膏试用装', emoji: '🪥', price: 4.9, category: '食品保健' },
  { name: '漱口水', emoji: '💧', price: 9.9, category: '食品保健' },
  { name: '洗衣液小样', emoji: '🧴', price: 5.9, category: '食品保健' },
];

/* ============ 计算引擎 ============
 * 9 步优惠叠加，按图 4 顺序：
 *  1. 商品原价合计
 *  2. 店铺券（按店铺独立计算：阶梯选最优/金额最高）
 *  3. 官方立减 15%（仅天猫）
 *  4. 跨店满减（C 店，floor(subtotal/200)*30）
 *  5. 品类券（按类目合并算门槛）
 *  6. 88VIP 9 折（单项最高减 denom）
 *  7. 红包（累加扣减）
 *  8. 店铺购物金（按店铺余额）
 *  9. 淘金币（直接扣）
 *
 * 每步记录 { title, sub, status: 'active'|'inactive'|'partial', amount }
 */
const engine = {
  calc(items, coupons) {
    const steps = [];
    const safeItems = items || [];
    const safeCoupons = coupons || emptyCoupons();

    // 0. 按店铺分组
    const byShop = groupBy(safeItems, 'shop');

    // 1. 商品原价合计
    const subtotal = safeItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
    const tianmaoSubtotal = safeItems
      .filter(it => it.type === 'tianmao')
      .reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
    const cshopSubtotal = safeItems
      .filter(it => it.type === 'cshop')
      .reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);

    steps.push({
      no: 1, title: '商品原价合计', sub: `${safeItems.length}件商品`,
      status: 'info', amount: subtotal, sign: ''
    });

    let running = subtotal;

    // 2. 店铺券（按店铺独立计算）
    let shopCouponTotal = 0;
    const shopCouponDetails = [];
    (safeCoupons.shopCoupons || []).forEach(sc => {
      const shopItems = byShop[sc.shop] || [];
      const shopSub = shopItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
      const shopQty = shopItems.reduce((s, it) => s + Number(it.qty || 1), 0);
      if (sc.type === 'ladder') {
        // 阶梯件/金额：选最接近的可触发的（多件买N减M）
        const sorted = [...sc.rules].sort((a, b) => a.threshold - b.threshold);
        let best = null;
        for (const r of sorted) {
          if (sc.rules[0].threshold >= 100) {
            // 金额阶梯
            if (shopSub >= r.threshold) best = r;
          } else {
            // 件数阶梯
            if (shopQty >= r.threshold) best = r;
          }
        }
        if (best) {
          shopCouponTotal += best.reduce;
          shopCouponDetails.push({ shop: sc.shop, rule: best });
        }
      } else if (sc.type === 'amount') {
        // 金额满减：取最高可触发
        const ok = sc.rules.filter(r => shopSub >= r.threshold).sort((a, b) => b.reduce - a.reduce);
        if (ok[0]) {
          shopCouponTotal += ok[0].reduce;
          shopCouponDetails.push({ shop: sc.shop, rule: ok[0] });
        }
      }
    });
    running -= shopCouponTotal;
    if (shopCouponDetails.length) {
      steps.push({
        no: 2, title: '店铺券',
        sub: shopCouponDetails.map(d => `${d.shop} ${d.rule.threshold >= 100 ? '满'+d.rule.threshold : d.rule.threshold+'件'}减${d.rule.reduce}`).join(' / '),
        status: 'active', amount: -shopCouponTotal, sign: '-'
      });
    } else {
      steps.push({
        no: 2, title: '店铺券',
        sub: '暂无可用店铺券',
        status: 'inactive', amount: 0, sign: ''
      });
    }

    // 3. 官方立减 15%（仅天猫）
    const tianmaoReduce = +(tianmaoSubtotal * 0.15).toFixed(2);
    if (tianmaoSubtotal > 0) {
      running -= tianmaoReduce;
      steps.push({
        no: 3, title: '官方立减15%（天猫商品）', sub: `天猫商品合计 ¥${fmt(tianmaoSubtotal)}`,
        status: 'active', amount: -tianmaoReduce, sign: '-'
      });
    } else {
      steps.push({ no: 3, title: '官方立减15%', sub: '无天猫商品', status: 'inactive', amount: 0, sign: '' });
    }

    // 4. 跨店满减（C 店，floor(subtotal/200)*30）
    if (cshopSubtotal > 0) {
      const reduce = Math.floor(cshopSubtotal / 200) * 30;
      running -= reduce;
      steps.push({
        no: 4, title: '跨店满减（C店商品）',
        sub: reduce > 0 ? `每满200减30，触发${Math.floor(cshopSubtotal/200)}次` : `未达¥200门槛（当前 ¥${fmt(cshopSubtotal)}）`,
        status: reduce > 0 ? 'active' : 'inactive',
        amount: -reduce, sign: '-'
      });
    } else {
      steps.push({ no: 4, title: '跨店满减', sub: '无C店商品', status: 'inactive', amount: 0, sign: '' });
    }

    // 5. 品类券
    let catCouponTotal = 0;
    const catDetails = [];
    (safeCoupons.catCoupons || []).forEach(cc => {
      const catSub = safeItems.filter(it => it.category === cc.category)
        .reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
      if (catSub >= cc.threshold) {
        catCouponTotal += cc.reduce;
        catDetails.push({ category: cc.category, rule: cc });
      }
    });
    running -= catCouponTotal;
    if (catDetails.length) {
      steps.push({
        no: 5, title: '品类券',
        sub: catDetails.map(d => `${d.category} 满${d.rule.threshold}减${d.rule.reduce}`).join(' / '),
        status: 'active', amount: -catCouponTotal, sign: '-'
      });
    } else {
      steps.push({ no: 5, title: '品类券', sub: '未达门槛', status: 'inactive', amount: 0, sign: '' });
    }

    // 6. 88VIP 9 折（单项最高减 denom）
    let vipReduce = 0;
    if (safeCoupons.vip && safeCoupons.vip.enabled) {
      vipReduce = Math.min(running * 0.1, safeCoupons.vip.denom);
      vipReduce = +vipReduce.toFixed(2);
      running -= vipReduce;
      steps.push({
        no: 6, title: `88VIP 9折券（单项最高${safeCoupons.vip.denom}元）`,
        sub: '订单享9折', status: 'active', amount: -vipReduce, sign: '-'
      });
    } else {
      steps.push({ no: 6, title: '88VIP 9折券', sub: '未开通', status: 'inactive', amount: 0, sign: '' });
    }

    // 7. 红包（累加扣减）
    const packets = safeCoupons.redPackets || [];
    const packetTotal = packets.reduce((s, p) => s + Number(p.value || 0), 0);
    const packetUse = Math.min(packetTotal, running);
    if (packetTotal > 0) {
      running -= packetUse;
      steps.push({
        no: 7, title: `红包（${packets.length}个）`,
        sub: `共 ¥${fmt(packetTotal)}`,
        status: 'active', amount: -packetUse, sign: '-'
      });
    } else {
      steps.push({ no: 7, title: '红包', sub: '暂无可用红包', status: 'inactive', amount: 0, sign: '' });
    }

    // 8. 店铺购物金（按店铺独立）
    let coinTotal = 0;
    const coinDetails = [];
    (safeCoupons.shopCoins || []).forEach(c => {
      const shopSub = (byShop[c.shop] || []).reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
      if (shopSub > 0) {
        const use = Math.min(Number(c.balance || 0), shopSub * 0.2); // 单店铺最多抵 20%
        coinTotal += use;
        coinDetails.push({ shop: c.shop, use, balance: c.balance });
      }
    });
    coinTotal = +Math.min(coinTotal, running * 0.1).toFixed(2); // 总体不超过 10%
    if (coinTotal > 0) {
      running -= coinTotal;
      steps.push({
        no: 8, title: '店铺购物金',
        sub: coinDetails.map(d => `${d.shop} 抵¥${fmt(d.use)}`).join(' / '),
        status: 'active', amount: -coinTotal, sign: '-'
      });
    } else {
      steps.push({ no: 8, title: '店铺购物金', sub: '无可用购物金', status: 'inactive', amount: 0, sign: '' });
    }

    // 9. 淘金币
    const goldUse = Math.min(Number(safeCoupons.goldCoin || 0), running);
    if (goldUse > 0) {
      running -= goldUse;
      steps.push({
        no: 9, title: `淘金币（可抵扣 ¥${fmt(safeCoupons.goldCoin || 0)}）`,
        sub: `实际抵 ¥${fmt(goldUse)}`,
        status: 'active', amount: -goldUse, sign: '-'
      });
    } else {
      steps.push({ no: 9, title: '淘金币', sub: '无可抵扣', status: 'inactive', amount: 0, sign: '' });
    }

    const final = +Math.max(running, 0).toFixed(2);
    const saved = +(subtotal - final).toFixed(2);

    return {
      steps, subtotal, final, saved,
      // 给凑单算法用
      tianmaoSubtotal, cshopSubtotal,
      byShop,
      safeCoupons,
    };
  }
};

/* ============ 凑单 Top3 算法 ============ */
const coudan = {
  /**
   * 输入：当前 items + coupons + 引擎计算结果
   * 输出：Top3 凑单方案 [{ type:'qty'|'amount', title, badge, coupon, currentSubtotal, targetSubtotal, extraCost, newFinal, saving, recommend, product }]
   */
  find(items, calcResult) {
    const plans = [];
    const coupons = calcResult.safeCoupons;
    const safeItems = items || [];

    // 候选商品：内置库 + 当前订单商品
    const cands = [...COUDAN_LIBRARY];

    // 1. 件数阶梯券（满 N 件减 M）：再加 1 件
    (coupons.shopCoupons || []).forEach(sc => {
      if (sc.type === 'ladder') {
        const shopItems = safeItems.filter(it => it.shop === sc.shop);
        const qty = shopItems.reduce((s, it) => s + Number(it.qty || 1), 0);
        const sorted = [...sc.rules].sort((a, b) => a.threshold - b.threshold);
        for (const r of sorted) {
          if (qty < r.threshold && r.reduce > 0) {
            // 找最便宜的可凑单品
            const need = r.threshold - qty;
            const products = cands
              .filter(p => sc.shop ? true : true)
              .map(p => ({ ...p, cost: Number(p.price) * need }))
              .sort((a, b) => a.cost - b.cost);
            const pick = products[0];
            if (pick) {
              const extraCost = pick.cost;
              const newSaving = r.reduce;
              plans.push({
                type: 'qty',
                title: `${sc.shop} 还差${need}件可触发满${r.threshold}件减${r.reduce}`,
                badge: '件数凑单',
                status: '推荐使用',
                need,
                coupon: r,
                extraCost,
                newSaving,
                netSaving: +(newSaving - extraCost).toFixed(2),
                product: pick,
              });
            }
            break; // 只取最近一档
          }
        }
      }
    });

    // 2. 金额阶梯券 / 跨店满减 / 品类券：凑金额
    const targets = [];
    (coupons.shopCoupons || []).forEach(sc => {
      if (sc.type === 'amount') {
        sc.rules.forEach(r => {
          const shopSub = safeItems.filter(it => it.shop === sc.shop)
            .reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
          if (shopSub < r.threshold) {
            targets.push({
              label: `${sc.shop} 满${r.threshold}减${r.reduce}`,
              gap: r.threshold - shopSub,
              saving: r.reduce,
              shop: sc.shop,
            });
          }
        });
      }
    });
    // 跨店满减
    if (calcResult.cshopSubtotal < 200) {
      targets.push({
        label: '跨店满减 满200减30',
        gap: 200 - calcResult.cshopSubtotal,
        saving: 30,
      });
    } else {
      // 触发后再凑一档
      const next = Math.ceil((calcResult.cshopSubtotal + 1) / 200) * 200;
      targets.push({
        label: `跨店满减 满${next}减${(next/200)*30}`,
        gap: next - calcResult.cshopSubtotal,
        saving: 30,
      });
    }
    // 品类券
    (coupons.catCoupons || []).forEach(cc => {
      const catSub = safeItems.filter(it => it.category === cc.category)
        .reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
      if (catSub < cc.threshold) {
        targets.push({
          label: `${cc.category} 满${cc.threshold}减${cc.reduce}`,
          gap: cc.threshold - catSub,
          saving: cc.reduce,
        });
      }
    });

    targets.forEach(t => {
      // 找最便宜的可凑单品 ≤ gap（如果都超过 gap 就取最便宜的）
      const products = cands.map(p => ({ ...p, cost: Number(p.price) }))
        .sort((a, b) => a.cost - b.cost);
      const fit = products.filter(p => p.cost <= t.gap);
      const pick = fit[0] || products[0];
      if (pick) {
        const extraCost = pick.cost;
        plans.push({
          type: 'amount',
          title: `还差 ¥${fmt(t.gap)} 触发${t.label}`,
          badge: '金额凑单',
          status: extraCost <= t.saving ? '推荐使用' : '不推荐凑单',
          gap: t.gap,
          coupon: t,
          extraCost,
          newSaving: t.saving,
          netSaving: +(t.saving - extraCost).toFixed(2),
          product: pick,
        });
      }
    });

    // 排序：按 netSaving 降序
    plans.sort((a, b) => b.netSaving - a.netSaving);
    return plans.slice(0, 3);
  }
};

/* ============ 工具函数 ============ */
function groupBy(arr, key) {
  return (arr || []).reduce((m, it) => {
    const k = it[key] || '_';
    (m[k] = m[k] || []).push(it);
    return m;
  }, {});
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getQuery(name) {
  const m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/* ============ UI 组件 ============ */
const ui = {
  toast(msg, type) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  },
  confirm({ title, desc, confirmText = '确认', cancelText = '取消', danger = false }) {
    return new Promise((resolve) => {
      const mask = document.createElement('div');
      mask.className = 'modal-mask';
      mask.innerHTML = `
        <div class="modal">
          <div class="modal-icon danger">🗑️</div>
          <div class="modal-title">${escapeHtml(title)}</div>
          <div class="modal-desc">${escapeHtml(desc || '')}</div>
          <div class="modal-actions">
            <button class="btn btn-ghost" data-act="cancel">${escapeHtml(cancelText)}</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${escapeHtml(confirmText)}</button>
          </div>
        </div>`;
      document.body.appendChild(mask);
      mask.addEventListener('click', (e) => {
        const t = e.target.closest('[data-act]');
        if (!t) return;
        const ok = t.dataset.act === 'ok';
        mask.remove();
        resolve(ok);
      });
    });
  },
  alert({ title, desc, buttonText = '知道了', icon = '✅', iconClass = 'success' }) {
    return new Promise((resolve) => {
      const mask = document.createElement('div');
      mask.className = 'modal-mask';
      mask.innerHTML = `
        <div class="modal">
          <div class="modal-icon ${iconClass}">${icon}</div>
          <div class="modal-title">${escapeHtml(title)}</div>
          <div class="modal-desc">${escapeHtml(desc || '')}</div>
          <div class="modal-actions">
            <button class="btn btn-primary" data-act="ok" style="flex:1">${escapeHtml(buttonText)}</button>
          </div>
        </div>`;
      document.body.appendChild(mask);
      mask.addEventListener('click', (e) => {
        const t = e.target.closest('[data-act]');
        if (!t) return;
        mask.remove();
        resolve(true);
      });
    });
  }
};

/* ============ 顶部导航渲染 ============ */
function renderNav({ title, back, right = '' }) {
  return `
    <div class="nav">
      ${back ? `<a class="back" href="${back}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>` : '<div style="width:36px"></div>'}
      <div class="title">${escapeHtml(title)}</div>
      <div class="actions">${right}</div>
    </div>`;
}

/* ============ 业务方法 ============ */
const biz = {
  saveItem(item) {
    return store.update(data => {
      if (item.id && data.items.some(i => i.id === item.id)) {
        Object.assign(data.items.find(i => i.id === item.id), item);
      } else {
        data.items.push(Object.assign({ id: uid(), thumb: pickThumb(item.name) }, item));
      }
    });
  },
  deleteItem(id) {
    return store.update(data => {
      data.items = data.items.filter(i => i.id !== id);
    });
  },
  saveCoupons(coupons) {
    return store.update(data => { data.coupons = coupons; });
  },
  saveHistory(snapshot) {
    return store.update(data => {
      data.history.unshift(snapshot);
      // 最多保留 50 条
      data.history = data.history.slice(0, 50);
    });
  },
  deleteHistory(id) {
    return store.update(data => {
      data.history = data.history.filter(h => h.id !== id);
    });
  },
  clearHistory() {
    return store.update(data => { data.history = []; });
  },
  restoreHistory(id) {
    const data = store.get();
    const h = (data.history || []).find(x => x.id === id);
    if (!h) return false;
    if (h.itemsSnapshot) {
      store.update(d => { d.items = h.itemsSnapshot; });
    }
    return true;
  }
};

function pickThumb(name) {
  if (!name) return '🛍️';
  const map = [
    [/护肤|精华|面霜|水乳|防晒|化妆/, '🧴'],
    [/口红|唇彩|彩妆|眉笔|眼影|粉底/, '💄'],
    [/手机|耳机|充电|数据线|保护壳|贴膜|数码|键盘|鼠标/, '🎧'],
    [/电脑|笔记本|平板|显示器/, '💻'],
    [/衣服|衬衫|T恤|裙|裤|外套|卫衣/, '👕'],
    [/鞋|靴|运动/, '👟'],
    [/包|钱包|背包/, '👜'],
    [/食品|零食|饼干|巧克力|咖啡|茶/, '🍪'],
    [/饮料|水|果汁|酒/, '🥤'],
    [/家纺|被子|枕头|床品|四件套/, '🛏️'],
    [/玩具|积木|娃娃/, '🧸'],
    [/纸|抽|卷|湿巾/, '🧻'],
    [/锅|餐具|杯|壶|厨房/, '🍴'],
    [/插座|开关|灯|电池/, '💡'],
    [/洗发|沐浴|牙膏|牙刷|洗衣|纸巾/, '🧴'],
  ];
  for (const [re, emoji] of map) if (re.test(name)) return emoji;
  return '🛍️';
}

/* 暴露给页面用 */
window.D11C = { store, demo, engine, coudan, ui, biz, uid, fmt, fmtMoney, nowStr, escapeHtml, getQuery, renderNav, COUDAN_LIBRARY, emptyCoupons, groupBy, pickThumb };
