import indexDB from './indexdb'
let indexdb = new indexDB('record', 2, {
  'recordHistroy': {
    name: 'recordHistory',
    key: 'key',
    cursorIndex: []
  }
})
indexdb.init()
let data = {
  flag: false
}
let getStroage = async () => {
  return new Promise((res, rej) => {
    try {
      chrome.storage.local.get(['recording'], ({ recording }) => {
        res(recording)
      })
    } catch (e) {}
  })
}
let cleartroage = () => {
  return new Promise((res, rej) => {
    try {
      chrome.storage.local.set({ recording: [] }, () => {
        res('ok')
      })
    } catch (e) {}
  })
}
chrome.runtime.onConnect.addListener(
  port => {
    port.onMessage.addListener(async request => {
      console.log(request)
      let event, xhr
      switch (request.message) {
        case 'getAll' :
          event = await indexdb.getAll(request.data.table)
          port.postMessage({
            message: 'getAll',
            result: event.target.result,
            flag: data.flag
          });
          break
        case 'start' :
          data.flag = true
          break;
        case 'stop' :
          event = await getStroage()
          if (request.data.name) {
            event = await indexdb.add(request.data.table, {
              name: request.data.name,
              value: event
            })
          }
          console.log(event)
          data.flag = false
          break;
        case 'use':
          event = await indexdb.get(request.data.table, request.data.key)
          console.log(event) 
          if (window.XMLHttpRequest){
            xhr = new XMLHttpRequest();
          }else{
            xhr = new ActiveXObject('Microsoft.XMLHTTP')
          } 
          xhr.open('post', 'http://localhost:1000/puppeteer', true)
          xhr.send(JSON.stringify(event.target.result))
          break
        case 'delete':
          event = await indexdb.delete(request.data.table, request.data.key)
          console.log(event)
          break
        default:
          port.postMessage({
            message: 'default',
            result: '未定义指令'
          });
          break  
      }
      return true;
    })
	}
);
