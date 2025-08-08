// src/cards/collections/human/common/Strongman.js
export class StrongmanCard {
  static create() {
    return {
      id: 'strongman',
      name: '壯漢',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 20,    // 高血量加成，符合壯漢形象
        attack: 30,      // 高攻擊力
        crit: 20         // 低暴擊，穩定型
      },
      description: '高攻擊力，低暴擊的穩定輸出。',
      balanceNotes: '坦克型打者，穩定但缺乏爆發。血量和攻擊都高，但暴擊低。',
      designNotes: '體格強壯的戰士，力大無窮但動作較為笨重，不易打出精準攻擊。',
      
      effects: {} // 純數值卡，體現穩定強壯的特質
    };
  }
}