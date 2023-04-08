content.audio.minigame.cast = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth down
}

content.minigame.on('after-inactive-cast', () => content.audio.minigame.cast())
