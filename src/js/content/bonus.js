content.bonus = (() => {
  const tutorials = 4 // 1-indexed

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
      if (bonus < tutorials) {
        return 0
      }

      // Otherwise provide a growing buffer zone
      return Math.min(30 + ((bonus - (tutorials - 1)) * 5), content.monster.dangerTime()) * content.monster.normalVelocity() // meters
    },
    spawnBonus: () => 1 + Math.min(bonus, tutorials - 1) + Math.floor(Math.log2(1 + Math.max(0, bonus - tutorials))), // fish
    stunBonus: () => 15 + (bonus - (tutorials - 1)), // seconds per stun
    startBonus: () => (bonus - (tutorials - 1)) * content.monster.rushVelocity(), // meters below danger distance
    weightBonus: () => 3 + (bonus - (tutorials - 1)), // fish
  }
})()

engine.state.on('export', (data) => data.bonus = content.bonus.export())
engine.state.on('import', ({bonus}) => content.bonus.import(bonus))
engine.state.on('reset', () => content.bonus.reset())
