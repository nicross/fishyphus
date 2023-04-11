content.minigame = (() => {
  const isDebug = false

  const castSpeed = 5, // meters per second
    cooldownTime = 1, // seconds
    maxDepth = 50, // meters
    reelBonusAcceleration = 1, // value per bonus per second
    reelBonusMultiplier = 1/4, // added speed per reel per count
    reelInitialBonusFactor = 4, // initial bonus at best timing
    reelInitialBonusSlope = 1/3, // exponent of bonus around best timing
    reelSpeed = 5, // meters per second
    waitTimerBonusFactor = 1/4, // scalar at best timing
    waitTimerBonusSlope = 1/3, // exponent of bonus around best timing
    waitTimerFactor = 2/5 // seconds per depth

  const machine = engine.tool.fsm.create({
    state: isDebug ? 'debug' : 'inactive',
    transition: {
      debug: {},
      inactive: {
        cast: function () {
          this.change('casting')
        },
      },
      casting: {
        wait: function () {
          this.change('waiting')
        },
      },
      waiting: {
        reel: function () {
          this.change('reeling')
        },
      },
      reeling: {
        finish: function () {
          this.change('inactive')
        },
      },
    },
  })

  const handlers = {
    /**
     * Debug state
     *
     * Emits:
     * - `inactive-disallowed`: when no fish are nearby
     * - `success`: when fish are caught
     */
    debug: {
      action: () => {
        // Catch nearby fish
        const fish = content.fish.closest()

        if (fish) {
          machine.pubsub.emit('success', {fish, isDebug})
        } else {
          machine.pubsub.emit('inactive-disallowed')
        }
      },
      update: () => {
        // Do nothing
      },
    },
    /**
     * Inactive state data:
     * - `cooldown` - time remaining between casts
     *
     * Emits:
     * - `inactive-disallowed`: when no fish are nearby
     */
    inactive: {
      action: () => {
        // Ignore cooldown timer
        if (data.cooldown > 0) {
          return
        }

        const fish = content.fish.closest()

        // Cast when fish are nearby
        if (!fish) {
          return machine.pubsub.emit('inactive-disallowed')
        }

        // Set up data for next state
        data = {
          depth: 0,
          depthValue: 0,
          fish,
          value: 0,
        }

        machine.dispatch('cast')
      },
      update: () => {
        // Decrement cooldown timer
        if (data.cooldown > 0) {
          data.cooldown -= engine.loop.delta()
        }
      },
    },
    /**
     * Casting state data:
     * - `alert`: whether the ideal depth has been surpassed
     * - `depth`: the current depth
     * - `depthValue`: the current depth ratio
     * - `fish`: the target fish
     * - `value`: closeness to the sweet spot within [0, 1]
     *
     * Emits:
     * - `casting-alert`: when the ideal depth has been reached
     */
    casting: {
      action: () => {
        // Set up data for next state
        data.timer = (data.fish.distance + Math.abs(data.depth - data.fish.distance)) * waitTimerFactor

        // Reward good timing after the alert
        if (data.depth >= data.fish.distance) {
          data.timer *= engine.fn.lerpExp(1, waitTimerBonusFactor, data.value, waitTimerBonusSlope)
        }

        data.timer = Math.max(1, data.timer)

        delete data.alert
        delete data.value

        machine.dispatch('wait')
      },
      update: function () {
        const delta = engine.loop.delta()

        // Increment depth at casting speed
        data.depth += castSpeed * delta
        data.depthValue = engine.fn.clamp(data.depth / maxDepth)

        // Calculate the value of the sweet spot (one second in either direction)
        const distance = data.fish.distance

        if (engine.fn.between(data.depth, distance - castSpeed, distance)) {
          data.value = engine.fn.scale(data.depth, distance - castSpeed, distance, 0, 1)
        } else if (engine.fn.between(data.depth, distance, distance + castSpeed)) {
          data.value = engine.fn.scale(data.depth, distance, distance + castSpeed, 1, 0)
        } else {
          data.value = 0
        }

        // Alert once at best depth
        if (!data.alert && data.depth >= distance) {
          data.alert = true
          machine.pubsub.emit('casting-alert')
        }

        // Auto-action when maximum depth is reached
        if (data.depth >= maxDepth) {
          this.action()
        }
      },
    },
    /**
     * Waiting state data:
     * - `alert`: whether the timer has reached zero
     * - `depth`: the current depth
     * - `depthValue`: the current depth ratio
     * - `fish`: the target fish, deleted if canceled
     * - `timer`: the time remaining to reel
     *
     * Emits:
     * - `waiting-alert`: when the timer has reached zero
     * - `waiting-cancel`: when the wait has been canceled
     */
    waiting: {
      action: () => {
        // Cancel if timer has not run out
        if (data.timer > 0) {
          data.canceled = true
          machine.pubsub.emit('waiting-cancel')
        }

        // Otherwise reel it in
        // Set up data for next state
        data.bonus = 0
        data.count = 0

        // Reward good timing after the alert
        const value = engine.fn.clamp(
          engine.fn.scale(
            data.timer,
            0, -1,
            1, 0
          )
        )

        data.bonus += engine.fn.lerpExp(0, reelInitialBonusFactor, value, reelInitialBonusSlope)

        delete data.alert
        delete data.timer

        machine.dispatch('reel')
      },
      update: () => {
        // Decrease timer
        data.timer -= engine.loop.delta()

        // Alert once at timer expire
        if (!data.alert && data.timer <= 0) {
          data.alert = true
          machine.pubsub.emit('waiting-alert')
        }
      },
    },
    /**
     * Reeling state data:
     * - `bonus`: the current bonus to reel speed
     * - `cancel`: true when reeling early
     * - `count`: the total number of reels
     * - `depth`: the current depth
     * - `depthValue`: the current depth ratio
     * - `fish`: the target fish
     *
     * Emits:
     * - `failure`: when a canceled attempt has been reeled in
     * - `reel-bonus`: whenenever a bonus has been applied
     * - `success`: when a fish has been caught
     */
    reeling: {
      action: () => {
        // Apply bonus proportional to times pressed
        data.count += 1
        data.bonus = 1 + (data.count * reelBonusMultiplier)

        machine.pubsub.emit('reeling-bonus')
      },
      update: () => {
        const delta = engine.loop.delta()

        // Accelerate bonus toward zero at rate proportional to itself
        data.bonus = engine.fn.accelerateValue(data.bonus, 0, (data.bonus + reelBonusMultiplier) * reelBonusAcceleration)

        // Decrease depth at reeling speed
        data.depth -= reelSpeed * (1 + data.bonus) * delta
        data.depthValue = engine.fn.clamp(data.depth / maxDepth)

        // End reeling when depth crosses zero
        if (data.depth > 0) {
          return
        }

        const {
          canceled,
          fish,
        } = data

        data = {
          cooldown: cooldownTime,
        }

        if (canceled) {
          machine.pubsub.emit('failure')
        } else {
          machine.pubsub.emit('success', {fish})
        }

        machine.dispatch('finish')
      },
    },
  }

  let isActiveAccelerated = 0,
    data = {}

  return machine.pubsub.decorate({
    action: function () {
      handlers[machine.state].action()

      return this
    },
    data: () => ({...data}),
    isActive: () => !machine.is('inactive') && !isDebug,
    isActiveAccelerated: () => isActiveAccelerated,
    isFish: (id) => data?.fish?.id == id,
    reset: function () {
      isActiveAccelerated = 0
      machine.state = isDebug ? 'debug' : 'inactive'

      return this
    },
    state: () => machine.state,
    update: function () {
      isActiveAccelerated = engine.fn.accelerateValue(
        isActiveAccelerated,
        this.isActive() ? 1 : 0,
        2
      )

      handlers[machine.state].update()

      return this
    },
  })
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.minigame.update()
})

engine.state.on('reset', () => content.minigame.reset())
