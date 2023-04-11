content.monster = (() => {
  const pubsub= engine.tool.pubsub.create()

  const dangerTime = 120,
    killDistance = 1,
    minStun = 15,
    maxStun = 120,
    normalVelocityRate = 0.5,
    rushVelocityRate = 2,
    stunFallRate = 0.5

  let position = engine.tool.vector3d.create(),
    spawnTimer = 0,
    stun = 0,
    stunAccelerated = 0

  return pubsub.decorate({
    applyStun: function () {
      stun += minStun + content.bonus.stunBonus()
      stun = Math.min(stun, maxStun)

      return this
    },
    dangerCountdown: function () {
      return (this.distance() + killDistance) / this.normalVelocity()
    },
    dangerDistance: function () {
      return this.normalVelocity() * dangerTime
    },
    dangerValue: function () {
      return 1 - engine.fn.clamp(
        (this.distance() + killDistance) / (this.dangerDistance() + killDistance)
      )
    },
    decrementSpawnTimer: function () {
      if (spawnTimer == 0) {
        return this
      }

      spawnTimer -= 1

      // Spawn when timer expires
      if (spawnTimer == 0) {
        position = engine.position.getVector().subtract({
          z: this.dangerDistance() + content.bonus.startBonus(),
        })
      }

      return this
    },
    distance: () => engine.position.getVector().distance(position),
    export: () => ({
      position: position.clone(),
      spawnTimer: spawnTimer,
      stun: stun,
    }),
    getStun: () => stun,
    getStunAccelerated: () => stunAccelerated,
    getStunAcceleratedValue: () => engine.fn.clamp(stunAccelerated / maxStun),
    getStunValue: () => engine.fn.clamp(stun / maxStun),
    import: function (data = {}) {
      // Prefer imported state, otherwise spawn at danger distance
      position = engine.tool.vector3d.create(data.position || engine.position.getVector().subtract({
        z: this.dangerDistance(),
      }))

      // Prefer imported state, otherwise calculate initial value
      spawnTimer = 'spawnTimer' in data
        ? Number(data.spawnTimer) || 0
        : content.bonus.spawnBonus()

      spawnTimer = Math.max(0, spawnTimer)

      stun = Number(data.stun) || 0
      stun = Math.min(stun, maxStun)
      stunAccelerated = stun

      return this
    },
    isRushing: function () {
      return this.distance() > content.bonus.rushBonus()
    },
    isSpawned: () => spawnTimer <= 0,
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
      spawnTimer = 0
      stun = 0
      stunAccelerated = 0

      return this
    },
    update: function () {
      const delta = engine.loop.delta(),
        maxVelocity = content.movement.velocityMax()

      // Handle spawn timer
      if (spawnTimer > 0) {
        return
      }

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
      const isFishing = content.minigame.isActive(),
        isRushing = this.isRushing()

      const speed = isFishing
        ? maxVelocity
        : maxVelocity * (isRushing ? rushVelocityRate : normalVelocityRate)

      // Apply velocity to position
      const velocity = engine.position.getVector()
        .subtract(position)
        .normalize()
        .scale(speed * delta)

      position = position.add(velocity)

      // Detect kills
      if (this.distance() <= killDistance) {
        pubsub.emit('kill')
      }

      return this
    },
  })
})()

engine.ready(() => {
  content.minigame.on('success', () => {
    if (content.monster.isSpawned()) {
      content.monster.applyStun()
    } else {
      content.monster.decrementSpawnTimer()
    }
  })
})

engine.state.on('export', (data) => data.monster = content.monster.export())
engine.state.on('import', ({monster}) => content.monster.import(monster))
engine.state.on('reset', () => content.monster.reset())
