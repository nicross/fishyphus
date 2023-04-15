content.audio.monster.parameters = (() => {
  const pausedValues = {
    active: true,
    danger: 1/3,
    mainGain: 1,
    paused: 1,
    speed: 0,
    stun: 0,
    stunApplication: 0,
    vector: engine.tool.vector3d.create(),
    width: 1,
  }

  let calculated = {...pausedValues},
    isPausedAccelerated = 1,
    values = {...pausedValues}

  function calculate() {
    const danger = content.monster.dangerValue(),
      stunApplication = content.monster.getStunApplicationAccelerated()

    return {
      active: danger > 0,
      danger,
      mainGain: danger ** (1/4),
      speed: content.monster.calculateWeightBoost(),
      stun: content.monster.getStunAcceleratedValue(),
      stunApplication,
      width: engine.fn.lerpExp(0, 0.5, stunApplication, 1),
      vector: content.monster.normal(),
    }
  }

  function calculatePaused() {
    const result = {...pausedValues}

    // Fade in on initial game start
    result.mainGain *= engine.fn.clamp(
      engine.fn.scale(
        engine.time(),
        0, 8,
        0, 1
      )
    )

    return result
  }

  function lerp(a, b, value) {
    return {
      active: value == 0 ? a.active : b.active,
      danger: engine.fn.lerp(a.danger, b.danger, value),
      mainGain: engine.fn.lerp(a.mainGain, b.mainGain, value),
      paused: value,
      speed: engine.fn.lerp(a.speed, b.speed, value),
      stun: engine.fn.lerp(a.stun, b.stun, value),
      stunApplication: engine.fn.lerp(a.stunApplication, b.stunApplication, value),
      vector: engine.tool.vector3d.create({
        x: engine.fn.lerp(a.vector.x, b.vector.x, value),
        y: engine.fn.lerp(a.vector.y, b.vector.y, value),
        z: engine.fn.lerp(a.vector.z, b.vector.z, value),
      }),
      width: engine.fn.lerp(a.width, b.width, value),
    }
  }

  return {
    active: () => values.active,
    all: () => ({...values}),
    mainGain: () => values.mainGain,
    update: function () {
      const isPaused = engine.loop.isPaused()

      isPausedAccelerated = engine.fn.accelerateValue(
        isPausedAccelerated,
        isPaused ? 1 : 0,
        2
      )

      if (!isPaused) {
        calculated = calculate()
      }

      values = lerp(
        calculated,
        calculatePaused(),
        isPausedAccelerated
      )

      return this
    },
  }
})()
