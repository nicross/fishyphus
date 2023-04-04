content.audio.spots.sound = engine.sound.extend({
  fadeInDuration: 1/4,
  fadeOutDuration: 1/4,
  filterModel: engine.ear.filterModel.musical.extend(),
  gainModel: engine.ear.gainModel.realisticHorizon.extend({
    defaults: {
      horizonPower: 1,
      maxDistance: 400,
      minDistance: 1,
      power: 0.5,
    },
  }),
  radius: 5,
  relative: false,
  reverb: false,
  // Lifecycle
  onConstruct: function ({
    spot,
  } = {}) {
    this.spot = spot

    this.rootFrequency = this.chooseFrequency()
    this.filterModel.options.frequency = this.rootFrequency

    const {
      filterFrequency,
      gain,
    } = this.calculateRealtimeParameters()

    this.synth = engine.synth.simple({
      gain: gain,
      frequency: this.rootFrequency,
      type: 'square',
    }).filtered({
      frequency: filterFrequency,
    }).connect(this.output)
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function ({delta}) {
    const {
      filterFrequency,
      gain,
    } = this.calculateRealtimeParameters()

    engine.fn.setParam(this.synth.filter.frequency, filterFrequency)
    engine.fn.setParam(this.synth.param.gain, gain)
  },
  // Methods
  calculateRealtimeParameters: function () {
    const relative = this.getRelativeVector()

    const angleRatio = engine.fn.scale(
      Math.cos(Math.atan2(relative.y, relative.x)),
      -1, 1,
      0, 1
    )

    const distanceRatio = 1 - engine.fn.clamp(
      relative.distance() / this.gainModel.defaults.maxDistance
    )

    // TODO: AM / FM when nearby?
    return {
      filterFrequency: this.rootFrequency * engine.fn.lerpExp(0.5, 12, angleRatio, 3),
      gain: engine.fn.fromDb(engine.fn.lerp(-9, -27, distanceRatio)),
    }
  },
  chooseFrequency: function () {
    const srand = engine.fn.srand('spot', this.spot.id)

    return engine.fn.fromMidi(
      engine.fn.choose([
        57,
        59,
        60,
        62,
        64,
        65,
        67,
      ], srand())
    )
  },
})
