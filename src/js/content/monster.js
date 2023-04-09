content.monster = (() => {
  const dangerTime = 120,
    killDistance = 1,
    minStun = 15,
    maxStun = 120,
    normalVelocityRate = 0.5,
    stunFallRate = 0.5

  let position = engine.tool.vector3d.create(),
    stun = 0,
    stunAccelerated = 0

  return {
    applyStun: function () {
      stun += minStun + content.bonus.stunBonus()
      stun = Math.min(stun, maxStun)

      return this
    },
    dangerDistance: function () {
      return this.normalVelocity() * dangerTime
    },
    dangerValue: function () {
      return 1 - engine.fn.clamp(
        (this.distance() + killDistance) / (this.dangerDistance() + killDistance)
      )
    },
    distance: () => engine.position.getVector().distance(position),
    export: () => ({
      position: position.clone(),
      stun: Number(stun) || 0,
    }),
    getStun: () => stun,
    getStunAccelerated: () => stunAccelerated,
    getStunAcceleratedValue: () => engine.fn.clamp(stunAccelerated / maxStun),
    getStunValue: () => engine.fn.clamp(stun / maxStun),
    import: function (data = {}) {
      position = engine.tool.vector3d.create(data.position || {
        z: -(this.dangerDistance()/2 + content.bonus.startBonus()),
      })

      stun = Number(data.stun) || 0
      stun = Math.min(stun, maxStun)
      stunAccelerated = stun

      return this
    },
    isKill: function () {
      return !this.isStunned() && this.distance() <= killDistance
    },
    isStunned: () => stun > 0,
    normal: () => {
      return position
        .subtract(engine.position.getVector())
        .rotateQuaternion(engine.position.getQuaternion().conjugate())
        .normalize()
    },
    normalVelocity: () => content.movement.velocityMax() * normalVelocityRate,
    position: () => position.clone(),
    reset: function () {
      position = engine.tool.vector3d.create()
      stun = 0
      stunAccelerated = 0

      return this
    },
    update: function () {
      const delta = engine.loop.delta(),
        maxVelocity = content.movement.velocityMax()

      // Handle stun status effect
      if (stun > 0) {
        stun -= delta
      }

      stunAccelerated = engine.fn.accelerateValue(
        stunAccelerated,
        stun,
        Math.max(minStun, stunAccelerated)
      )

      if (stun > 0) {
        position.z -= delta * maxVelocity * stunFallRate

        return this
      }

      // Movement
      // Calculate speed
      const isFishing = content.minigame.isActive()

      const speed = isFishing
        ? maxVelocity
        : maxVelocity * normalVelocityRate

      // Apply velocity to position
      const velocity = engine.position.getVector()
        .subtract(position)
        .normalize()
        .scale(speed * delta)

      position = position.add(velocity)

      return this
    },
  }
})()

engine.ready(() => {
  content.minigame.on('success', () => {
    content.monster.applyStun()
  })
})

engine.state.on('export', (data) => data.monster = content.monster.export())
engine.state.on('import', ({monster}) => content.monster.import(monster))
engine.state.on('reset', () => content.monster.reset())
