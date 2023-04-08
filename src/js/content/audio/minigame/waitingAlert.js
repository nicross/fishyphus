content.audio.minigame.waitingAlert = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth ping
}

content.minigame.on('waiting-alert', () => content.audio.minigame.waitingAlert())
