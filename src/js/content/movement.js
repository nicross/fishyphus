content.movement = (() => {
  const acceleration = 3,
    angularVelocity = engine.const.tau / 4,
    deceleration = 3,
    maxVelocity = 12

  let velocity = engine.tool.vector2d.create()

  return {
    export: () => velocity.clone(),
    import: function (value) {
      velocity = engine.tool.vector2d.create(value)

      return this
    },
    reset: function () {
      velocity = engine.tool.vector2d.create()

      return this
    },
    velocity: () => velocity.clone(),
    velocityMax: () => maxVelocity,
    velocityValue: () => engine.fn.clamp(velocity.distance() / maxVelocity),
    update: function ({
      rotate = 0,
      x = 0,
    }) {
      const delta = engine.loop.delta(),
        isMinigame = content.minigame.isActive(),
        position = engine.position.getVector()

      let {yaw} = engine.position.getEuler()

      // Turn, when pressed and not in minigame
      if (!isMinigame) {
        // Calculate next yaw
        yaw += (rotate * angularVelocity * delta)
        yaw %= engine.const.tau

        // Apply next yaw
        engine.position.setEuler({
          yaw,
        })
      }

      // Apply acceleration, when pressed and not in minigame
      if (x > 0 && !isMinigame) {
        const thrust = engine.tool.vector2d.create({
          x: x * delta * acceleration,
        }).rotate(yaw)

        velocity = velocity.add(thrust)
      }

      // Apply brakes, when pressed or in minigame
      if (x < 0 || isMinigame) {
        velocity = engine.tool.vector2d.create(
          engine.fn.accelerateVector(
            velocity,
            {x: 0, y: 0},
            deceleration,
          )
        )
      }

      // Enforce the speed limit
      const magnitude = velocity.distance()

      if (magnitude > maxVelocity) {
        velocity = velocity.scale(maxVelocity / magnitude)
      }

      // TODO: Decelerate when close to zero?

      // Apply velocity to position
      engine.position.setVector(
        position.add(
          velocity.scale(delta)
        )
      )

      return this
    }
  }
})()

engine.state.on('export', (data) => data.movement = content.movement.export())
engine.state.on('import', ({movement}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())
