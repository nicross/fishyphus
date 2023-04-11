app.component.slider = {}

app.component.slider.hydrate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.slider.prototype = {
  construct: function (root, initialValue) {
    this.inputElement = root.querySelector('.c-slider--input input')
    this.rootElement = root
    this.valueElement = root.querySelector('.c-slider--value')

    this.inputElement.addEventListener('input', this.onInput.bind(this))
    this.inputElement.addEventListener('keydown', this.onKeydown.bind(this))

    this.setValueAsFloat(initialValue, true)

    this.inputElement.addEventListener('focus', () => this.setAriaLive(true))
    this.inputElement.addEventListener('blur', () => this.setAriaLive(false))

    engine.tool.pubsub.decorate(this)

    return this
  },
  decorateValue: function (value) {
    if (!this.isSigned() || value <= 0) {
      return value
    }

    return `+${value}`
  },
  decrement: function () {
    return this.setValue(this.getValue() - this.getStep())
  },
  getMax: function () {
    return Number(this.inputElement.max)
  },
  getMin: function () {
    return Number(this.inputElement.min)
  },
  getStep: function () {
    return Number(this.inputElement.step)
  },
  getValue: function () {
    return Number(this.inputElement.value)
  },
  getValueAsFloat: function () {
    return engine.fn.scale(this.getValue(), this.getMin(), this.getMax(), 0, 1)
  },
  increment: function () {
    return this.setValue(this.getValue() + this.getStep())
  },
  isSigned: function () {
    return this.getMin() < 0
  },
  onInput: function () {
    this.valueElement.innerHTML = this.decorateValue(this.getValue())
    this.emit('change', this.getValueAsFloat())

    return this
  },
  onKeydown: function (e) {
    if (e.code == 'Tab') {
      return
    }

    e.preventDefault()
  },
  setAriaLive: function (state) {
    if (state) {
      this.valueElement.setAttribute('aria-live', 'polite')
    } else {
      this.valueElement.removeAttribute('aria-live')
    }

    return this
  },
  setValue: function (value, isInitial = false) {
    value = engine.fn.clamp(value, this.getMin(), this.getMax())

    this.inputElement.value = value
    this.valueElement.innerHTML = this.decorateValue(value)

    if (!isInitial) {
      this.emit('change', this.getValueAsFloat())
      this.inputElement.dispatchEvent(new Event('input', {bubbles: true}))
    }

    return this
  },
  setValueAsFloat: function (value, isInitial = false) {
    return this.setValue(engine.fn.scale(value, 0, 1, this.getMin(), this.getMax()), isInitial)
  },
}
