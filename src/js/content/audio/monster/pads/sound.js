content.audio.monster.pads.sound = engine.sound.extend({
  fadeInDuration: 1/8,
  fadeOutDuration: 1/8,
  filterModel: engine.ear.filterModel.musical.extend({
    defaults: {
      coneRadius: 0.25 * engine.const.tau,
      power: 1,
    },
  }),
  gainModel: engine.ear.gainModel.normalize.extend({
    defaults: {
      gain: 1,
    },
  }),
  relative: true,
  reverb: false,
  // Lifecycle
  onConstruct: function ({
    isLeft,
  } = {}) {
    this.isLeft = isLeft

    this.rootFrequency = engine.fn.fromMidi(
      isLeft ? 60 : 64
    )

    const {
      amodDepth,
      amodFrequency,
      carrierDetune,
      carrierGain,
      fmodDetune,
      gain,
      maxColor,
      minColor,
      vector,
    } = this.calculateRealtimeParameters()

    this.synth = engine.synth.mod({
      amodDepth,
      amodFrequency,
      carrierDetune,
      carrierFrequency: this.rootFrequency,
      carrierGain,
      carrierType: 'sawtooth',
      fmodDepth: this.rootFrequency * 0.5,
      fmodDetune,
      fmodFrequency: this.rootFrequency * 1.5,
      fmodType: 'sawtooth',
      gain,
    }).connect(this.output)

    this.filterModel.options.frequency = this.rootFrequency
    this.filterModel.options.maxColor = maxColor
    this.filterModel.options.minColor = minColor

    this.setVector(vector)
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    const {
      amodDepth,
      amodFrequency,
      carrierDetune,
      carrierGain,
      fmodDetune,
      gain,
      maxColor,
      minColor,
      vector,
    } = this.calculateRealtimeParameters()

    engine.fn.setParam(this.synth.param.amod.depth, amodDepth)
    engine.fn.setParam(this.synth.param.amod.frequency, amodFrequency)
    engine.fn.setParam(this.synth.param.detune, carrierDetune)
    engine.fn.setParam(this.synth.param.carrierGain, carrierGain)
    engine.fn.setParam(this.synth.param.fmod.detune, fmodDetune)
    engine.fn.setParam(this.synth.param.gain, gain)

    this.setVector(vector)

    this.filterModel.options.maxColor = maxColor
    this.filterModel.options.minColor = minColor
  },
  // Methods
  calculateRealtimeParameters: function () {
    const {
      danger,
      paused,
      speed,
      stun,
      stunApplication,
      vector,
      width,
    } = content.audio.monster.parameters.all()

    const amodDepth = engine.fn.lerp(
      engine.fn.lerpExp(1/8, 1/2, danger, 12),
      1/2,
      stunApplication,
    )

    const amodFrequency = this.isLeft
      ? engine.fn.lerp(
          engine.fn.lerpExp(1/29, 19, danger, 4),
          engine.fn.lerp(5, 31, stunApplication),
          stunApplication,
        )
      : engine.fn.lerp(
          engine.fn.lerpExp(1/31, 17, danger, 4),
          engine.fn.lerp(7, 29, stunApplication),
          stunApplication,
        )

    const detune = engine.fn.lerp(0, 50, speed)

    return {
      amodDepth,
      amodFrequency,
      carrierDetune: engine.fn.lerp(0, this.isLeft ? 2400 : -2400, stun) + detune,
      carrierGain: 1 - amodDepth,
      fmodDetune: engine.fn.lerp(0, this.isLeft ? -2400 : 2400, stun) + detune,
      gain: engine.fn.fromDb(engine.fn.lerpExp(engine.const.zeroDb, -24, danger, 0.05)) * engine.fn.fromDb(engine.fn.lerp(0, 6, stunApplication)),
      minColor: engine.fn.lerp(0.5, 0, paused),
      maxColor: engine.fn.lerp(3, 1, paused),
      vector: engine.tool.vector2d.create(vector).rotate(
        width * (this.isLeft ? -1 : 1) * (engine.const.tau / 4)
      ),
    }
  },
})
