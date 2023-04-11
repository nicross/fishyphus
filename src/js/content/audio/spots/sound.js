content.audio.spots.sound = engine.sound.extend({
  fadeInDuration: 1/2,
  fadeOutDuration: 1/2,
  filterModel: engine.ear.filterModel.musical.extend({
    defaults: {
      coneRadius: 0.25 * engine.const.tau,
      maxColor: 8,
      minColor: 0.5,
      power: 1,
    },
  }),
  gainModel: engine.ear.gainModel.base.extend({
    calculate: function (distance) {
      const maxDistance = 300,
        radiusInner = 5,
        radiusOuter = 50

      const outerRatio = engine.fn.clamp(
        engine.fn.scale(
          distance,
          radiusOuter, maxDistance,
          1, 0,
        )
      )

      return outerRatio
    }
  }),
  relative: false,
  reverb: false,
  // Lifecycle
  onConstruct: function ({
    spot,
  } = {}) {
    this.spot = spot

    const {
      amodDepth,
      amodFrequency,
      filterFrequency,
      fmodDepth,
      fmodFrequency,
      gain,
      minColor,
    } = this.calculateRealtimeParameters()

    this.synth = engine.synth.mod({
      amodDepth: amodDepth,
      amodFrequency: amodFrequency,
      amodType: 'square',
      carrierGain: 1 - amodDepth,
      carrierFrequency: this.spot.rootFrequency,
      carrierType: 'square',
      fmodDepth: fmodDepth,
      fmodFrequency: fmodFrequency,
      fmodType: 'square',
      gain,
    }).filtered({
      frequency: filterFrequency,
    }).connect(this.output)

    this.filterModel.options.frequency = this.spot.rootFrequency
    this.filterModel.options.minColor = minColor
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    const {
      amodDepth,
      amodFrequency,
      filterFrequency,
      fmodDepth,
      fmodFrequency,
      gain,
      minColor,
    } = this.calculateRealtimeParameters()

    engine.fn.setParam(this.synth.param.amod.depth, amodDepth)
    engine.fn.setParam(this.synth.param.amod.frequency, amodFrequency)
    engine.fn.setParam(this.synth.filter.frequency, filterFrequency)
    engine.fn.setParam(this.synth.param.fmod.depth, fmodDepth)
    engine.fn.setParam(this.synth.param.fmod.frequency, fmodFrequency)
    engine.fn.setParam(this.synth.param.gain, gain)

    this.filterModel.options.minColor = minColor
  },
  // Methods
  calculateRealtimeParameters: function () {
    const fish = content.fish.get(this.spot.id),
      fishValue = fish?.value || 0,
      isActive = content.minigame.isFish(this.spot.id),
      maxDistance = 300,
      minigameValue = 1 - content.minigame.isActiveAccelerated(),
      radiusInner = 5,
      radiusOuter = 50

    const relative = this.getRelativeVector()

    const angleRatio = engine.fn.scale(
      Math.cos(Math.atan2(relative.y, relative.x)),
      -1, 1,
      0, 1
    )

    const innerRatio = engine.fn.clamp(
      engine.fn.scale(
        relative.distance(),
        radiusInner, radiusOuter,
        0, 1
      )
    )

    const minigameRatio = isActive
      ? minigameValue
      : engine.fn.lerp(1/4, 1, minigameValue)

    return {
      amodDepth: engine.fn.lerp(0, 0.5, fishValue, 2),
      amodFrequency: engine.fn.lerp(1, 8, fishValue, 2),
      filterFrequency: this.spot.rootFrequency * engine.fn.lerpExp(4, 8, engine.fn.lerpExp(1, angleRatio, innerRatio, 4), 4),
      fmodDepth: this.spot.rootFrequency * engine.fn.lerpExp(1/2, 0, innerRatio, 2),
      fmodFrequency: this.spot.rootFrequency * engine.fn.lerpExp(1/2, 1, innerRatio, 2),
      gain: engine.fn.fromDb(engine.fn.lerp(-30, -33, innerRatio)) * minigameRatio,
      minColor: engine.fn.lerpExp(4, 0.5, innerRatio, 8),
    }
  },
})
