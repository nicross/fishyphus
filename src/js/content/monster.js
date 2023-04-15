content.monster = (() => {
  const pubsub = engine.tool.pubsub.create()

  const dangerTime = 120,
    killDistance = 1,
    maxStun = 120,
    normalVelocityRate = 0.5,
    rushVelocityRate = 2,
    stunFallRate = 0.5

  let isPeacefulMode = false,
    position = engine.tool.vector3d.create(),
    spawnTimer = 0,
    stun = 0,
    stunAccelerated = 0,
    stunApplication = 0,
    stunApplicationAccelerated = 0

  return pubsub.decorate({
    applyStun: function () {
      if (!this.isDanger()) {
        return this
      }

      stun += content.bonus.stunBonus()
      stun = Math.min(stun, maxStun)

      stunApplication = 1

      return this
    },
    calculateSpeed: function () {
      const isFishing = content.minigame.isActive(),
        isRushing = this.isRushing(),
        maxVelocity = content.movement.velocityMax()

      const weightBoost = 1 + this.calculateWeightBoost()

      if (isRushing) {
        return maxVelocity * weightBoost * rushVelocityRate
      }

      if (isFishing) {
        return maxVelocity * weightBoost
      }

      return maxVelocity * weightBoost * normalVelocityRate
    },
    calculateWeightBoost: function () {
      const spawnBonus = content.bonus.spawnBonus(),
        weightBonus = content.bonus.weightBonus()

      return engine.fn.scale(
        content.score.value(),
        spawnBonus, weightBonus,
        0, 1
      )
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
      position: isPeacefulMode ? undefined : position.clone(),
      spawnTimer: spawnTimer,
      stun: stun,
    }),
    getStun: () => stun,
    getStunAccelerated: () => stunAccelerated,
    getStunAcceleratedValue: () => engine.fn.clamp(stunAccelerated / maxStun),
    getStunApplicationAccelerated: () => stunApplicationAccelerated,
    getStunValue: () => engine.fn.clamp(stun / maxStun),
    import: function (data = {}) {
      // Prefer imported state when not peaceful mode, otherwise spawn at danger distance
      const defaultPosition = engine.position.getVector().subtract({
        z: this.dangerDistance(),
      })

      position = engine.tool.vector3d.create(
        isPeacefulMode ? defaultPosition : (data.position || defaultPosition)
      )

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
    isDanger: function () {
      return this.dangerValue() > 0
    },
    isPeacefulMode: () => isPeacefulMode,
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
    rushVelocity: () => content.movement.velocityMax() * rushVelocityRate,
    position: () => position.clone(),
    reset: function () {
      position = engine.tool.vector3d.create()
      spawnTimer = 0
      stun = 0
      stunAccelerated = 0
      stunApplicationAccelerated = 0

      return this
    },
    setPeacefulMode: function (value) {
      isPeacefulMode = Boolean(value)

      return this
    },
    update: function () {
      const delta = engine.loop.delta(),
        maxVelocity = content.movement.velocityMax()

      // Handle peaceful mode
      if (isPeacefulMode) {
        return
      }

      // Handle spawn timer
      if (spawnTimer > 0) {
        return
      }

      // Handle stun status effect
      if (stun > 0) {
        stun = Math.max(0, stun - delta)
      }

      if (stunApplication > 0) {
        stunApplication = Math.max(0, stunApplication - delta)
      }

      stunAccelerated = engine.fn.accelerateValue(
        stunAccelerated,
        stun,
        Math.max(1, stunAccelerated)
      )

      stunApplicationAccelerated = engine.fn.accelerateValue(
        stunApplicationAccelerated,
        stunApplication,
        4,
        1/4
      )

      if (stun > 0) {
        position.z -= delta * maxVelocity * stunFallRate

        return this
      }

      // Movement
      const speed = this.calculateSpeed()

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
