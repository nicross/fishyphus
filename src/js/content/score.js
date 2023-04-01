content.score = (() => {
  let score = 0

  return {
    export: function () {
      return score
    },
    import: function (value = 0) {
      score = Number(value) || 0

      return this
    },
    increment: function () {
      score += 1

      return this
    },
    reset: function () {
      score = 0

      return this
    },
    value: () => score,
  }
})()

engine.state.on('export', (data) => data.score = content.score.export())
engine.state.on('import', ({score}) => content.score.import(score))
engine.state.on('reset', () => content.score.reset())
