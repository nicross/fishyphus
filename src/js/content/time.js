content.time = (() => {
  let time = 0

  return {
    add: function (value) {
      time += Number(value) || 0

      return this
    },
    export: () => time,
    import: function (value) {
      time = Number(value) || 0

      return this
    },
    reset: function () {
      time = 0

      return this
    },
    value: () => time,
  }
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused) {
    return
  }

  content.time.add(delta)
})

engine.state.on('export', (data) => data.time = content.time.export())
engine.state.on('import', ({time}) => content.time.import(time))
engine.state.on('reset', () => content.time.reset())
