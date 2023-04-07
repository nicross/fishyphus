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
    stunBonus: () => 5 * bonus, // seconds
    startBonus: () => 5 * bonus * content.monster.normalVelocity(), // meters
  }
})()

engine.state.on('export', (data) => data.bonus = content.bonus.export())
engine.state.on('import', ({bonus}) => content.bonus.import(bonus))
engine.state.on('reset', () => content.bonus.reset())
