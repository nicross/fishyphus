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

      const innerRatio = engine.fn.clamp(
        engine.fn.scale(
          distance,
          radiusInner, radiusOuter,
          0, 1
        )
      )

      const outerRatio = engine.fn.clamp(
        engine.fn.scale(
          distance,
          radiusOuter, maxDistance,
          1, 0,
        )
      )

      return engine.fn.fromDb(-33) * (innerRatio ** 0.5) * outerRatio
    }
  }),
  radius: 5,
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
    } = this.calculateRealtimeParameters()

    this.synth = engine.synth.am({
      carrierGain: 1 - amodDepth,
      carrierFrequency: this.spot.rootFrequency,
      carrierType: 'square',
      gain: 1,
      modDepth: amodDepth,
      modFrequency: amodFrequency,
      modType: 'square',
    }).filtered({
      frequency: filterFrequency,
    }).connect(this.output)

    this.filterModel.defaults.frequency = this.spot.rootFrequency
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    const {
      amodDepth,
      amodFrequency,
      filterFrequency,
    } = this.calculateRealtimeParameters()

    engine.fn.setParam(this.synth.filter.frequency, filterFrequency)
    engine.fn.setParam(this.synth.param.mod.depth, amodDepth)
    engine.fn.setParam(this.synth.param.mod.frequency, amodFrequency)
  },
  // Methods
  calculateRealtimeParameters: function () {
    const maxDistance = 300,
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

    return {
      amodDepth: engine.fn.lerp(0.5, 0, innerRatio, 2),
      amodFrequency: engine.fn.lerp(8, 1, innerRatio, 2),
      filterFrequency: this.spot.rootFrequency * engine.fn.lerpExp(4, 8, angleRatio, 4),
    }
  },
})
