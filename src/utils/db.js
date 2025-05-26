import { openDB, deleteDB } from 'idb';
import { getCookie } from "@/utils/auth";

class IDB {
    #name = process.env.VUE_APP_DB_NAME;
    #objectStore1 = [
        {
            name: 'tableConfig',
            options: { keyPath: 'id' }
        },
        {
            name: 'menuProperty',
            options: { keyPath: 'id' }
        },
        {
            name: 'fillInPage',
            options: { keyPath: 'id' }
        },
        {
            name: 'dict',
            options: { keyPath: 'id' }
        },
        {
            name: 'printArgs',
            options: { keyPath: 'id' }
        },
        {
            name: 'formData',
            options: { keyPath: 'id' }
        }
    ]
    #versions = [
        // 版本一
        (db) => {
            const objectStore = this.#objectStore1
            for (let i = 0; i < objectStore.length; i++) {
                const store = objectStore[i]
                if (!db.objectStoreNames.contains(store.name)) {
                    this._createObjectStore(db, store.name, store.options)
                }
            }
        },
        // 版本二
        (db) => {
            const objectStore = this.#objectStore1
            for (let i = 0; i < objectStore.length; i++) {
                const store = objectStore[i]
                if (!db.objectStoreNames.contains(store.name)) {
                    this._createObjectStore(db, store.name, store.options)
                }
            }
        },
    ]
    constructor() {
        this._initDb()
    }
    async _getDb() {
        const versions = this.#versions
        const LAST_VERSION = versions.length;

        const db = await openDB(this.#name, LAST_VERSION, {
            async upgrade(db, oldVersion, newVersion) {
                const lastVersion = Math.min(newVersion, LAST_VERSION);
                for (let upgradeVersion = oldVersion; upgradeVersion < lastVersion; upgradeVersion++) {
                    await versions[upgradeVersion](db)
                }

            }
        })
        return db
    }

    _createObjectStore(db, storeName, options) {
        db.createObjectStore(storeName, options);
    }
    async _setObjectStore(storeName, key, value) {
        const dbPromise = await this._getDb()
        const transaction = dbPromise.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const userName = getCookie("username")
        const nextKey = `${userName}-${key}`
        store.put({ ...value, id: nextKey });
        await transaction.done
        dbPromise.close()
    }

    async _getObjectStore(storeName, key) {
        const dbPromise = await this._getDb()
        const userName = getCookie("username")
        const nextKey = `${userName}-${key}`
        const value = dbPromise.get(storeName, nextKey);
        dbPromise.close()
        return value
    }

    async _removeObjectStore(storeName, key) {
        const dbPromise = await this._getDb()
        const userName = getCookie("username")
        const nextKey = `${userName}-${key}`
        const value = dbPromise.delete(storeName, nextKey);
        dbPromise.clear(storeName)
        dbPromise.close()
        return value
    }

    async _clearObjectStore(storeName) {
        const dbPromise = await this._getDb()
        const value = dbPromise.clear(storeName)
        dbPromise.close()
        return value
    }

    _initDb() {
        this._getDb()
    }

    static getObjectStore(storeName, key) {
        const instance = IDB.getInstance()
        return instance._getObjectStore(storeName, key);
    }

    static removeObjectStore(storeName, key) {
        const instance = IDB.getInstance()
        return instance._removeObjectStore(storeName, key);
    }

    static clearObjectStore(storeName) {
        const instance = IDB.getInstance()
        return instance._clearObjectStore(storeName);
    }

    static setObjectStore(storeName, key, value) {
        const instance = IDB.getInstance()
        return instance._setObjectStore(storeName, key, value);
    }

    static clearDB() {
        return new Promise(async (resolve, reject) => {
            try {
                const instance = IDB.getInstance()
                await deleteDB(instance.#name)
                resolve({})
            } catch (err) {
                reject(err)
            }
        })

    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new IDB();
        }
        return this.instance;
    }

}

export {
    IDB
}

export const initDb = () => {
    return IDB.getInstance()
}