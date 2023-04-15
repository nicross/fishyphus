content.bonus = (() => {
  let bonus = 0

  return {
    export: function () {
      return bonus
    },
    import: function (value = 0) {
      bonus = Number(value) || 0
      bonus = Math.max(0, bonus)

      return this
    },
    reset: function () {
      bonus = 0

      return this
    },
    // Bonuses
    rushBonus: () => {
      // Kill player no matter what
      if (!bonus) {
        return 0
      }

      // Otherwise provide a growing buffer zone
      return (30 + bonus) * content.monster.normalVelocity() // meters
    },
    spawnBonus: () => 1 + Math.floor(Math.log2(1 + bonus)), // fish
    stunBonus: () => 15 + bonus, // seconds per stun
    startBonus: () => bonus * content.monster.rushVelocity(), // meters below danger distance
    weightBonus: () => 3 + bonus, // fish
  }
})()

engine.state.on('export', (data) => data.bonus = content.bonus.export())
engine.state.on('import', ({bonus}) => content.bonus.import(bonus))
engine.state.on('reset', () => content.bonus.reset())
