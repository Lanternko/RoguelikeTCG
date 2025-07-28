# 遊戲開發技術規格書 (v1.1)

## 前言

本文件旨在為工程團隊提供一份完整且無歧義的開發規格。我們的目標是讓一位從未接觸過本遊戲的工程師，在閱讀完本文件後，能清晰地理解遊戲的數據流、核心玩法和所有必要的計算邏輯。

## 遊戲總體流程 (Macro Game Loop)

在深入單場戰鬥的細節前，需先了解遊戲的總體結構：

1. 賽季 (Season)：玩家的每一次遊玩都是一個獨立的「賽季」。

2. 戰鬥 (Battle)：一個賽季包含 15 場戰鬥。

3. 牌組構築 (Deckbuilding)：每場戰鬥勝利後，玩家會獲得新卡牌，逐步構築並強化自己的牌組。

4. 徽章 (Badges)：在特定場次（第1, 4, 7, 10, 13場）後，玩家可獲得永久（僅限當前賽季）的強力Buff。

5. 失敗 (Defeat)：若玩家在任一場戰鬥中HP歸零，則當前賽季結束，玩家需從頭開始新賽季。

## 核心遊戲常數 (Core Game Constants)

這些是遊戲中最基礎且恆定的數值。

```javascript
const GAME_CONSTANTS = {
  PLAYER_INITIAL_HP: 100,      // 玩家的初始生命值
  PITCHER_INITIAL_HP: 150,     // 投手的初始生命值
  HAND_SIZE_LIMIT: 7,          // 手牌上限
  STRIKE_ZONE_LIMIT: 1,        // 打擊區卡槽上限
  SUPPORT_ZONE_LIMIT: 1,       // 輔助區卡槽上限
  SPELL_ZONE_LIMIT: 1,         // 法術區卡槽上限
  PITCHER_BASE_FATIGUE_RATE: 0.05, // 投手基礎疲勞率 (5%)
};
```

## 數據結構 (Data Structures)

清晰的數據結構是實現遊戲邏輯的基石。

### Card Object (卡牌對象)

```javascript
// 卡牌是遊戲最核心的數據單元
const Card = {
  id: "human_001",              // 【string】唯一ID，用於數據庫索引和牌組存儲
  name: "英雄",                  // 【string】卡牌顯示名稱
  type: "打者",                  // 【string】類型: '打者', '輔助', '法術', '死聲'
  rarity: "普通",                // 【string】稀有度: '普通', '稀有', '傳說'
  attribute: "人",               // 【string】屬性: '人', '天', '地', '陰', '陽'
  hp_bonus: 10,                 // 【number】此卡加入牌組時，為玩家永久增加的最大生命值 (跨戰鬥生效)
  attack: 25,                   // 【number】卡牌的基礎攻擊力
  crit: 50,                     // 【number】卡牌的暴擊值 (整數形式，50代表+50%)
  effect_description: "無效果",  // 【string】顯示在卡牌上的效果描述文字
  
  // 【object】效果邏輯標籤，用於觸發特定邏輯。key為觸發時機，value為效果標識符
  logic_tags: {
    on_play: null,              // 打出時觸發
    on_strike: "CHECK_YINYANG_ADD_ATTACK_20", // 在打擊格時觸發的被動或主動效果
    on_support: "DRAW_HUMAN_CARD", // 在輔助格時觸發
    on_deathrattle: "DRAW_CARD_ON_DEATH", // 進入棄牌堆時觸發 (死聲)
    passive_in_hand: "GROW_ATTACK_PER_CARD_PLAYED", // 在手牌中時的被動效果
  }
};
```

### State Objects (狀態對象)

```javascript
// 實時追蹤玩家與投手的狀態
const PlayerState = {
  current_hp: 100,
  max_hp: 100,
  deck: ["card_id_1", "card_id_2", ...], // 牌庫，僅存放卡牌ID
  hand: [Card, Card, ...],               // 手牌，存放完整的卡牌對象
  discard_pile: [Card, Card, ...],       // 棄牌堆
  strike_zone: [],                       // 打擊區 (最多1張卡)
  support_zone: [],                      // 輔助區 (最多1張卡)
  spell_zone: [],                        // 法術區 (最多1張卡)
  active_buffs: [                        // 當前生效的Buff
    { type: 'ATTACK_UP', value: 10, duration: 1 } // duration為剩餘回合數
  ],
};

const PitcherState = {
  current_hp: 150,
  max_hp: 150,
  base_attack: 30, // 基礎攻擊力，用於計算
  current_attack: 30, // 當前回合的實際攻擊力
  attribute: "天",
  active_debuffs: [
    { type: 'ATTACK_DOWN', value: 5, duration: -1 } // duration為-1代表永久 (本場戰鬥)
  ],
};
```

## 核心公式 (Core Formulas)

這是遊戲數值計算的核心，務必精確實現。

### 傷害計算 (Damage Calculation)

此公式在玩家點擊「攻擊」按鈕後觸發。

```javascript
// Step 1: 初始化基礎值
// 從打擊區和輔助區的卡牌累加基礎攻擊力和暴擊值
let totalAttack = 0;
let totalCrit = 0;
const strikeCard = PlayerState.strike_zone[0];
const supportCard = PlayerState.support_zone[0];
if (strikeCard) {
  totalAttack += strikeCard.attack;
  totalCrit += strikeCard.crit;
}
if (supportCard) {
  // 輔助卡的攻擊力和暴擊值也完全計入
  totalAttack += supportCard.attack;
  totalCrit += supportCard.crit;
}

// Step 2: 應用卡牌效果與Buff
// 遍歷所有active_buffs和觸發的卡牌效果(logic_tags)，修改totalAttack和totalCrit
// 範例：如果「慈愛」在輔助區，其'on_support'效果會在此處使 totalAttack += 10;
// 範例：如果玩家有全局Buff 'ATTACK_UP', 此處 totalAttack += buff.value;

// Step 3: 計算最終傷害
// 應用核心公式
let finalDamage = totalAttack * (1 + totalCrit / 100);

// Step 4: 應用屬性克制
// 假設存在一個函數 isStrongAgainst(playerAttr, enemyAttr)
const playerMainAttr = "人"; // 應從玩家狀態獲取
if (isStrongAgainst(playerMainAttr, PitcherState.attribute)) {
  finalDamage *= 1.2;
}

// Step 5: 四捨五入取整
finalDamage = Math.round(finalDamage);

// 最後，從投手HP中減去finalDamage
PitcherState.current_hp -= finalDamage;
```

### 投手疲勞 (Pitcher Fatigue)

在每個玩家回合結束時觸發。

```javascript
PitcherState.current_attack *= (1 - GAME_CONSTANTS.PITCHER_BASE_FATIGUE_RATE);
PitcherState.current_attack = Math.round(PitcherState.current_attack);
```

## 遊戲回合流程 (Game Turn Flow)

一個完整的回合包含以下階段，需嚴格按順序執行。

1. **回合開始 (Start of Turn)**

   - 處理Buff/Debuff的持續時間，duration--。移除duration為0的效果。

   - 觸發所有on_turn_start的卡牌或場地效果。

2. **抽牌階段 (Draw Phase)**

   - 計算需抽牌數：drawCount = HAND_SIZE_LIMIT - PlayerState.hand.length。

   - 循環drawCount次：

     - 如果deck為空，將discard_pile所有卡牌洗牌（隨機排序），賦值給deck，並清空discard_pile。

     - 如果deck依然為空（棄牌堆也空），則無法抽牌。

     - 從deck頂部抽一張牌（ID），根據ID獲取完整卡牌數據，放入hand。

3. **出牌階段 (Play Phase)**

   - 玩家可以從手牌中將卡牌放入strike_zone、support_zone或spell_zone。

   - 放置規則：

     - 目標區域必須為空（上限為1）。

     - 法術牌只能放入spell_zone。

     - 打出時，立即觸發on_play效果（例如法術效果、抽卡等）。

4. **戰鬥階段 (Combat Phase)**

   - 由玩家手動觸發（例如點擊「攻擊」按鈕）。

   - 玩家攻擊：調用4.1 傷害計算公式，對投手造成傷害。

   - 投手攻擊：

     - 計算投手臨時攻擊力：let pitcherDamage = PitcherState.current_attack;

     - 應用克制：如果玩家被克制，pitcherDamage *= 0.8;

     - PlayerState.current_hp -= Math.round(pitcherDamage);

5. **回合結束 (End of Turn)**

   - strike_zone, support_zone, spell_zone中的卡牌移入discard_pile。

   - 此時觸發死聲 (on_deathrattle)效果。

   - 觸發所有on_turn_end的卡牌或場地效果。

   - 結算投手的疲勞效果（調用4.2 投手疲勞公式）。

   - 檢查任一方的 HP 是否 ≤ 0，若有則結束戰鬥。

   - 若無勝負，進入下一回合（回到階段1）。
