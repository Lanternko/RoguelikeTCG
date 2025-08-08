// src/cards/CardRegistry.js - Complete Import-Based Registry

// Import all individual card classes
import { PresidentCard } from './collections/human/common/President.js';
import { KindnessCard } from './collections/human/common/Kindness.js';
import { HeroCard } from './collections/human/common/Hero.js';
import { LotteryCard } from './collections/human/common/Lottery.js';
import { StrongmanCard } from './collections/human/common/Strongman.js';
import { DemocracyCard } from './collections/human/common/Democracy.js';

// Yin attribute cards
import { ShadowDevourCard } from './collections/yin/common/ShadowDevour.js';
import { LoneShadowCard } from './collections/yin/common/LoneShadow.js';
import { EvilGeniusCard } from './collections/yin/rare/EvilGenius.js';

// Yang attribute cards
import { HolyLightCard } from './collections/yang/common/HolyLight.js';
import { YinYangHarmonyCard } from './collections/yang/rare/YinYangHarmony.js';

// Heaven attribute cards
import { WeaponMasterCard } from './collections/heaven/rare/WeaponMaster.js';

/**
 * 🎴 卡牌註冊表 - 完整版本
 * 每張卡牌都有自己的獨立文件，這裡只負責註冊和管理
 */
export class CardRegistry {
  static cards = new Map();
  static initialized = false;

  /**
   * 🔧 初始化卡牌註冊表
   */
  static async initialize() {
    console.log('🔧 初始化卡牌註冊表 (完整版)...');
    
    try {
      this.registerAllCards();
      this.initialized = true;
      console.log(`✅ 卡牌註冊表初始化完成，共 ${this.cards.size} 張卡牌`);
      
      // 驗證所有卡牌
      this.validateAllCards();
      
    } catch (error) {
      console.error('❌ 卡牌註冊表初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 📚 註冊所有卡牌
   */
  static registerAllCards() {
    // Human attribute cards - 人屬性卡牌
    this.registerCard('president', PresidentCard);
    this.registerCard('kindness', KindnessCard);
    this.registerCard('hero', HeroCard);
    this.registerCard('lottery', LotteryCard);
    this.registerCard('strongman', StrongmanCard);
    this.registerCard('democracy', DemocracyCard);
    
    // Yin attribute cards - 陰屬性卡牌
    this.registerCard('shadow_devour', ShadowDevourCard);
    this.registerCard('lone_shadow', LoneShadowCard);
    this.registerCard('evil_genius', EvilGeniusCard);
    
    // Yang attribute cards - 陽屬性卡牌
    this.registerCard('holy_light', HolyLightCard);
    this.registerCard('yinyang_harmony', YinYangHarmonyCard);
    
    // Heaven attribute cards - 天屬性卡牌
    this.registerCard('weapon_master', WeaponMasterCard);
    
    console.log('📚 所有卡牌註冊完成');
  }

  /**
   * 📝 註冊單張卡牌
   */
  static registerCard(id, cardClass) {
    if (this.cards.has(id)) {
      console.warn(`⚠️ 卡牌 ${id} 已存在，將被覆蓋`);
    }
    
    this.cards.set(id, cardClass);
    console.log(`✅ 註冊卡牌: ${id}`);
  }

  /**
   * 🎴 創建卡牌實例
   */
  static create(cardId) {
    if (!this.initialized) {
      throw new Error('CardRegistry 尚未初始化，請先調用 initialize()');
    }
    
    if (!this.cards.has(cardId)) {
      const availableCards = Array.from(this.cards.keys()).join(', ');
      throw new Error(`卡牌 ${cardId} 不存在。可用卡牌: ${availableCards}`);
    }
    
    try {
      const CardClass = this.cards.get(cardId);
      const card = CardClass.create();
      
      // 確保卡牌ID正確
      if (card.id !== cardId) {
        console.warn(`⚠️ 卡牌 ${cardId} 的內部ID不匹配: ${card.id}`);
        card.id = cardId; // 修正ID
      }
      
      return card;
      
    } catch (error) {
      console.error(`❌ 創建卡牌 ${cardId} 失敗:`, error);
      throw new Error(`創建卡牌 ${cardId} 失敗: ${error.message}`);
    }
  }

  /**
   * ✅ 驗證所有卡牌
   */
  static validateAllCards() {
    console.log('🔍 驗證所有卡牌...');
    
    let validCount = 0;
    let invalidCount = 0;
    const errors = [];
    
    for (const [cardId] of this.cards) {
      try {
        const card = this.create(cardId);
        const validation = this.validateCard(card);
        
        if (validation.isValid) {
          validCount++;
        } else {
          invalidCount++;
          errors.push(`${cardId}: ${validation.errors.join(', ')}`);
        }
        
      } catch (error) {
        invalidCount++;
        errors.push(`${cardId}: 創建失敗 - ${error.message}`);
      }
    }
    
    console.log(`✅ 驗證完成: ${validCount} 張有效, ${invalidCount} 張無效`);
    
    if (errors.length > 0) {
      console.warn('⚠️ 發現問題:');
      errors.forEach(error => console.warn(`  - ${error}`));
    }
  }

  /**
   * 🔍 驗證單張卡牌
   */
  static validateCard(card) {
    const errors = [];
    
    // 檢查必要屬性
    const requiredFields = ['id', 'name', 'type', 'attribute', 'rarity', 'stats', 'description'];
    requiredFields.forEach(field => {
      if (!card[field]) {
        errors.push(`缺少必要屬性: ${field}`);
      }
    });
    
    // 檢查stats結構
    if (card.stats) {
      const requiredStats = ['hp_bonus', 'attack', 'crit'];
      requiredStats.forEach(stat => {
        if (typeof card.stats[stat] !== 'number') {
          errors.push(`stats.${stat} 必須是數字`);
        }
      });
    }
    
    // 檢查屬性值有效性
    const validTypes = ['batter', 'support', 'spell', 'deathrattle'];
    if (card.type && !validTypes.includes(card.type)) {
      errors.push(`無效的類型: ${card.type}`);
    }
    
    const validAttributes = ['human', 'yin', 'yang', 'heaven', 'earth'];
    if (card.attribute && !validAttributes.includes(card.attribute)) {
      errors.push(`無效的屬性: ${card.attribute}`);
    }
    
    const validRarities = ['common', 'rare', 'legendary'];
    if (card.rarity && !validRarities.includes(card.rarity)) {
      errors.push(`無效的稀有度: ${card.rarity}`);
    }
    
    // 檢查數值合理性
    if (card.stats) {
      if (card.stats.attack < 0 || card.stats.attack > 100) {
        errors.push(`攻擊力超出合理範圍: ${card.stats.attack}`);
      }
      if (card.stats.crit < 0 || card.stats.crit > 200) {
        errors.push(`暴擊率超出合理範圍: ${card.stats.crit}`);
      }
      if (card.stats.hp_bonus < 0 || card.stats.hp_bonus > 50) {
        errors.push(`血量加成超出合理範圍: ${card.stats.hp_bonus}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 📊 獲取統計信息
   */
  static getStats() {
    if (!this.initialized) {
      return { total: 0, error: '未初始化' };
    }
    
    const stats = { 
      total: this.cards.size,
      byAttribute: {},
      byType: {},
      byRarity: {},
      powerLevels: [],
      averageStats: {
        attack: 0,
        crit: 0,
        hp_bonus: 0
      }
    };
    
    let totalAttack = 0;
    let totalCrit = 0;
    let totalHP = 0;
    
    for (const [cardId] of this.cards) {
      try {
        const card = this.create(cardId);
        
        // 統計分佈
        stats.byAttribute[card.attribute] = (stats.byAttribute[card.attribute] || 0) + 1;
        stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
        stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
        
        // 計算平均數值
        totalAttack += card.stats.attack;
        totalCrit += card.stats.crit;
        totalHP += card.stats.hp_bonus;
        
        // 添加到力量等級列表
        const powerLevel = this.calculatePowerLevel(card);
        stats.powerLevels.push({
          id: cardId,
          name: card.name,
          powerLevel
        });
        
      } catch (error) {
        console.warn(`統計時創建卡牌 ${cardId} 失敗:`, error);
      }
    }
    
    // 計算平均值
    if (this.cards.size > 0) {
      stats.averageStats.attack = Math.round(totalAttack / this.cards.size);
      stats.averageStats.crit = Math.round(totalCrit / this.cards.size);
      stats.averageStats.hp_bonus = Math.round(totalHP / this.cards.size);
    }
    
    // 排序力量等級
    stats.powerLevels.sort((a, b) => b.powerLevel - a.powerLevel);
    
    return stats;
  }

  /**
   * 💪 計算卡牌力量等級
   */
  static calculatePowerLevel(card) {
    const stats = card.stats;
    
    let score = 0;
    
    // 基礎分數計算
    score += stats.attack * 2;                    // 攻擊力權重最高
    score += (stats.crit / 100) * stats.attack;   // 暴擊按百分比計算
    score += stats.hp_bonus * 0.5;                // 血量加成
    
    // 效果加成
    if (card.effects && Object.keys(card.effects).length > 0) {
      score += 10; // 有效果的卡牌+10分
    }
    
    // 稀有度調整
    const rarityMultiplier = {
      'common': 1.0,
      'rare': 1.15,
      'legendary': 1.3
    };
    
    score *= rarityMultiplier[card.rarity] || 1.0;
    
    return Math.round(score);
  }

  /**
   * 🔍 獲取所有卡牌ID列表
   */
  static getAllCardIds() {
    return Array.from(this.cards.keys());
  }

  /**
   * 🎯 按屬性獲取卡牌
   */
  static getCardsByAttribute(attribute) {
    const cards = [];
    
    for (const [cardId] of this.cards) {
      try {
        const card = this.create(cardId);
        if (card.attribute === attribute) {
          cards.push(card);
        }
      } catch (error) {
        console.warn(`獲取卡牌 ${cardId} 失敗:`, error);
      }
    }
    
    return cards;
  }

  /**
   * 🎭 按類型獲取卡牌
   */
  static getCardsByType(type) {
    const cards = [];
    
    for (const [cardId] of this.cards) {
      try {
        const card = this.create(cardId);
        if (card.type === type) {
          cards.push(card);
        }
      } catch (error) {
        console.warn(`獲取卡牌 ${cardId} 失敗:`, error);
      }
    }
    
    return cards;
  }

  /**
   * 💎 按稀有度獲取卡牌
   */
  static getCardsByRarity(rarity) {
    const cards = [];
    
    for (const [cardId] of this.cards) {
      try {
        const card = this.create(cardId);
        if (card.rarity === rarity) {
          cards.push(card);
        }
      } catch (error) {
        console.warn(`獲取卡牌 ${cardId} 失敗:`, error);
      }
    }
    
    return cards;
  }

  /**
   * 🔍 搜索卡牌
   */
  static searchCards(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    for (const [cardId] of this.cards) {
      try {
        const card = this.create(cardId);
        
        // 搜索名稱、描述、屬性等
        const searchFields = [
          card.name,
          card.description,
          card.attribute,
          card.type,
          card.rarity,
          cardId
        ].map(field => field.toLowerCase());
        
        if (searchFields.some(field => field.includes(searchTerm))) {
          results.push(card);
        }
        
      } catch (error) {
        console.warn(`搜索時創建卡牌 ${cardId} 失敗:`, error);
      }
    }
    
    return results;
  }

  /**
   * 🎲 獲取隨機卡牌
   */
  static getRandomCard(filters = {}) {
    let cardIds = Array.from(this.cards.keys());
    
    // 應用過濾器
    if (filters.attribute) {
      cardIds = cardIds.filter(id => {
        try {
          const card = this.create(id);
          return card.attribute === filters.attribute;
        } catch {
          return false;
        }
      });
    }
    
    if (filters.type) {
      cardIds = cardIds.filter(id => {
        try {
          const card = this.create(id);
          return card.type === filters.type;
        } catch {
          return false;
        }
      });
    }
    
    if (filters.rarity) {
      cardIds = cardIds.filter(id => {
        try {
          const card = this.create(id);
          return card.rarity === filters.rarity;
        } catch {
          return false;
        }
      });
    }
    
    if (cardIds.length === 0) {
      return null;
    }
    
    const randomId = cardIds[Math.floor(Math.random() * cardIds.length)];
    return this.create(randomId);
  }

  /**
   * 🎮 創建測試牌組
   */
  static createTestDeck(deckType = 'balanced') {
    const testDecks = {
      balanced: [
        'president', 'president', 'kindness', 'hero', 'hero',
        'strongman', 'democracy', 'lottery', 'shadow_devour',
        'lone_shadow', 'evil_genius', 'yinyang_harmony',
        'holy_light', 'weapon_master', 'weapon_master'
      ],
      
      aggressive: [
        'hero', 'hero', 'hero', 'strongman', 'strongman',
        'lone_shadow', 'lone_shadow', 'evil_genius', 'evil_genius',
        'weapon_master', 'weapon_master', 'yinyang_harmony',
        'democracy', 'lottery', 'holy_light'
      ],
      
      control: [
        'kindness', 'kindness', 'democracy', 'democracy',
        'shadow_devour', 'shadow_devour', 'lottery', 'lottery',
        'holy_light', 'holy_light', 'president', 'president',
        'hero', 'strongman', 'weapon_master'
      ],
      
      human_tribal: [
        'president', 'president', 'president', 'kindness', 'kindness',
        'hero', 'hero', 'strongman', 'strongman', 'democracy',
        'democracy', 'lottery', 'lottery', 'holy_light', 'weapon_master'
      ]
    };

    const deckIds = testDecks[deckType] || testDecks.balanced;
    return deckIds.map(id => this.create(id));
  }

  /**
   * 📈 生成簡易報告
   */
  static generateSimpleReport() {
    const stats = this.getStats();
    
    return `
🎴 卡牌註冊表報告
===============
總卡牌數: ${stats.total}

屬性分佈:
${Object.entries(stats.byAttribute).map(([attr, count]) => 
  `  ${attr}: ${count}張`
).join('\n')}

類型分佈:
${Object.entries(stats.byType).map(([type, count]) => 
  `  ${type}: ${count}張`
).join('\n')}

稀有度分佈:
${Object.entries(stats.byRarity).map(([rarity, count]) => 
  `  ${rarity}: ${count}張`
).join('\n')}

平均數值:
  攻擊力: ${stats.averageStats.attack}
  暴擊率: ${stats.averageStats.crit}%
  血量加成: ${stats.averageStats.hp_bonus}

力量等級前3:
${stats.powerLevels.slice(0, 3).map((card, index) => 
  `  ${index + 1}. ${card.name} (${card.powerLevel}分)`
).join('\n')}
    `;
  }

  /**
   * 🔧 調試功能
   */
  static debug() {
    console.log('🔧 CardRegistry 調試信息:');
    console.log(`初始化狀態: ${this.initialized}`);
    console.log(`註冊卡牌數量: ${this.cards.size}`);
    console.log(`可用卡牌: ${this.getAllCardIds().join(', ')}`);
    
    // 測試創建所有卡牌
    let successCount = 0;
    let failCount = 0;
    
    for (const cardId of this.getAllCardIds()) {
      try {
        const card = this.create(cardId);
        console.log(`✅ ${cardId}: ${card.name} (${card.type}, ${card.attribute}, ${card.rarity})`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${cardId}: ${error.message}`);
        failCount++;
      }
    }
    
    console.log(`\n📊 測試結果: ${successCount} 成功, ${failCount} 失敗`);
    
    if (successCount > 0) {
      console.log('\n📈 快速統計:');
      console.log(this.generateSimpleReport());
    }
  }
}