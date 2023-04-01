content.movement = (() => {
  const acceleration = 2,
    angularVelocity = engine.const.tau / 4,
    deceleration = 2,
    maxVelocity = 10

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
        position = engine.position.getVector()

      // Calculate next yaw
      let {yaw} = engine.position.getEuler()
      yaw += (rotate * angularVelocity * delta)
      yaw %= engine.const.tau

      // Apply next yaw
      engine.position.setEuler({
        yaw,
      })

      // Apply thrust to velocity
      const thrust = engine.tool.vector2d.create({
        x: x * delta * acceleration,
      }).rotate(yaw)

      velocity = velocity.add(thrust)

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
