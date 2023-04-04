app.haptics = (() => {
  const defaultEffect = {
    duration: 0,
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: 0,
  }

  let events = [],
    sensitivity = 1

  function getActuators() {
    const actuators = [],
      gamepads = navigator.getGamepads()

    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue
      }

      if (gamepad.vibrationActuator && gamepad.vibrationActuator.type == 'dual-rumble') {
        actuators.push(gamepad.vibrationActuator)
      }
    }

    return actuators
  }

  function isActive() {
    return sensitivity > 0
  }

  return {
    enqueue: function (effect = {}) {
      events.push({...defaultEffect, ...effect})

      return this
    },
    getActuators,
    isActive,
    setSensitivity: function (value) {
      sensitivity = Number(value) || 0

      return this
    },
    update: function (delta) {
      let strongMagnitude = 0,
        weakMagnitude = 0

      // Sum event magnitudes and remove dead events
      events = events.reduce((live, event) => {
        if (event.startDelay > delta) {
          event.startDelay -= delta
          live.push(event)
          return live
        }

        const startScale = event.startDelay > 0 ? (1 - (event.startDelay / delta)) : 1
        const endScale = event.duration >= delta ? 1 : (event.duration / delta)

        strongMagnitude += event.strongMagnitude * startScale * endScale
        weakMagnitude += event.weakMagnitude * startScale * endScale

        event.duration -= delta

        if (event.duration > 0) {
          live.push(event)
        }

        return live
      }, [])

      // Attenuate by sensitivity
      strongMagnitude *= sensitivity
      weakMagnitude *= sensitivity

      // Skip nothing
      if (!strongMagnitude && !weakMagnitude) {
        return this
      }

      // Play effects
      for (const actuator of getActuators()) {
        actuator.playEffect(actuator.type, {
          duration: delta,
          startDelay: 0,
          strongMagnitude: engine.fn.clamp(strongMagnitude),
          weakMagnitude: engine.fn.clamp(weakMagnitude),
        })
      }

      return this
    },
  }
})()

// Streams
;(() => {
  let dangerTimeout = 0,
    fishTimeout = 0

  engine.loop.on('frame', ({delta, paused}) => {
    delta *= 1000

    if (!paused && !content.minigame.isActive()) {
      danger(delta)
      fish(delta)
    }

    app.haptics.update(delta)
  })

  function danger(delta) {
    if (dangerTimeout > engine.time()) {
      return
    }

    if (content.monster.isStunned()) {
      return
    }

    const value = engine.fn.scale(
      content.monster.dangerValue(),
      0.75, 1,
      0, 1
    )

    if (value < 0) {
      return
    }

    const duration = engine.fn.lerp(1000, 333, value)

    app.haptics.enqueue({
      duration: duration * 0.5,
      startDelay: 0,
      strongMagnitude: value ** 3,
      weakMagnitude: 0,
    })

    dangerTimeout = engine.time(duration / 1000)
  }

  function fish(delta) {
    if (fishTimeout > engine.time()) {
      return
    }

    const closest = content.fish.closest(),
      isMinigameActive = content.minigame.isActive()

    if (!closest || isMinigameActive) {
      return
    }

    const duration = engine.fn.lerp(1000, 500, closest.value)

    app.haptics.enqueue({
      duration: duration * 0.5,
      startDelay: 0,
      strongMagnitude: 0,
      weakMagnitude: closest.value ** 2,
    })

    fishTimeout = engine.time(duration / 1000)
  }
})()

content.minigame.on('finish', () => {
  app.haptics.enqueue({
    duration: 150,
    startDelay: 100,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })

  app.haptics.enqueue({
    duration: 150,
    startDelay: 300,
    strongMagnitude: 0.75,
    weakMagnitude: 0.75,
  })

  app.haptics.enqueue({
    duration: 150,
    startDelay: 500,
    strongMagnitude: 0.5,
    weakMagnitude: 0.5,
  })
})
