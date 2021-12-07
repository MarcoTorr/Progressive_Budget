const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
  
let db;
let budgetVersion;

const request = indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function(e) {
    let db = e.target.result
    db.createObjectStore("pending", {autoIncrement: true})
};

request.onerror = function (e) {
    console.log(`Something failed ${e.target.errorCode}`)
};

request.onsuccess = function (e) {
    db= e.target.result;
    if(navigator.onLine) {
        checkDatabase();
    };
};
function saveRecord(record){
    const transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    store.add(record);
}

function checkDatabase() {
    let transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Concept-Type" : "application/json"
                }
            }).then((response) => response.json())
            .then((res) => {
                if(res.length !== 0) {
                    transaction = db.transaction(['BudgetStore'], 'readwrite');
                    const currentStore = transaction.objectStore("BudgetStore");
                    currentStore.clear();
                }
            })
        }
    }
}

window.addEventListener("online", checkDatabase);