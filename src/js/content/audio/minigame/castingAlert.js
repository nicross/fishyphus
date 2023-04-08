content.audio.minigame.castingAlert = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth ping
}

content.minigame.on('casting-alert', () => content.audio.minigame.castingAlert())
