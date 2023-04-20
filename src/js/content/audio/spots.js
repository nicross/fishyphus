content.audio.spots = (() => {
  const bus = content.audio.createBus(),
    spotDepth = -1,
    soundLimit = 4

  const sounds = new Map()

  function createSound(spot) {
    return content.audio.spots.sound.instantiate({
      destination: bus,
      spot,
      x: spot.x,
      y: spot.y,
      z: spotDepth,
    })
  }

  function getClosest() {
    const distances = new Map(),
      position = engine.position.getVector()

    return content.spawner.activeSpots().reduce((spots, spot) => {
      // Cache distance
      const distance = position.distance(spot)
      distances.set(spot, distance)

      // Push and sort
      spots.push(spot)
      spots.sort((a, b) => distances.get(a) - distances.get(b))

      // Slice to limit
      return spots.slice(0, soundLimit)
    }, [])
  }

  return {
    reset: function () {
      for (const sound of sounds.values()) {
        sound.destroy()
      }

      sounds.clear()

      return this
    },
    update: function () {
      const next = new Set(getClosest())

      // Remove current sounds
      for (const [spot, sound] of sounds.entries()) {
        if (!next.has(spot)) {
          sounds.delete(spot)
          sound.destroy()
        }
      }

      // Add next sounds
      for (const spot of next) {
        if (!sounds.has(spot)) {
          sounds.set(spot, createSound(spot))
        }
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.spots.update()
})

engine.state.on('reset', () => content.audio.spots.reset())
