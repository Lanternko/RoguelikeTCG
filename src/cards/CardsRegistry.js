// 1. 修復 src/cards/CardRegistry.js - 導入路徑和遺漏的卡牌類
import { PresidentCard } from './collections/human/common/President.js';
import { KindnessCard } from './collections/human/common/Kindness.js';
import { HeroCard } from './collections/human/common/Hero.js';
import { LotteryCard } from './collections/human/common/Lottery.js';
import { StrongmanCard } from './collections/human/common/Strongman.js';
import { DemocracyCard } from './collections/human/common/Democracy.js';
import { CultureCard } from './collections/human/common/Culture.js';
import { PatienceCard } from './collections/human/common/Patience.js';
import { UnityCard } from './collections/human/common/Unity.js';
import { LegacyCard } from './collections/human/common/Legacy.js';
import { SimpleFolkCard } from './collections/human/common/SimpleFolk.js';
import { FleshCard } from './collections/human/common/Flesh.js';
import { InheritanceCard } from './collections/human/common/Inheritance.js';

// 人屬性稀有卡牌
import { HelpStreamCard } from './collections/human/rare/HelpStream.js';
import { BenevolentLegacyCard } from './collections/human/rare/BenevolentLegacy.js';
import { CommunismCard } from './collections/human/rare/Communism.js';
import { MulticultureCard } from './collections/human/rare/Multiculture.js';
import { ProsperityCard } from './collections/human/rare/Prosperity.js';

// 人屬性傳說卡牌
import { MasterCard } from './collections/human/legendary/Master.js';
import { HeadPatCard } from './collections/human/legendary/HeadPat.js';

// 陰屬性卡牌
import { ShadowDevourCard } from './collections/yin/ShadowDevour.js';
import { LoneShadowCard } from './collections/yin/LoneShadow.js';
import { EvilGeniusCard } from './collections/yin/EvilGenius.js';
import { AmbushCard } from './collections/yin/Ambush.js';
import { TimeStopCard } from './collections/yin/TimeStop.js';

// 陽屬性卡牌
import { WeaponMasterCard } from './collections/yang/WeaponMaster.js';
import { HolyLightCard } from './collections/yang/HolyLight.js';
import { LateGameCard } from './collections/yang/LateGame.js';
import { YinYangHarmonyCard } from './collections/yang/YinYangHarmony.js';
import { ResurrectionCard } from './collections/yang/Resurrection.js';

export class CardRegistry {
  static cards = new Map();
  static initialized = false;
  
  static initialize() {
    if (this.initialized) {
      console.log('🃏 卡牌註冊系統已初始化');
      return;
    }
    
    console.log('🃏 初始化卡牌註冊系統 v9...');
    
    try {
      // 🔴 人屬 - 普通 (13張)
      this.register('president', PresidentCard);
      this.register('kindness', KindnessCard);
      this.register('hero', HeroCard);
      this.register('lottery', LotteryCard);
      this.register('strongman', StrongmanCard);
      this.register('democracy', DemocracyCard);
      this.register('culture', CultureCard);
      this.register('patience', PatienceCard);
      this.register('unity', UnityCard);
      this.register('legacy', LegacyCard);
      this.register('simple_folk', SimpleFolkCard);
      this.register('flesh', FleshCard);
      this.register('inheritance', InheritanceCard);
      
      // 🔴 人屬 - 稀有 (5張)
      this.register('help_stream', HelpStreamCard);
      this.register('benevolent_legacy', BenevolentLegacyCard);
      this.register('communism', CommunismCard);
      this.register('multiculture', MulticultureCard);
      this.register('prosperity', ProsperityCard);
      
      // 🔴 人屬 - 傳說 (2張)
      this.register('master', MasterCard);
      this.register('head_pat', HeadPatCard);
      
      // ⚫️ 陰屬 (5張)
      this.register('shadow_devour', ShadowDevourCard);
      this.register('lone_shadow', LoneShadowCard);
      this.register('evil_genius', EvilGeniusCard);
      this.register('ambush', AmbushCard);
      this.register('time_stop', TimeStopCard);
      
      // ⚪️ 陽屬 (5張)
      this.register('weapon_master', WeaponMasterCard);
      this.register('holy_light', HolyLightCard);
      this.register('late_game', LateGameCard);
      this.register('yinyang_harmony', YinYangHarmonyCard);
      this.register('resurrection', ResurrectionCard);
      
      this.initialized = true;
      console.log(`✅ 成功註冊 ${this.cards.size} 張卡牌`);
      
      // 驗證所有卡牌
      this.validateAllCards();
      
    } catch (error) {
      console.error('❌ 卡牌註冊初始化失敗:', error);
      throw error;
    }
  }
  
  static register(id, cardClass) {
    if (this.cards.has(id)) {
      console.warn(`⚠️ 卡牌 ${id} 已存在，將被覆蓋`);
    }
    
    this.cards.set(id, cardClass);
    
    // 驗證卡牌類是否有效
    try {
      const testCard = cardClass.create();
      if (!testCard.id || !testCard.name || !testCard.type) {
        throw new Error(`卡牌 ${id} 缺少必要屬性`);
      }
    } catch (error) {
      console.error(`❌ 卡牌 ${id} 驗證失敗:`, error);
    }
  }
  
  static create(id) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const CardClass = this.cards.get(id);
    if (!CardClass) {
      console.error(`❌ 未找到卡牌: ${id}`);
      throw new Error(`未找到卡牌: ${id}`);
    }
    
    try {
      const card = CardClass.create();
      card.cardId = id; // 添加註冊ID
      return card;
    } catch (error) {
      console.error(`❌ 創建卡牌 ${id} 失敗:`, error);
      throw error;
    }
  }
  
  // 批量創建卡牌
  static createMultiple(cardIds) {
    return cardIds.map(id => this.create(id));
  }
  
  // 根據屬性獲取卡牌ID列表
  static getCardsByAttribute(attribute) {
    const result = [];
    
    for (const [id, cardClass] of this.cards.entries()) {
      try {
        const card = cardClass.create();
        if (card.attribute === attribute) {
          result.push(id);
        }
      } catch (error) {
        console.warn(`⚠️ 檢查卡牌 ${id} 屬性時出錯:`, error);
      }
    }
    
    return result;
  }
  
  // 獲取詳細統計
  static getStats() {
    const stats = {
      total: this.cards.size,
      byAttribute: {},
      byType: {},
      byRarity: {}
    };
    
    for (const [id, cardClass] of this.cards.entries()) {
      try {
        const card = cardClass.create();
        
        stats.byAttribute[card.attribute] = (stats.byAttribute[card.attribute] || 0) + 1;
        stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
        stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
        
      } catch (error) {
        console.warn(`⚠️ 統計卡牌 ${id} 時出錯:`, error);
      }
    }
    
    return stats;
  }
  
  // 驗證所有卡牌
  static validateAllCards() {
    console.log('🔍 驗證所有卡牌...');
    
    let validCount = 0;
    let errorCount = 0;
    
    for (const [id, cardClass] of this.cards.entries()) {
      try {
        const card = cardClass.create();
        
        const requiredProps = ['id', 'name', 'type', 'attribute', 'rarity', 'stats', 'description'];
        const missingProps = requiredProps.filter(prop => !card[prop]);
        
        if (missingProps.length > 0) {
          console.error(`❌ 卡牌 ${id} 缺少屬性:`, missingProps);
          errorCount++;
        } else {
          validCount++;
        }
        
      } catch (error) {
        console.error(`❌ 卡牌 ${id} 驗證失敗:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ 驗證完成: ${validCount} 張有效，${errorCount} 張錯誤`);
  }
  
  // 獲取所有註冊的卡牌ID
  static getAllCardIds() {
    return Array.from(this.cards.keys());
  }
  
  // 檢查卡牌是否存在
  static hasCard(id) {
    return this.cards.has(id);
  }
}