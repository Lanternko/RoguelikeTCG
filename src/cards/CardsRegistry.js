// cards/CardRegistry.js
import { PresidentCard } from './collections/human/common/President.js';
import { KindnessCard } from './collections/human/common/Kindness.js';
import { BenevolentLegacyCard } from './collections/human/rare/BenevolentLegacy.js';
import { ShadowDevourCard } from './collections/yin/common/ShadowDevour.js';
import { YinYangHarmonyCard } from './collections/yang/rare/YinYangHarmony.js';
// ... 其他卡牌 import

export class CardRegistry {
  static cards = new Map();
  
  static initialize() {
    console.log('🃏 註冊卡牌系統 v9...');
    
    // 🔴 人屬 - 普通
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
    
    // 🔴 人屬 - 稀有
    this.register('help_stream', HelpStreamCard);
    this.register('benevolent_legacy', BenevolentLegacyCard);
    this.register('communism', CommunismCard);
    this.register('multiculture', MulticultureCard);
    this.register('prosperity', ProsperityCard);
    
    // 🔴 人屬 - 傳說
    this.register('master', MasterCard);
    this.register('head_pat', HeadPatCard);
    
    // ⚫️ 陰屬
    this.register('shadow_devour', ShadowDevourCard);
    this.register('lone_shadow', LoneShadowCard);
    this.register('evil_genius', EvilGeniusCard);
    this.register('ambush', AmbushCard);
    this.register('time_stop', TimeStopCard);
    
    // ⚪️ 陽屬
    this.register('weapon_master', WeaponMasterCard);
    this.register('holy_light', HolyLightCard);
    this.register('late_game', LateGameCard);
    this.register('yinyang_harmony', YinYangHarmonyCard);
    this.register('resurrection', ResurrectionCard);
    
    console.log(`✅ 已註冊 ${this.cards.size} 張卡牌`);
  }
  
  static register(id, cardClass) {
    this.cards.set(id, cardClass);
  }
  
  static create(id) {
    const CardClass = this.cards.get(id);
    if (!CardClass) {
      throw new Error(`未找到卡牌: ${id}`);
    }
    return CardClass.create();
  }
  
  // 根據屬性獲取卡牌
  static getCardsByAttribute(attribute) {
    return Array.from(this.cards.entries())
      .filter(([id, cardClass]) => {
        const card = cardClass.create();
        return card.attribute === attribute;
      })
      .map(([id]) => id);
  }
  
  // 根據稀有度獲取卡牌
  static getCardsByRarity(rarity) {
    return Array.from(this.cards.entries())
      .filter(([id, cardClass]) => {
        const card = cardClass.create();
        return card.rarity === rarity;
      })
      .map(([id]) => id);
  }
  
  // 根據類型獲取卡牌
  static getCardsByType(type) {
    return Array.from(this.cards.entries())
      .filter(([id, cardClass]) => {
        const card = cardClass.create();
        return card.type === type;
      })
      .map(([id]) => id);
  }
}