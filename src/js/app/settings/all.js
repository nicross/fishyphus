app.settings.register('gamepadVibration', {
  default: 1,
  update: function (computedValue) {
    app.haptics.setSensitivity(computedValue)
  },
})

app.settings.register('graphicsOn', {
  compute: (rawValue) => Boolean(rawValue),
  default: true,
  update: function (computedValue) {
    content.gl.setActive(computedValue)
  },
})

app.settings.register('mainVolume', {
  compute: (rawValue) => engine.fn.fromDb(engine.fn.lerpLog(engine.const.zeroDb, 0, rawValue, 4294000000)),
  default: 1,
  update: function (computedValue) {
    engine.fn.setParam(engine.mixer.param.gain, computedValue)
  },
})
