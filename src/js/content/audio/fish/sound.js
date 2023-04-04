content.audio.fish.sound = engine.sound.extend({
  fadeInDuration: 1/4,
  fadeOutDuration: 1/4,
  filterModel: engine.ear.filterModel.musical.extend({
    defaults: {
      coneRadius: engine.const.tau * 0.5,
      minColor: 1/3,
      power: 1,
    },
  }),
  gainModel: engine.ear.gainModel.realisticHorizon.extend({
    defaults: {
      horizonPower: 1,
      maxDistance: 400,
      minDistance: 1,
      power: 0.5,
    },
  }),
  relative: false,
  reverb: false,
  // Lifecycle
  onConstruct: function ({
    fish,
  } = {}) {
    this.fish = fish

    this.delay = engine.effect.dubDelay({
      filterFrequency: engine.fn.fromMidi(60),
      wet: engine.fn.fromDb(0),
    })

    this.delay.output.connect(this.output)

    this.sequence = this.generateSequence()
    this.beginSequence()
  },
  onDestroy: function () {
    this.endSequence()

    if (this.synth) {
      this.synth.stop()
    }
  },
  onUpdate: function ({delta}) {
    this.setVector(this.fish.vector)

    if (!this.synth) {
      return
    }

    const {
      color,
      gain,
    } = this.calculateRealtimeParameters()

    engine.fn.setParam(this.synth.filter.frequency, this.rootFrequency * color)
    engine.fn.setParam(this.synth.param.gain, gain)
  },
  // Methods
  calculateRealtimeParameters: function () {
    return {
      color: engine.fn.lerpExp(1, 6, this.fish.value, 2),
      gain: engine.fn.fromDb(engine.fn.lerp(-12, -15, this.fish.value))
    }
  },
  beginSequence: function () {
    this.sequenceIndex = 0
    this.sequenceRunning = true

    this.doSequence()

    return this
  },
  doSequence: function () {
    if (!this.sequenceRunning) {
      return
    }

    // Parameters
    const accent = this.sequence.accents[this.sequenceIndex % this.sequence.accents.length],
      context = engine.context(),
      detune = engine.fn.randomFloat(-5, 5),
      duration = this.sequence.durations[this.sequenceIndex % this.sequence.durations.length] * 0.25,
      frequency = this.sequence.notes[this.sequenceIndex],
      now = engine.time()

    const {
      color,
      gain,
    } = this.calculateRealtimeParameters()

    // Synthesis
    const synth = engine.synth.simple({
      detune,
      frequency,
      gain,
      type: 'triangle',
    }).chainAssign(
      'attenuation', context.createGain()
    ).filtered({
      detune,
      frequency: frequency * color,
      type: 'lowpass',
    }).connect(this.delay.input)

    synth.attenuation.gain.value = accent

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(gain, now + duration/8)
    synth.param.gain.setValueAtTime(gain, now + duration - duration/8)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)

    // Set timer
    const pulse = context.createConstantSource()
    pulse.start()
    pulse.stop(now + duration)
    pulse.onended = () => this.doSequence()

    // Increment index
    this.sequenceIndex = (this.sequenceIndex + 1) % this.sequence.notes.length

    // Pass frequency
    this.rootFrequency = frequency
    this.filterModel.options.frequency = frequency
  },
  endSequence: function () {
    this.sequenceRunning = false

    return this
  },
  generateSequence: function () {
    const srand = engine.fn.srand('fish', 'melody', this.fish.id)
    const count = Math.round(srand(3, 6))
    const repeats = Math.round(srand(2, 4))

    const scale = [
      57,
      59,
      60,
      62,
      64,
      65,
      67,
    ].map((note) => engine.fn.fromMidi(note))

    // Generate accents
    const accents = []

    for (let i = 0; i < count; i += 1) {
      accents.push(
        engine.fn.choose([0.5, 1], srand())
      )
    }

    // Generate durations
    const durations = []

    for (let i = 0; i < count; i += 1) {
      durations.push(
        engine.fn.choose([0.5, 1], srand())
      )
    }

    // Generate notes
    let current = Math.round(srand(0, count - 1))

    let notes = [
      scale[current],
    ]

    for (let i = 1; i < count; i += 1) {
      const step = Math.round(srand(1, 3))
      current = current + step

      notes.push(
        scale[current % scale.length] * (2 ** Math.floor(current / scale.length))
      )
    }

    if (srand() > 0.5) {
      notes.reverse()
    }

    // Split notes
    const split = Math.round(srand(1, count - 1))

    notes = [
      ...notes.slice(0, split),
      ...notes.slice(split).reverse(),
    ]

    // Generate repeating sequence
    const sequence = []

    for (let i = 0; i < repeats - 1; i += 1) {
      sequence.push(...notes)
    }

    // Split last repetition
    const splitLast = Math.round(srand(1, count - 2))

    sequence.push(
      ...notes.slice(0, splitLast),
      ...notes.slice(splitLast).reverse(),
    )

    return {
      accents,
      durations,
      notes: sequence,
    }
  },
})
