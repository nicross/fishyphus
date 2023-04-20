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
    table: function (count = 100) {
      const rows = []

      for (let i = 0; i < count; i += 1) {
        rows.push({
          rushBonus: this.rushBonus(i),
          spawnBonus: this.spawnBonus(i),
          startBonus: this.startBonus(i),
          stunBonus: this.stunBonus(i),
          weightBonus: this.weightBonus(i),
        })
      }

      return rows
    },
    // Bonuses
    rushBonus: (value = bonus) => {
      // Unlimited rush until player learns about it
      const tutorials = 2

      if (value < tutorials) {
        return 0
      }

      // Linear buffer zone, in meters
      return Math.min(
        30 + (value - tutorials),
        content.monster.dangerTime(),
      ) * content.monster.normalVelocity()
    },
    spawnBonus: (value = bonus) => {
      // Linear spawn until final tutorial
      const tutorials = 3

      if (value < tutorials) {
        return 1 + value
      }

      // Apply diminishing returns to spawn timer, in fish
      return tutorials + Math.floor(Math.log2(value - 1))
    },
    stunBonus: (value = bonus) => {
      // Stun is applied after the player learns about it
      const tutorials = 2

      if (value < tutorials) {
        return 0
      }

      // Calculate linear bonus, in seconds
      return Math.min(
        15 + (value - tutorials),
        content.monster.dangerTime(),
      )
    },
    startBonus: (value = bonus) => {
      // No bonuses until after tutorial
      const tutorials = 2

      if (value < tutorials) {
        return 0
      }

      // Calculate linear bonus, in meters
      return (value - tutorials) * content.monster.rushVelocity()
    },
    weightBonus: (value = bonus) => {
      // Avoid division by zero during tutorial
      const tutorials = 3

      if (value < tutorials) {
        return 2 + value
      }

      // Apply diminishing returns to weight bonus, in fish
      return 1 + value + Math.floor(Math.log2(1 + value))
    },
  }
})()

engine.state.on('export', (data) => data.bonus = content.bonus.export())
engine.state.on('import', ({bonus}) => content.bonus.import(bonus))
engine.state.on('reset', () => content.bonus.reset())
