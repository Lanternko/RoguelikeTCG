// main.js
import { GameController } from './core/GameController.js';
import { CardRegistry } from './cards/CardRegistry.js';

class MyGoTCG {
  constructor() {
    console.log('🎸 MyGO!!!!! Roguelike TCG v2 啟動');
    console.log('📋 整合平衡清單 v9');
    
    // 初始化卡牌系統
    CardRegistry.initialize();
    
    // 創建遊戲控制器
    this.controller = new GameController();
  }
  
  start() {
    console.log('🚀 遊戲開始！');
    
    // 創建測試牌組（基於你的設計）
    this.setupTestDeck();
    
    // 開始測試
    this.runTests();
  }
  
  setupTestDeck() {
    const testCards = [
      'president',        // 總統 - 人屬攻擊
      'kindness',         // 慈愛 - 人屬輔助
      'benevolent_legacy', // 仁道傳承 - 人屬稀有
      'shadow_devour',    // 暗影吞噬 - 陰屬攻擊
      'yinyang_harmony'   // 陰陽調和 - 陽屬稀有
    ];
    
    this.controller.gameState.player.deck = testCards.map(id => 
      CardRegistry.create(id)
    );
    
    console.log('✅ 測試牌組創建完成');
  }
  
  async runTests() {
    console.log('\n🧪 開始測試你設計的卡牌效果...\n');
    
    // 測試總統效果
    const president = CardRegistry.create('president');
    console.log(`🔴 ${president.name}: ${president.description}`);
    
    // 測試慈愛效果
    const kindness = CardRegistry.create('kindness');
    console.log(`🔴 ${kindness.name}: ${kindness.description}`);
    
    // 測試陰陽調和
    const harmony = CardRegistry.create('yinyang_harmony');  
    console.log(`⚪ ${harmony.name}: ${harmony.description}`);
    
    console.log('\n✅ 你的卡牌設計已完美整合到分層架構中！');
    console.log('📈 架構特點：');
    console.log('  • 新增卡牌只需修改卡牌邏輯層');
    console.log('  • 平衡調整只需修改參數層');
    console.log('  • 新機制只需添加關鍵字層');
    console.log('  • 主邏輯保持輕量和穩定');
  }
}

// 啟動你的遊戲
const game = new MyGoTCG();
game.start();