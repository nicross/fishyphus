content.minigame = (() => {
  const isDebug = true

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
        catch: function () {
          this.change('inactive')
        },
      },
    },
  })

  const handlers = {
    debug: {
      action: () => {
        if (!isAllowed()) {
          return machine.pubsub.emit('disallowed')
        }

        const fish = content.fish.closest()

        if (fish) {
          machine.pubsub.emit('start', {fish, isDebug})
          machine.pubsub.emit('finish', {fish, isDebug})
        }
      },
      update: () => {
        // Do nothing
      },
    },
    inactive: {
      action: () => {
        // Check for fish and advance to next state
        // Otherwise emit disallowed
      },
      update: () => {
        // Do nothing
      },
    },
    casting: {
      action: () => {
        // Advance to next step
      },
      update: () => {
        // Increment depth
        // Auto-advance if depth limit is reached
      },
    },
    waiting: {
      action: () => {
        // Ignore if wait timer is positive
        // Otherwise advance to next step
      },
      update: () => {
        // Decrement wait timer
        // Auto-advance if wait timer is very negative
      },
    },
    reeling: {
      action: () => {
        // Increase reel speed each tap
      },
      update: () => {
        // Decrement depth
        // Catch and advance if depth is at or above zero
      },
    },
  }

  function isAllowed() {
    return (machine.is('inactive') || isDebug)
      && content.movement.velocityValue() < 0.25
      && content.fish.closest()
  }

  return machine.pubsub.decorate({
    action: function () {
      handlers[machine.state].action()

      return this
    },
    isActive: () => !machine.is('inactive') && !isDebug,
    isAllowed,
    reset: function () {
      machine.state = isDebug ? 'debug' : 'inactive'

      return this
    },
    state: () => machine.state,
    update: function () {
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
