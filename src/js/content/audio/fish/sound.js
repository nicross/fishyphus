content.audio.fish.sound = engine.sound.extend({
  fadeInDuration: 1/4,
  fadeOutDuration: 1/4,
  filterModel: engine.ear.filterModel.musical.extend({
    coneRadius: engine.const.tau * 0.5,
    power: 1,
  }),
  gainModel: engine.ear.gainModel.exponential.extend({
    maxDistance: 300,
    power: 2,
  }),
  relative: false,
  reverb: false,
  // Lifecycle
  onConstruct: function ({
    fish,
  } = {}) {
    this.fish = fish
    this.rootFrequency = this.chooseFrequency()
    this.filterModel.options.frequency = this.rootFrequency

    this.synth = engine.synth.simple({
      frequency: this.rootFrequency,
      type: 'triangle',
    }).filtered({
      frequency: this.rootFrequency,
    }).connect(this.output)
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    this.setVector(this.fish.vector)

    const gain = engine.fn.fromDb(engine.fn.lerp(-12, -24, this.fish.value)),
      color = engine.fn.lerpExp(1, 6, this.fish.value, 2)

    engine.fn.setParam(this.synth.filter.frequency, this.rootFrequency * color)
    engine.fn.setParam(this.synth.param.gain, gain)
  },
  // Methods
  chooseFrequency: function () {
    const srand = engine.fn.srand('fish', 'frequency', this.fish.id)

    return engine.fn.fromMidi(
      engine.fn.choose([
        45,
        47,
        48,
      ], srand()) + 12
    )
  },
})
