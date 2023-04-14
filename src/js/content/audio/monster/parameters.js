content.audio.monster.parameters = (() => {
  const defaults = {
    active: false,
    danger: 0,
    mainGain: 0,
    paused: 0,
    stun: 0,
    vector: engine.tool.vector3d.create(),
    width: 0,
  }

  const pausedValues = {
    active: true,
    danger: 1/3,
    mainGain: 1,
    paused: 1,
    stun: 0,
    vector: engine.tool.vector3d.create(),
    width: 1,
  }

  let calculated = {...defaults},
    isPausedAccelerated = 1,
    values = {...defaults}

  function calculate() {
    const danger = content.monster.dangerValue(),
      stun = content.monster.getStunAcceleratedValue()

    return {
      ...defaults,
      active: danger > 0,
      danger,
      mainGain: danger ** (1/4),
      stun,
      width: engine.fn.lerpExp(0, 0.5, stun, 0.5),
      vector: content.monster.normal(),
    }
  }

  function calculatePaused() {
    const result = {
      ...defaults,
      ...pausedValues,
    }

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
      stun: engine.fn.lerp(a.stun, b.stun, value),
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
        1
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
