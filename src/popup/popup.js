// 给按钮添加绑定
let initPage = (dom, html) => {
  html = html.map(value => {
    return `
      <tr>
        <td>${value.key}</td>
        <td>${value.name}</td>
        <td><button class="btn btn-outline-success">使用</button></td>
        <td><button class="btn btn-outline-danger">删除</button></td>
      </tr>
    `
  })
  html.unshift(`
    <tr>
      <th>序号</th>
      <th>名称</th>
      <th>使用</th>
      <th>删除</th>
    </tr>
  `)
  dom.innerHTML = html.join('')
}
document.addEventListener('DOMContentLoaded', function () {
  //获取页面级通信的端口
  console.log(1)
  let port, tab
  const list = document.getElementById('list'), startButton = document.getElementById('start')
  //查询当前点击标签页
  let data = {
    flag: false
  }
  chrome.tabs.query({active: true}, tabs => {
    tab = tabs[0]
    // 与当前标签页建立链接
    port = chrome.tabs.connect(tab.id, {
      name: 'record'
    });
    port.postMessage({
        message: 'getAll',
        data: {
          table: 'recordHistory'
        }
    })
    port.onMessage.addListener((msg, sender) => {
      console.log(msg, sender.frameId, sender, sender)
      switch (msg.message) {
        case 'getAll':
          initPage(list, msg.result)
          data.flag = msg.flag
          if (data.flag) {
            startButton.innerHTML = '结束'
          } else {
            startButton.innerHTML = '开始'
          }
          break
        case 'add':
          console.log(msg.result)
        default:
          break
        }
    });
  })
  startButton.addEventListener('click', 
    () => {
      if (data.flag) {
        let  name
        startButton.innerText = '开始'
        data.flag = false
        while (true) {
          name = prompt('请输入名称')
          if (!name || name.length) {
            break
          }
        }
        port.postMessage({
          message: 'stop',
          data: {
            name,
            table: 'recordHistory'
          }
        })
      } else {
        data.flag = true
        startButton.innerText = '结束'
        port.postMessage({
          message: 'start',
        })
        chrome.runtime.sendMessage('clear')
        chrome.tabs.executeScript(tab.id, { file: 'content-script.js', allFrames: true })
      }
  })
  list.addEventListener('click',
    e => {
      if (/success$/.test(e.target.className)) {
        port.postMessage({
          message: 'use',
          data: {
            table: 'recordHistory',
            key: e.path[2].children[0].innerText
          }
        })
      } else if (/danger$/.test(e.target.className)) {
        port.postMessage({
          message: 'delete',
          data: {
            table: 'recordHistory',
            key: e.path[2].children[0].innerText
          }
        })
      }
  })
})