// src/cards/collections/human/common/Hero.js
export class HeroCard {
  static create() {
    return {
      id: 'hero',
      name: '英雄',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 5,     // 低血量加成
        attack: 25,      // 高攻擊力
        crit: 50         // 高暴擊率
      },
      description: '無特殊效果的純粹戰士。',
      balanceNotes: '無效果的高數值卡，提供穩定輸出。攻擊和暴擊都很高。',
      designNotes: '經典的英雄形象，依靠純粹的力量和技巧戰鬥。',
      
      effects: {} // 無特殊效果，純數值卡
    };
  }
}