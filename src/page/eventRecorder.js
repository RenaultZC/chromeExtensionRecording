import finder from '@medv/finder'
const eventsToRecord = {
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  CHANGE: 'change',
  KEYDOWN: 'keydown',
  SELECT: 'select',
  SUBMIT: 'submit',
  LOAD: 'load',
  UNLOAD: 'unload'
}  
class EventRecorder {
  constructor () {
    this.eventLog = []
    this.previousEvent = null
    this.dataAttribute = null
    this.isTopFrame = (window.location === window.parent.location)
  }

  start () {
    this._initializeRecorder()
  }

  _initializeRecorder () {
    const events = Object.values(eventsToRecord)
    if (!window.pptRecorderAddedControlListeners) {
      this.addAllListeners(events)
      window.pptRecorderAddedControlListeners = true
    }

    if (this.isTopFrame) {
      this.sendMessage({selector: undefined, value: window.location.href, action: 'goto*'})
      this.sendMessage({selector: undefined, value: { width: window.innerWidth, height: window.innerHeight }, action: 'viewport*'})
    }
  }

  addAllListeners (events) {
    const boundedRecordEvent = this.recordEvent.bind(this)
    events.forEach(type => {
      window.addEventListener(type, boundedRecordEvent, true)
    })
  }

  sendMessage (msg) {
    console.debug('sending message', msg)
    try {
      if (chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.sendMessage(msg)
      } else {
        this.eventLog.push(msg)
      }
    } catch (err) {
      console.debug('caught error', err)
    }
  }

  recordEvent (e) {
    if (this.previousEvent && this.previousEvent.timeStamp === e.timeStamp) return
    this.previousEvent = e

    try {
      const selector = this.dataAttribute && e.target.hasAttribute && e.target.hasAttribute(this.dataAttribute)
        ? formatDataSelector(e.target, this.dataAttribute)
        : finder(e.target, {seedMinLength: 5, optimizedMinLength: 10})

      const msg = {
        selector: selector,
        value: e.target.value,
        tagName: e.target.tagName,
        action: e.type,
        keyCode: e.keyCode ? e.keyCode : null,
        href: e.target.href ? e.target.href : null,
        coordinates: getCoordinates(e)
      }
      this.sendMessage(msg)
    } catch (e) { }
  }

  getEventLog () {
    return this.eventLog
  }

  clearEventLog () {
    this.eventLog = []
  }
}

function getCoordinates (evt) {
  const eventsWithCoordinates = {
    mouseup: true,
    mousedown: true,
    mousemove: true,
    mouseover: true
  }
  return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
}

function formatDataSelector (element, attribute) {
  return `[${attribute}="${element.getAttribute(attribute)}"]`
}

window.eventRecorder = new EventRecorder()
window.eventRecorder.start()