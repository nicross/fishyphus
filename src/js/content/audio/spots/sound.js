content.audio.spots.sound = engine.sound.extend({
  fadeInDuration: 1/2,
  fadeOutDuration: 1/2,
  filterModel: engine.ear.filterModel.musical.extend({
    defaults: {
      coneRadius: 0.25 * engine.const.tau,
      maxColor: 16,
      minColor: 0.5,
      power: 1,
    },
  }),
  gainModel: engine.ear.gainModel.base.extend({
    calculate: function (distance) {
      const maxDistance = 500,
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

    if (this.isLooking()) {
      if (!this.isActivelyLooking) {
        this.isActivelyLooking = true
        this.lookOn()
      }
    } else if (this.isActivelyLooking) {
      this.isActivelyLooking = false
      this.lookOff()
    }
  },
  // Methods
  calculateRealtimeParameters: function () {
    const fish = content.fish.get(this.spot.id),
      fishValue = fish?.value || 0,
      isActive = content.minigame.isFish(this.spot.id),
      maxDistance = 500,
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
      : 1

    return {
      amodDepth: engine.fn.lerp(engine.fn.lerpExp(0, 1/4, angleRatio * innerRatio, 8), 1/2, fishValue, 2),
      amodFrequency: engine.fn.lerp(engine.fn.lerpExp(1, 8, angleRatio * innerRatio, 8), 8, fishValue, 2),
      filterFrequency: this.spot.rootFrequency * engine.fn.lerpExp(4, 16, engine.fn.lerpExp(1, angleRatio, innerRatio, 4), 4),
      fmodDepth: this.spot.rootFrequency * engine.fn.lerpExp(1/2, 0, innerRatio, 2),
      fmodFrequency: this.spot.rootFrequency * engine.fn.lerpExp(1/2, 1, innerRatio, 2),
      gain: engine.fn.fromDb(engine.fn.lerp(-30, -33, innerRatio)) * minigameRatio,
      minColor: engine.fn.lerpExp(4, 0.5, innerRatio, 8),
    }
  },
  isLooking: function () {
    const effectiveRadius = 5,
      relative = this.getRelativeVector()

    const distance = relative.distance()

    // Fail silently when content.audio.minigame.inactiveAlert is more effective
    if (distance <= effectiveRadius) {
      this.isActivelyLooking = false
      return false
    }

    // Otherwise calculate the optimal look angle
    // Player is at A, fish is at B
    const B = engine.const.tau / 4,
      a = effectiveRadius,
      c = distance

    const b = Math.sqrt((a * a) + (c * c) - (2 * a * c * Math.cos(B)))
    const A = Math.asin(
      Math.sin(B) * a / b
    )

    const lookAngle = A
    const angle = Math.atan2(relative.y, relative.x)

    return Math.abs(angle) <= lookAngle
  },
  lookOff: function () {
    const synth = engine.synth.simple({
      frequency: this.spot.rootFrequency,
      gain: engine.fn.fromDb(-21),
      type: 'sine',
    }).connect(this.output)

    const duration = 1/4,
      now = engine.time()

    engine.fn.rampExp(synth.param.gain, engine.const.zeroGain, duration)
    engine.fn.rampLinear(synth.param.detune, -1200, duration)

    synth.stop(now + duration)
  },
  lookOn: function () {
    const synth = engine.synth.simple({
      frequency: this.spot.rootFrequency * 2,
      gain: engine.fn.fromDb(-21),
      type: 'sine',
    }).connect(this.output)

    const duration = 1/4,
      now = engine.time()

    engine.fn.rampExp(synth.param.gain, engine.const.zeroGain, duration)
    engine.fn.rampLinear(synth.param.detune, 1200, duration)

    synth.stop(now + duration)
  },
})
