# 🏗️ Roguelike TCG v2 - 分層架構設計

## 📊 整體架構樹狀圖

```
📁 src/
├── 🎮 main.js                     # 主入口 (輕量)
├── 🎯 core/                       # 核心系統層 (輕量)
│   ├── GameController.js          # 遊戲控制器
│   ├── GameState.js               # 狀態管理
│   ├── EventBus.js                # 事件系統
│   └── SystemRegistry.js          # 系統註冊器
├── 🃏 systems/                    # 遊戲系統層 (中等)
│   ├── CombatSystem.js            # 戰鬥系統
│   ├── MapSystem.js               # 地圖系統
│   ├── RewardSystem.js            # 獎勵系統
│   └── SaveSystem.js              # 存檔系統
├── 🎨 ui/                         # UI展示層 (輕量)
│   ├── UIManager.js               # UI管理器
│   ├── components/                # UI組件
│   │   ├── Hand.js
│   │   ├── Combat.js
│   │   └── Map.js
│   └── animations/                # 動畫效果
│       └── CardAnimations.js
├── 🃏 cards/                      # 卡牌邏輯層 (重量)
│   ├── CardRegistry.js            # 卡牌註冊器
│   ├── collections/               # 卡牌集合
│   │   ├── starter/               # 起始卡牌
│   │   │   ├── Strike.js
│   │   │   └── Defend.js
│   │   ├── common/                # 普通卡牌
│   │   │   ├── FireBolt.js
│   │   │   └── Heal.js
│   │   ├── rare/                  # 稀有卡牌
│   │   │   └── Lightning.js
│   │   └── legendary/             # 傳說卡牌
│   │       └── DragonBreath.js
│   └── CardFactory.js             # 卡牌工廠
├── ⚡ effects/                     # 效果系統層 (中量)
│   ├── EffectRegistry.js          # 效果註冊器
│   ├── keywords/                  # 關鍵字邏輯
│   │   ├── Damage.js              # 傷害關鍵字
│   │   ├── Heal.js                # 治療關鍵字
│   │   ├── Draw.js                # 抽牌關鍵字
│   │   ├── Block.js               # 格擋關鍵字
│   │   ├── Poison.js              # 中毒關鍵字
│   │   └── Burn.js                # 燃燒關鍵字
│   └── EffectProcessor.js         # 效果處理器
├── 📊 data/                       # 數據配置層 (純數據)
│   ├── balance/                   # 平衡參數
│   │   ├── CardBalance.js         # 卡牌數值
│   │   ├── CombatBalance.js       # 戰鬥數值
│   │   └── ProgressBalance.js     # 進度數值
│   ├── gameData/                  # 遊戲數據
│   │   ├── Enemies.js             # 敵人數據
│   │   ├── Events.js              # 事件數據
│   │   └── Relics.js              # 遺物數據
│   └── constants/                 # 常量定義
│       ├── GameConstants.js       # 遊戲常量
│       └── UIConstants.js         # UI常量
└── 🛠️ utils/                      # 工具函數層 (純函數)
    ├── Random.js                  # 隨機數工具
    ├── ArrayUtils.js              # 陣列工具
    └── Validation.js              # 驗證工具
```

## 🔄 依賴流向圖

```
主邏輯層 (main.js, GameController.js)
    ↓ 引用
系統層 (CombatSystem.js, MapSystem.js)
    ↓ 引用
卡牌邏輯層 (Strike.js, FireBolt.js)
    ↓ 引用
關鍵字層 (Damage.js, Heal.js)
    ↓ 引用
參數層 (CardBalance.js, CombatBalance.js)
```

## 📋 各層職責說明

### 1. 主邏輯層 (Ultra Light - < 50 lines each)
- **職責**: 組裝系統、啟動遊戲、協調調度
- **特點**: 極輕量，主要是引用和初始化
- **修改頻率**: 很少

### 2. 系統層 (Light - 100-200 lines each)
- **職責**: 實現核心遊戲機制
- **特點**: 通用邏輯，不包含具體卡牌細節
- **修改頻率**: 大版本更新時

### 3. 卡牌邏輯層 (Heavy - 個數多)
- **職責**: 定義具體卡牌行為
- **特點**: 數量最多的層級，每張卡一個文件
- **修改頻率**: 經常（新增卡牌）

### 4. 關鍵字層 (Medium - 20-100 lines each)
- **職責**: 實現可復用的效果邏輯
- **特點**: 高復用性，被多張卡牌使用
- **修改頻率**: 中等（新機制時）

### 5. 參數層 (Pure Data)
- **職責**: 存放所有可調數值
- **特點**: 純數據，無邏輯
- **修改頻率**: 經常（平衡調整）

## 🎯 擴展場景示例

### 場景1: 新增卡牌 "火焰箭"
```javascript
// 只需新增一個文件: cards/common/FlameArrow.js
// 引用現有關鍵字: Damage.js, Burn.js
// 無需修改其他文件
```

### 場景2: 新增關鍵字 "冰凍"
```javascript
// 新增: effects/keywords/Freeze.js
// 修改: 需要冰凍效果的卡牌文件
// 無需修改: 主邏輯、系統層
```

### 場景3: 平衡調整
```javascript
// 只修改: data/balance/CardBalance.js
// 例如: FLAME_ARROW_DAMAGE: 8 → 10
// 無需修改: 任何邏輯文件
```

## 🏗️ 實際文件大小預估

| 層級 | 文件數量 | 單文件行數 | 總行數預估 |
|------|----------|------------|------------|
| 主邏輯層 | 5 | 20-50 | 250 |
| 系統層 | 8 | 100-200 | 1200 |
| UI層 | 12 | 50-150 | 1200 |
| 卡牌層 | **200+** | 15-30 | **6000** |
| 關鍵字層 | 30 | 20-100 | 1500 |
| 參數層 | 10 | 50-200 | 1000 |
| **總計** | **265+** | - | **11150** |

## 🔧 開發工作流程

### 日常新增卡牌 (90%的工作)
1. 在 `cards/collections/` 中新增卡牌文件
2. 引用所需關鍵字
3. 在 `CardRegistry.js` 中註冊
4. 完成！

### 新機制開發 (5%的工作)
1. 在 `effects/keywords/` 中新增關鍵字
2. 在 `EffectRegistry.js` 中註冊
3. 修改使用該機制的卡牌
4. 更新平衡參數

### 平衡調整 (5%的工作)
1. 修改 `data/balance/` 中的數值
2. 測試
3. 完成！

## 🎨 代碼風格約定

- 主邏輯層: 只做組裝，不寫業務邏輯
- 系統層: 通用機制，不依賴具體卡牌
- 卡牌層: 一張卡一個文件，命名清晰
- 關鍵字層: 純函數，高復用性
- 參數層: 純數據對象，便於調整

這種架構確保了：
- ✅ **新增卡牌時**: 只需要動卡牌層
- ✅ **新機制時**: 只需要動關鍵字層  
- ✅ **平衡調整**: 只需要動參數層
- ✅ **代碼重用**: 關鍵字被多張卡復用
- ✅ **易於維護**: 各層職責清晰分明