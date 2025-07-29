// 需要在 core/GameState.js 中完善
export class GameState {
  constructor() {
    this.player = {
      current_hp: 100,
      max_hp: 100,
      deck: [],
      hand: [],
      discard_pile: [],
      strike_zone: [],    // 打擊區 (最多1張)
      support_zone: [],   // 輔助區 (最多1張)
      spell_zone: [],     // 法術區 (最多1張)
      active_buffs: []
    };
    
    this.pitcher = {
      current_hp: 150,
      max_hp: 150,
      base_attack: 30,
      current_attack: 30,
      attribute: "天",
      active_debuffs: []
    };
    
    this.gamePhase = 'DRAW_PHASE'; // 'DRAW_PHASE', 'PLAY_PHASE', 'COMBAT_PHASE'
  }
}