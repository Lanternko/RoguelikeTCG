// src/cards/CardRegistry.js - 增強版，包含更多法術卡

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
      this.registerAdditionalSpells(); // 新增更多法術卡
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
   * ✨ 註冊額外法術卡
   */
  static registerAdditionalSpells() {
    // 註冊更多法術卡來豐富遊戲體驗
    this.registerCard('culture', this.createCultureCard);
    this.registerCard('patience', this.createPatienceCard);
    this.registerCard('unity', this.createUnityCard);
    this.registerCard('communism', this.createCommunismCard);
    this.registerCard('head_pat', this.createHeadPatCard);
    
    console.log('✨ 額外法術卡註冊完成');
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
      
      // 如果是函數，直接調用；如果是類，調用 create 方法
      const card = typeof CardClass === 'function' && CardClass.name.startsWith('create') 
        ? CardClass() 
        : CardClass.create();
      
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
      // 基礎人屬性卡牌 (6張)
      'hero', 'hero', 'kindness', 'kindness',
      'president', 'strongman',
      
      // 法術卡 (6張) - 大幅增加
      'lottery', 'lottery', 'culture', 'culture',
      'unity', 'patience',
      
      // 混合屬性 (3張)
      'shadow_devour', 'holy_light', 'democracy'
    ];
  }

  /**
   * 🎯 創建人類主題牌組
   */
  static createHumanThemeDeck() {
    const template = this.getHumanThemeDeckTemplate();
    return template.map(cardId => this.create(cardId));
  }

  // ===== 額外法術卡創建函數 =====

  /**
   * 📖 文化脈絡卡
   */
  static createCultureCard() {
    return {
      id: 'culture',
      name: '文化脈絡',
      type: 'spell',
      attribute: 'human',
      rarity: 'common',
      stats: { hp_bonus: 12, attack: 0, crit: 0 },
      description: '抽1張任意卡牌',
      effects: {
        on_play: async function(gameState) {
          if (gameState.player.deck.length > 0) {
            const drawnCard = gameState.player.deck.pop();
            gameState.player.hand.push(drawnCard);
            return { success: true, description: `抽到了 ${drawnCard.name}` };
          }
          return { success: false, reason: '牌庫為空' };
        }
      }
    };
  }

  /**
   * 🛡️ 忍耐卡
   */
  static createPatienceCard() {
    return {
      id: 'patience',
      name: '忍耐',
      type: 'spell',
      attribute: 'human',
      rarity: 'common',
      stats: { hp_bonus: 10, attack: 0, crit: 0 },
      description: '本回合減少10點所受傷害',
      effects: {
        on_play: async function(gameState) {
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'damage_reduction',
            value: 10,
            source: this.name
          });
          return { success: true, description: '本回合減少10點所受傷害' };
        }
      }
    };
  }

  /**
   * 🤝 團結卡
   */
  static createUnityCard() {
    return {
      id: 'unity',
      name: '團結',
      type: 'spell',
      attribute: 'human',
      rarity: 'common',
      stats: { hp_bonus: 11, attack: 0, crit: 0 },
      description: '此回合中，你所有的人屬性打者卡攻擊力+8',
      effects: {
        on_play: async function(gameState) {
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'human_batter_attack_boost',
            value: 8,
            source: this.name
          });
          return { success: true, description: '人屬性打者卡攻擊力+8' };
        }
      }
    };
  }

  /**
   * ⚖️ 共產主義卡
   */
  static createCommunismCard() {
    return {
      id: 'communism',
      name: '共產主義',
      type: 'spell',
      attribute: 'human',
      rarity: 'rare',
      stats: { hp_bonus: 10, attack: 0, crit: 0 },
      description: '若我方血量低於敵方，則回復血量至與敵方相同',
      effects: {
        on_play: async function(gameState) {
          const playerHP = gameState.player.current_hp;
          const enemyHP = gameState.pitcher.current_hp;
          
          if (playerHP < enemyHP) {
            const healAmount = Math.min(enemyHP - playerHP, gameState.player.max_hp - playerHP);
            gameState.player.current_hp += healAmount;
            return { success: true, description: `回復${healAmount}點血量，追平敵方` };
          }
          return { success: false, reason: '血量不低於敵方' };
        }
      }
    };
  }

  /**
   * 🤗 摸頭卡
   */
  static createHeadPatCard() {
    return {
      id: 'head_pat',
      name: '摸頭',
      type: 'spell',
      attribute: 'human',
      rarity: 'legendary',
      stats: { hp_bonus: 15, attack: 0, crit: 0 },
      description: '抽3張卡。其中每抽到一張人屬性卡，該卡+5攻擊力',
      effects: {
        on_play: async function(gameState) {
          let drawnCards = [];
          let humanCardsBoosted = 0;
          
          for (let i = 0; i < 3 && gameState.player.deck.length > 0; i++) {
            const drawnCard = gameState.player.deck.pop();
            gameState.player.hand.push(drawnCard);
            drawnCards.push(drawnCard.name);
            
            if (drawnCard.attribute === 'human') {
              drawnCard.permanentBonus = drawnCard.permanentBonus || {};
              drawnCard.permanentBonus.attack = (drawnCard.permanentBonus.attack || 0) + 5;
              humanCardsBoosted++;
            }
          }
          
          return { 
            success: true, 
            description: `抽到${drawnCards.length}張卡，${humanCardsBoosted}張人屬卡+5攻擊力` 
          };
        }
      }
    };
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