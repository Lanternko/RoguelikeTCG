// src/cards/CardRegistry.js - 確保正確的 ES6 導出格式

import { PresidentCard } from './collections/human/common/President.js';
import { KindnessCard } from './collections/human/common/Kindness.js';
import { HeroCard } from './collections/human/common/Hero.js';
import { LotteryCard } from './collections/human/common/Lottery.js';
import { StrongmanCard } from './collections/human/common/Strongman.js';
import { DemocracyCard } from './collections/human/common/Democracy.js';

// 陰陽輔助卡
import { ShadowDevourCard } from './collections/yin/common/ShadowDevour.js';
import { EvilGeniusCard } from './collections/yin/rare/EvilGenius.js';
import { HolyLightCard } from './collections/yang/common/HolyLight.js';

/**
 * 🎴 卡牌註冊表
 * 統一管理所有卡牌的創建和驗證
 */
export class CardRegistry {
  static cards = new Map();
  static initialized = false;

  /**
   * 🚀 初始化卡牌註冊表
   */
  static async initialize() {
    console.log('🔧 初始化人類主題卡牌庫...');
    
    try {
      this.registerHumanThemeCards();
      this.initialized = true;
      console.log(`✅ 人類主題卡牌庫初始化完成，共 ${this.cards.size} 張卡牌`);
      
      this.validateAllCards();
      
    } catch (error) {
      console.error('❌ 卡牌註冊表初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 📝 註冊人類主題卡牌
   */
  static registerHumanThemeCards() {
    // 👥 人類核心卡牌
    this.registerCard('president', PresidentCard);
    this.registerCard('kindness', KindnessCard);
    this.registerCard('hero', HeroCard);
    this.registerCard('lottery', LotteryCard);
    this.registerCard('strongman', StrongmanCard);
    this.registerCard('democracy', DemocracyCard);
    
    // 🌙 陰屬性輔助
    this.registerCard('shadow_devour', ShadowDevourCard);
    this.registerCard('evil_genius', EvilGeniusCard);
    
    // ☀️ 陽屬性輔助
    this.registerCard('holy_light', HolyLightCard);
    
    console.log('📚 人類主題卡牌註冊完成');
  }

  /**
   * 📋 註冊單張卡牌
   */
  static registerCard(id, cardClass) {
    this.cards.set(id, cardClass);
    console.log(`✅ 註冊卡牌: ${id}`);
  }

  /**
   * 🎴 創建卡牌實例
   */
  static create(cardId) {
    if (!this.initialized) {
      throw new Error('CardRegistry 尚未初始化');
    }
    
    if (!this.cards.has(cardId)) {
      throw new Error(`卡牌 ${cardId} 不存在。可用卡牌: ${Array.from(this.cards.keys()).join(', ')}`);
    }
    
    try {
      const CardClass = this.cards.get(cardId);
      const card = CardClass.create();
      
      if (card.id !== cardId) {
        card.id = cardId;
      }
      
      return card;
      
    } catch (error) {
      console.error(`❌ 創建卡牌 ${cardId} 失敗:`, error);
      throw new Error(`創建卡牌 ${cardId} 失敗: ${error.message}`);
    }
  }

  /**
   * 🔍 驗證所有卡牌
   */
  static validateAllCards() {
    console.log('🔍 驗證人類主題卡牌...');
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const [cardId] of this.cards) {
      try {
        const card = this.create(cardId);
        if (this.validateCard(card).isValid) {
          validCount++;
        } else {
          invalidCount++;
        }
      } catch (error) {
        invalidCount++;
        console.error(`❌ ${cardId}: ${error.message}`);
      }
    }
    
    console.log(`✅ 驗證完成: ${validCount} 張有效, ${invalidCount} 張無效`);
  }

  /**
   * ✅ 驗證單張卡牌
   */
  static validateCard(card) {
    const errors = [];
    
    const required = ['id', 'name', 'type', 'attribute', 'rarity', 'stats', 'description'];
    required.forEach(field => {
      if (!card[field]) {
        errors.push(`缺少必要屬性: ${field}`);
      }
    });
    
    if (card.stats) {
      if (typeof card.stats.attack !== 'number' || card.stats.attack < 0) {
        errors.push('攻擊力必須是非負數字');
      }
      if (typeof card.stats.crit !== 'number' || card.stats.crit < 0) {
        errors.push('暴擊率必須是非負數字');
      }
      if (typeof card.stats.hp_bonus !== 'number' || card.stats.hp_bonus < 0) {
        errors.push('血量加成必須是非負數字');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * 📋 獲取所有卡牌ID
   */
  static getAllCardIds() {
    return Array.from(this.cards.keys());
  }

  /**
   * 🎴 獲取人類主題牌組模板
   */
  static getHumanThemeDeckTemplate() {
    return [
      'president', 'president',        // 總統 x2
      'kindness', 'kindness',          // 慈愛 x2
      'hero', 'hero', 'hero',          // 英雄 x3
      'strongman', 'strongman',        // 壯漢 x2
      'democracy',                     // 民主 x1
      'lottery', 'lottery',            // 樂透 x2
      'shadow_devour',                 // 暗影吞噬 x1
      'evil_genius',                   // 邪惡天才 x1
      'holy_light'                     // 聖光 x1
    ];
  }

  /**
   * 🎯 創建人類主題牌組
   */
  static createHumanThemeDeck() {
    const template = this.getHumanThemeDeckTemplate();
    return template.map(cardId => this.create(cardId));
  }

  /**
   * 📊 分析牌組
   */
  static getDeckAnalysis(deck) {
    const analysis = {
      totalCards: deck.length,
      byAttribute: {},
      byType: {},
      averageAttack: 0,
      averageCrit: 0,
      totalHP: 0
    };
    
    let totalAttack = 0;
    let totalCrit = 0;
    
    deck.forEach(card => {
      // 屬性統計
      analysis.byAttribute[card.attribute] = (analysis.byAttribute[card.attribute] || 0) + 1;
      
      // 類型統計
      analysis.byType[card.type] = (analysis.byType[card.type] || 0) + 1;
      
      // 數值累計
      totalAttack += card.stats.attack;
      totalCrit += card.stats.crit;
      analysis.totalHP += card.stats.hp_bonus;
    });
    
    if (deck.length > 0) {
      analysis.averageAttack = Math.round(totalAttack / deck.length);
      analysis.averageCrit = Math.round(totalCrit / deck.length);
    }
    
    return analysis;
  }

  /**
   * 🔧 調試信息
   */
  static debug() {
    console.log('🔧 人類主題卡牌庫調試信息:');
    console.log(`初始化狀態: ${this.initialized}`);
    console.log(`註冊卡牌數量: ${this.cards.size}`);
    console.log(`可用卡牌: ${this.getAllCardIds().join(', ')}`);
    
    // 創建並分析範例牌組
    try {
      const deck = this.createHumanThemeDeck();
      const analysis = this.getDeckAnalysis(deck);
      
      console.log('\n📊 人類主題牌組分析:');
      console.log(`總卡牌: ${analysis.totalCards}張`);
      console.log(`屬性分佈:`, analysis.byAttribute);
      console.log(`類型分佈:`, analysis.byType);
      console.log(`平均攻擊力: ${analysis.averageAttack}`);
      console.log(`平均暴擊率: ${analysis.averageCrit}%`);
      console.log(`總血量加成: ${analysis.totalHP}`);
      
    } catch (error) {
      console.error('❌ 牌組分析失敗:', error);
    }
  }
}