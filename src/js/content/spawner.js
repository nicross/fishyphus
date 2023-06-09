content.spawner = (() => {
  const chunkSize = 200,
    defaultCooldown = 300,
    pubsub = engine.tool.pubsub.create()

  const generator = engine.tool.generator2d.create({
    generator: generateChunk,
    radius: 3,
    scale: chunkSize,
  })

  const streamer = engine.tool.streamer2d.create({
    radius: 500,
  }).on('load', onLoad).on('unload', onUnload)

  let activeSpots = new Set(),
    cooldowns = {}

  function generateChunk(x, y) {
    const isOrigin = x == 0 && y == 0

    const chunk = {
      id: `chunk:${x}:${y}`,
      x: x * chunkSize,
      y: y * chunkSize,
    }

    const srand = engine.fn.srand('spawner', chunk.id)

    if (srand() > 0.5 && !isOrigin) {
      return chunk
    }

    chunk.spot = {
      chunk,
      id: chunk.id,
      rootFrequency: engine.fn.fromMidi(
        engine.fn.choose([
          // Amin scale
          57, 59, 60, 62, 64, 65, 67,
        ], srand())
      ),
      sign: srand() > 0.5 ? 1 : -1,
      x: isOrigin ? 0 : (chunk.x + (chunkSize * srand(-1/3, 1/3))),
      y: isOrigin ? 0 : (chunk.y + (chunkSize * srand(-1/3, 1/3))),
    }

    streamer.add(chunk.spot)

    return chunk
  }

  function onLoad(spot) {
    const isCooldown = spot.id in cooldowns

    if (isCooldown) {
      return
    }

    pubsub.emit('spawn', spot)
    activeSpots.add(spot)
  }

  function onUnload(spot) {
    pubsub.emit('despawn', spot)
    activeSpots.delete(spot)
  }

  function updateCooldowns() {
    const delta = engine.loop.delta()

    for (let [key, cooldown] of Object.entries(cooldowns)) {
      if (cooldown > delta) {
        cooldowns[key] = cooldown - delta
      } else {
        delete cooldowns[key]
      }
    }
  }

  return pubsub.decorate({
    activeSpots: () => [...activeSpots],
    deactivateSpot: function (spot) {
      cooldowns[spot.id] = defaultCooldown
      activeSpots.delete(spot)
      pubsub.emit('despawn', spot)

      return this
    },
    export: () => ({
      cooldowns: {...cooldowns},
    }),
    import: function (data = {}) {
      cooldowns = data.cooldowns || {}

      return this
    },
    isCooldown: (id) => id in cooldowns,
    reset: function () {
      activeSpots = new Set()
      cooldowns = {}

      generator.reset()
      streamer.reset()

      return this
    },
    update: function () {
      generator.update()
      streamer.update()

      updateCooldowns()

      return this
    },
  })
})()

engine.ready(() => {
  content.minigame.on('success', ({fish}) => {
    content.spawner.deactivateSpot(fish.spot)
  })
})

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.spawner.update()
})

engine.state.on('export', (data) => data.spawner = content.spawner.export())
engine.state.on('import', ({spawner}) => content.spawner.import(spawner))
engine.state.on('reset', () => content.spawner.reset())
