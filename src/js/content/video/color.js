content.video.color = (() => {
  const colors = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  const defaultParameters = {
    hueOffset0: 0,
    hueOffset1: 0,
    hueOffset2: 0,
  }

  let parameters = {...defaultParameters}

  function hsl2rgb({h = 0, s = 0, l = 0} = {}) {
    let r, g, b

    h = engine.fn.wrap(h)

    if (s) {
      const convert = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = convert(p, q, h + 1/3)
      g = convert(p, q, h)
      b = convert(p, q, h - 1/3)
    } else {
      r = g = b = l
    }

    return {
      r: engine.fn.clamp(Math.floor(r * 256), 0, 255),
      g: engine.fn.clamp(Math.floor(g * 256), 0, 255),
      b: engine.fn.clamp(Math.floor(b * 256), 0, 255),
    }
  }

  function toFloat({r, g, b}) {
    return [
      r / 255,
      g / 255,
      b / 255,
    ]
  }

  return {
    get: (index) => colors[index],
    load: function () {
      const srand = engine.fn.srand('color')

      parameters = {
        ...defaultParameters,
        hueOffset0: srand(),
        hueOffset1: srand(),
        hueOffset2: srand(),
      }

      return this
    },
    unload: function () {
      parameters = {...defaultParameters}

      return this
    },
    update: function () {
      const danger = content.monster.dangerValue(),
        time = content.time.value()

      // Foreground
      const hue = parameters.hueOffset0 + (time / 180)

      colors[0] = toFloat(
        hsl2rgb({
          h: hue,
          s: 1,
          l: 1/3,
        })
      )

      // Background main
      const hueOffset1 = -1 / engine.fn.scale(
        Math.sin(engine.const.tau * (parameters.hueOffset1 + (time / 60))),
        -1, 1,
        2, 3
      )

      const backgroundLightness = engine.fn.lerp(7/8, 1/2, danger)

      colors[1] = toFloat(
        hsl2rgb({
          h: hue + hueOffset1,
          s: 1,
          l: backgroundLightness,
        })
      )

      // Background analogous
      const hueOffset2 = -1 / engine.fn.scale(
        Math.sin(engine.const.tau * (parameters.hueOffset2 + (time / 20))),
        -1, 1,
        6, 12
      )

      colors[2] = toFloat(
        hsl2rgb({
          h: hue + hueOffset1 + hueOffset2,
          s: 1,
          l: backgroundLightness,
        })
      )

      return this
    },
  }
})()
