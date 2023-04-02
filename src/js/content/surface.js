content.surface = (() => {
  const fields = []

  return {
    import: function () {
      for (let [seed, scale, scaleT, scaleZ] of [
        ['surface0', 40, 16, 4],
        ['surface1', 30, 8, 3],
        ['surface2', 20, 4, 2],
        ['surface3', 10, 2, 1],
      ]) {
        const field = engine.fn.createNoise({
          seed,
          octaves: 2,
          type: 'simplex3d',
        })

        engine.ephemera.add(field)

        scale = 1 / scale * engine.tool.simplex3d.prototype.skewFactor
        scaleT = 1 / scaleT * engine.tool.simplex3d.prototype.skewFactor

        fields.push({
          field,
          value: (x, y, t) => {
            return field.value(
              x * scale,
              y * scale * 0.5,
              t * scaleT
            ) * scaleZ
          },
        })
      }

      return this
    },
    reset: function () {
      for (const field of fields) {
        engine.ephemera.remove(field.field)
      }

      fields.length = 0

      return this
    },
    value: ({
      x = 0,
      y = 0,
    } = {}) => {
      const t = content.time.value()
      let value = 0

      for (const field of fields) {
        value += field.value(x, y, t)
      }

      return value
    },
  }
})()

engine.state.on('import', () => content.surface.import())
engine.state.on('reset', () => content.surface.reset())
