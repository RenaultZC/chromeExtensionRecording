class indexDB {
	constructor(datebaseName, version, store){
    this.indexedDB = window.indexedDB ||
    window.webkitindexedDB ||
    window.msIndexedDB ||
    window.mozIndexedDB
    this.datebaseName = datebaseName
    this.version = version
    this.store = store
	}
	init = async () => {
		this.request = this.indexedDB.open(this.datebaseName, this.version);
    this.request.onerror = () =>{
      console.log("打开数据库失败")
    }
    this.request.onsuccess = () => {
      console.log("打开数据库成功")
    }

    this.request.onupgradeneeded  = event => {
      this.db = event.target.result
      for(let t in this.store){
        if (!this.db.objectStoreNames.contains(this.store[t].name)) {
          var objectStore = this.db.createObjectStore(this.store[t].name, {
            keyPath: this.store[t].key,
            autoIncrement: true
          })
          for (let i = 0; i < this.store[t].cursorIndex.length; i++) {
            const element = this.store[t].cursorIndex[i]
            objectStore.createIndex(element.name, element.name, {
              unique: element.unique
            })
          }
        }
      }
    }
  }
  openDB = () =>{
    return new Promise((resolve, reject) => {
      this.request = this.indexedDB.open(this.datebaseName, this.version)
      this.request.onerror = function (event) {
        reject("error:" + event)
      }
      this.request.onsuccess = function (event) {
        resolve(event.target.result)
      }
    })
  }
  getAll = async table => {
    try {
      let db = await this.openDB()
      let store = db.transaction(table,"readonly").objectStore(table)
      let request = store.getAll()
      return new Promise(resolve => {
        request.onerror = () => {
          resolve("查询失败")
        }
        request.onsuccess = (event) => {
          resolve(event)
        }
      })
    } catch (e) {
      return Promise.reject(e);
    }
  }
  remove = async (table, id) => {
    try {
      let db = await this.openDB()
      let store = db.transaction(table,"readwrite").objectStore(table)
      let request = store.delete(id)
      return new Promise((resolve) => {
        request.onerror = () => {
          resolve(false)
        }
        request.onsuccess = () => {
          resolve(true)
        }
      })
    } catch (e) {
      return Promise.reject(e);
    }
  }
  add = async (table, data) => {
    try {
      let db = await this.openDB();
      let request = db
        .transaction(table, "readwrite")
        .objectStore(table)
        .add(data);

      return new Promise((resolve, reject) => {
        request.onerror = function() {
          reject(false);
        };
        request.onsuccess = function() {
          resolve(true);
        };
      });
    } catch (e) {
      console.log(e)
      return Promise.resolve(false);
    }
  }
  get = async (table, key) => {
    try {
      let db = await this.openDB()
      let store = db.transaction(table,"readonly").objectStore(table)
      let request = store.get(parseInt(key, 0))
      return new Promise(resolve => {
        request.onerror = () => {
          resolve("查询失败")
        }
        request.onsuccess = (event) => {
          resolve(event)
        }
      })
    } catch (e) {
      return Promise.reject(e);
    }
  }
  delete = async (table, key) => {
    try {
      let db = await this.openDB()
      let store = db.transaction(table,"readwrite").objectStore(table)
      let request = store.delete(parseInt(key, 0))
      return new Promise(resolve => {
        request.onerror = () => {
          resolve("删除失败")
        }
        request.onsuccess = (event) => {
          resolve("删除成功")
        }
      })
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
export default indexDB