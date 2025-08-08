// src/cards/collections/heaven/rare/WeaponMaster.js
export class WeaponMasterCard {
  static create() {
    return {
      id: 'weapon_master',
      name: '武器大師',
      type: 'batter',
      attribute: 'heaven',
      rarity: 'rare',
      stats: {
        hp_bonus: 15,    // 平衡的血量加成
        attack: 32,      // 高攻擊力
        crit: 40         // 中等暴擊
      },
      description: '平衡的戰士型卡牌。',
      balanceNotes: '稀有卡的標準數值模板。無特殊效果但數值優秀，可靠的輸出。',
      designNotes: '精通各種武器的大師，技藝高超但沒有特殊的超自然能力。',
      
      effects: {} // 純數值稀有卡，展現稀有度帶來的數值優勢
    };
  }
}