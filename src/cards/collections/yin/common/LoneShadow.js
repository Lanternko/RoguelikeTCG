// src/cards/collections/yin/common/LoneShadow.js
export class LoneShadowCard {
  static create() {
    return {
      id: 'lone_shadow',
      name: '孤影',
      type: 'batter',
      attribute: 'yin',
      rarity: 'common',
      stats: {
        hp_bonus: 6,     // 極低血量
        attack: 22,      // 中等攻擊
        crit: 80         // 極高暴擊！
      },
      description: '高暴擊率的刺客型卡牌。',
      balanceNotes: '極端刺客卡，高暴擊補償低基礎傷害。非常脆弱但爆發力驚人。',
      designNotes: '孤獨的刺客，一擊必殺但自身防護極弱，體現刺客的特質。',
      
      effects: {} // 純數值的極端化卡牌
    };
  }
}