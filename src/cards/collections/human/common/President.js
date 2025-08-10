// src/cards/collections/human/common/President.js - 修復版

export class PresidentCard {
  static create() {
    return {
      id: 'president',
      name: '總統',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 15,    // 中等血量加成
        attack: 20,      // 基礎攻擊，配合動態加成
        crit: 30         // 中等暴擊率
      },
      description: '打擊：每有一張人屬性卡，攻擊力+1。',
      balanceNotes: '後期變強的成長型卡牌，需要構築支持。人屬性越多越強。',
      designNotes: '代表領導力，團結人心的力量會隨著追隨者增加而增強。',
      
      effects: {
        on_strike: async function(gameState) {
          console.log('⚔️ 總統打擊效果觸發');
          
          // 計算所有人屬性卡牌數量（手牌 + 棄牌堆 + 場上）
          let humanCount = 0;
          
          // 手牌中的人屬性卡
          if (gameState.player.hand) {
            gameState.player.hand.forEach(card => {
              if (card.attribute === 'human') {
                humanCount++;
              }
            });
          }
          
          // 棄牌堆中的人屬性卡
          if (gameState.player.discard_pile) {
            gameState.player.discard_pile.forEach(card => {
              if (card.attribute === 'human') {
                humanCount++;
              }
            });
          }
          
          // 場上其他區域的人屬性卡
          ['support_zone', 'spell_zone'].forEach(zone => {
            const card = gameState.player[zone];
            if (card && card.attribute === 'human') {
              humanCount++;
            }
          });
          
          // 自己也算一張人屬性卡
          humanCount++;
          
          console.log(`📊 總統統計結果:
          - 手牌人屬性: ${gameState.player.hand?.filter(c => c.attribute === 'human').length || 0}
          - 棄牌堆人屬性: ${gameState.player.discard_pile?.filter(c => c.attribute === 'human').length || 0}
          - 場上人屬性: ${['support_zone', 'spell_zone'].filter(zone => gameState.player[zone]?.attribute === 'human').length}
          - 總統自己: 1
          - 總計: ${humanCount}`);
          
          // 應用臨時攻擊力加成
          this.tempAttack = (this.tempAttack || 0) + humanCount;
          
          console.log(`✅ ${this.name} 獲得 +${humanCount} 攻擊力加成，總臨時加成: ${this.tempAttack}`);
          
          return { 
            success: true,
            description: `人屬性卡數量: ${humanCount}，攻擊力+${humanCount}` 
          };
        }
      }
    };
  }
}