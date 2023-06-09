app.utility.dom = {
  contains: (parentElement, element) => {
    if (element instanceof Element) {
      do {
        if (element === parentElement) {
          return true
        }
      } while (element = element.parentNode)
    }
    return false
  },
  generateUniqueId: ({length = 16, prefix = ''} = {}) => {
    const chars = 'adcdefghijklmnopqrstuvwxyz0123456789'

    let id

    do {
      id = prefix
      for (let i = 0; i < length; i += 1) {
        id += chars[Math.floor(Math.random() * chars.length)]
      }
    } while (document.getElementById(id))

    return id
  },
  removeChildren: function (element) {
    if (element instanceof Node) {
      while (element.firstChild) {
        element.firstChild.remove()
      }
    }
    return this
  },
  toElement: (html) => {
    const template = document.createElement('template')
    template.innerHTML = html.trim()
    return template.content.firstChild
  },
}
