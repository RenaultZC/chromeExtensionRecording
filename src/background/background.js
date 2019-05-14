let recordingController = []
chrome.runtime.onMessage.addListener(
  (msg, sender) => {
    if (msg === 'clear') {
      console.log('clear')
      recordingController = []
    } else {
      recordingController.push(msg)
      msg.frameId = sender ? sender.frameId : null
      msg.frameUrl = sender ? sender.url : null
    }
    chrome.storage.local.set({ recording: recordingController }, () => {
      console.debug('stored recording updated', recordingController)
    })
  }
);