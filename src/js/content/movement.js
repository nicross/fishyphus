content.movement = (() => {
  const acceleration = 3,
    angularVelocity = engine.const.tau / 4,
    deceleration = 3,
    maxVelocity = 12,
    minigameDeceleration = 12

  let rawInput = {},
    turningSpeed = 1,
    velocity = engine.tool.vector2d.create()

  return {
    export: () => velocity.clone(),
    import: function (value) {
      velocity = engine.tool.vector2d.create(value)

      return this
    },
    minigameStoppingPoint: function () {
      const magnitude = velocity.distance(),
        position = engine.position.getVector()

      if (magnitude == 0) {
        return position
      }

      return position.add(
        velocity.scale(1/magnitude).scale(
          // d = vt/2
          0.5 * magnitude * (magnitude / minigameDeceleration)
        )
      )
    },
    rawInput: () => ({...rawInput}),
    reset: function () {
      velocity = engine.tool.vector2d.create()

      return this
    },
    setTurningSpeed: function (value) {
      turningSpeed = value

      return this
    },
    update: function (input = {}) {
      // Prevent acceleration before first successful catch, preventing soft-locks
      const isActive = content.score.value() > 0
        || content.bonus.value() > 0
        || content.monster.isPeacefulMode()
        || !engine.position.getVector().isZero()

      if (!isActive) {
        delete input.x
      }

      // Process input
      const {
        rotate = 0,
        x = 0,
      } = input

      rawInput = {...input}

      const delta = engine.loop.delta(),
        isMinigame = content.minigame.isActive(),
        position = engine.position.getVector()

      const isAccelerate = x > 0 && !isMinigame,
        isBrake = x < 0 || isMinigame

      let {yaw} = engine.position.getEuler()

      // Calculate next yaw
      yaw += (rotate * turningSpeed * angularVelocity * delta)
      yaw %= engine.const.tau

      // Apply next yaw
      engine.position.setEuler({
        yaw,
      })

      // Apply acceleration, when pressed and not in minigame
      if (isAccelerate) {
        const thrust = engine.tool.vector2d.create({
          x: x * delta * acceleration,
        }).rotate(yaw)

        velocity = velocity.add(thrust)
      }

      // Apply brakes, when pressed or in minigame
      if (isBrake) {
        velocity = engine.tool.vector2d.create(
          engine.fn.accelerateVector(
            velocity,
            {x: 0, y: 0},
            isMinigame ? minigameDeceleration : deceleration,
          )
        )
      }

      // Enforce the speed limit
      let magnitude = velocity.distance()

      if (magnitude > maxVelocity) {
        velocity = velocity.scale(maxVelocity / magnitude)
        magnitude = maxVelocity
      }

      // Apply extra turning force (proportional to dot product with target vector)
      if (isAccelerate) {
        const target = engine.tool.vector2d.unitX().scale(magnitude).rotate(yaw)

        const dot = engine.fn.scale(
          target.dotProduct(),
          -1, 1,
          0, 1
        )

        velocity = engine.tool.vector2d.create(
          engine.fn.accelerateVector(
            velocity,
            target,
            dot * acceleration,
          )
        )
      }

      // Apply velocity to position
      engine.position.setVector(
        position.add(
          velocity.scale(delta)
        )
      )

      return this
    },
    velocity: () => velocity.clone(),
    velocityMax: () => maxVelocity,
    velocityValue: () => engine.fn.clamp(velocity.distance() / maxVelocity),
  }
})()

engine.state.on('export', (data) => data.movement = content.movement.export())
engine.state.on('import', ({movement}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())
