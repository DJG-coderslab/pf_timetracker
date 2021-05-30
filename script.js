


document.addEventListener('DOMContentLoaded', mainFunction);

configConnection = {
    apiHost: 'https://todo-api.coderslab.pl',
    options: {
        headers: {
            Authorization: '72cd7767-cf01-4e0e-bad9-5a1dc7ae3d98'
        }
    }
}

// const cC = configConnection;

function apiListTasks(){
  const cC = JSON.parse(JSON.stringify(configConnection));
    return fetch(cC.apiHost + '/api/tasks', cC.options)
    .then((resp) => {
        if (! resp.ok){
            alert("Coś nie tak...");
            // this handling is so so...
        }
        return resp.json();
    });
}

function apiListOperationsForTask(taskId){
  const cC = JSON.parse(JSON.stringify(configConnection));
    const url = cC.apiHost + '/api/tasks/' + taskId + '/operations';
    return fetch(url, cC.options)
    .then((resp) => {
        if (! resp.ok){
            alert("Error getListOperationsForTask");
        }
        return resp.json();
    })

}

function apiCreateTask(formJson){
  const cC = JSON.parse(JSON.stringify(configConnection));
  cC.options.method = 'POST';
  cC.options.body = formJson;
  cC.options.headers['Content-Type'] = 'application/json';
  return fetch(cC.apiHost + '/api/tasks', cC.options)
  .then(resp =>{
    if (! resp.ok) {alert("Creating new task -- ERROR!");}
    return resp.json();
  })
}

function apiDeleteTask(taskId){
  const cC = JSON.parse(JSON.stringify(configConnection));
  cC.options.method = 'DELETE';
  return fetch(cC.apiHost + '/api/tasks/' + taskId, cC.options)
  .then(resp =>{
    if (! resp.ok){alert("Delete task -- ERROR!");}
    return resp;
  })
}

function apiDeleteOperation(operationId){
  const cC = JSON.parse(JSON.stringify(configConnection));
  cC.options.method = 'DELETE';
  return fetch(cC.apiHost + '/api/operations/' + operationId, cC.options)
          .then(resp =>{
            if (! resp.ok){alert("Error while deleting the operation");}
            return resp;
          })

}

function apiUpdateOperation(operationId, data){
  // operationId --> string
  // data JSON.stringify() object
  const cC = JSON.parse(JSON.stringify(configConnection));
  cC.options.method = 'PUT';
  cC.options.body = data;
  cC.options.headers['Content-Type'] = 'application/json';
  return fetch(cC.apiHost + '/api/operations/' + operationId, cC.options)
               .then(resp => {
                 if (! resp.ok) {alert("ERROR while changing duration...");}
                 return resp.json();
               })
}

function apiUpdateTask(taskId, data){
  // operationId --> string
  // data JSON.stringify() object
  const cC = JSON.parse(JSON.stringify(configConnection));
  cC.options.method = 'PUT';
  cC.options.body = data;
  cC.options.headers['Content-Type'] = 'application/json';
  return fetch(cC.apiHost + '/api/tasks/' + taskId, cC.options)
                .then(resp =>{
                  if (! resp.ok) {alert("Error while updating the task");}
                  return resp.json();
                })

}

function apiCreateOperationForTask(taskId, data){
  const cC = JSON.parse(JSON.stringify(configConnection));
  cC.options.method = 'POST';
  cC.options.body = data;
  cC.options.headers['Content-Type'] = 'application/json';
  return fetch(cC.apiHost + '/api/tasks/' + taskId + '/operations', cC.options)
          .then (resp =>{
            if (! resp.ok){alert("ERROR while adding a new operation!");}
            return resp.json();
          })
}

function renderTask(task) {
  // task as json.data object 
  function createHeader(task) {
    const headerDiv = document.createElement("div");
    const someDiv = document.createElement("div");
    const h5 = document.createElement("h5");
    const h6 = document.createElement("h6");
    headerDiv.className =
      "card-header d-flex justify-content-between align-items-center";
    h6.className = "card-subtitle text-muted";
    h5.innerText = task.title;
    h6.innerText = task.description;
    someDiv.appendChild(h5);
    someDiv.appendChild(h6);
    headerDiv.appendChild(someDiv);
    headerDiv.appendChild(addTaskButtons(task));
    return headerDiv;
  }

  function addTaskButtons(task) {
    const div = document.createElement("div");
    if (task.status === "open") {
      const finishBtn = document.createElement("button");
      finishBtn.className = "btn btn-dark btn-sm js-task-open-only";
      finishBtn.addEventListener('click', updateTask);
      finishBtn.innerText = "Finish";
      div.appendChild(finishBtn);
    }
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-outline-danger btn-sm ml-2";
    delBtn.setAttribute('id', task.id);   // TODO need to change from id to dataset-id!
    delBtn.innerText = "Delete";
    delBtn.addEventListener('click', deleteTask);
    div.appendChild(delBtn);
    return div;
  }

  function createAddForm() {
      const addDiv = document.createElement("div");
      const form = document.createElement("form");
      const inputDiv = document.createElement("div");
      const input = document.createElement("input");
      const btnDiv = document.createElement("div");
      const btn = document.createElement("button");
      addDiv.className = "card-body";
      inputDiv.className = "input-group";
      input.className = "form-control";
      input.setAttribute('placeholder', 'Operation description');
      input.setAttribute('minlength', '5');
      input.setAttribute('name', 'description');
      btnDiv.className = "input-group-append";
      btn.classList = "btn btn-info";
      btn.innerText = "Add";
      btn.addEventListener("click", createOperationForTask)
      btnDiv.appendChild(btn);
      inputDiv.appendChild(input);
      inputDiv.appendChild(btnDiv);
      form.appendChild(inputDiv);
      addDiv.appendChild(form);
      return addDiv;
  }
  const section = document.createElement("section");
  section.className = "card mt-5 shadow-sm";
  section.dataset.sectionId = task.id;
  section.appendChild(createHeader(task));
  section.appendChild(renderOperations(apiListOperationsForTask(task.id)));
  if (task.status === 'open') {section.appendChild(createAddForm());}
  return section;
}

function renderTasks(tasksPromise) {
  // taskPromise as resp.json()
  tasksPromise.then((tasks) => {
    for (const task of tasks.data) {
      document.querySelector("main").appendChild(renderTask(task));
    }
  });
}

function renderOperations(listOperationsPromise){
  // listOperationsPromise there is a promise with resp.json()

    const ul = document.createElement("ul");
    ul.className = "list-group list-group-flush";
    listOperationsPromise.then(operationList => {
        for (const operation of operationList.data){
            ul.appendChild(renderOneOperation(operation));
        }
    })
    return ul;
}

function renderOneOperation(operation) {
  // operation there is a object of one operation

  function createButtons(operation) {
    const busyTimes = [
      {name: "+5m", duration: 5},
      {name: "+15m", duration: 15},
      {name: "+30m", duration: 30},
      {name: "+1h", duration: 60},
      {name: "+2h", duration: 120}
    ];

    const divBtns = document.createElement("div");
    const delBtn = document.createElement("button");
    if (operation.task.status === "open") {
    delBtn.className = "btn btn-outline-danger btn-sm";
    delBtn.addEventListener('click', deleteOperation);
    delBtn.innerText = "Delete";
      busyTimes.forEach((el) => {
        const btn = document.createElement("button");
        btn.classList = "btn btn-outline-success btn-sm mr-2";
        btn.dataset.duration = el.duration;
        btn.addEventListener("click", updateOperation);
        btn.innerText = el.name;
        divBtns.appendChild(btn);
      });
    divBtns.appendChild(delBtn);
    }
    return divBtns;
  }

  const li = document.createElement("li");
  const descDiv = document.createElement("div");
  const descSpan = document.createElement('span');
  li.dataset.operationId = operation.id;
  li.className =
    "list-group-item d-flex justify-content-between align-items-center";
  descSpan.innerText = operation.description;
  descSpan.setAttribute('name', 'description');
  descDiv.appendChild(descSpan);
  descDiv.appendChild(renderTimeDuration(operation.timeSpent));
  li.appendChild(descDiv);
  li.appendChild(createButtons(operation));
  return li;
}

function renderTimeDuration(minutes){
  function minutesToString(minutes) {
    let timeString = "";
    const hours = Math.floor(minutes / 60);
    const min = minutes % 60;
    if (hours) {timeString += hours + "h ";}
    if (min) {timeString += min + "m";}
    return timeString;
  }
  const timeSpan = document.createElement("span");
  timeSpan.dataset.currentDuration = minutes;
  timeSpan.className = "badge badge-success badge-pill ml-2";
  timeSpan.setAttribute('name', 'duration');
  timeSpan.innerText = minutesToString(minutes);
  return timeSpan;
}

function formToJson(formData){
    const formJson = {};
    for (key of formData.keys()){
        formJson[key] = formData.get(key);
    }
    return JSON.stringify(formJson);
}

function createTask(event){
  event.stopPropagation();
    event.preventDefault();
    const formData = new FormData(document.querySelector('#form-add-task'));
    formData.set("status", "open");
    const formJson = formToJson(formData);
    apiCreateTask(formJson).then(json => {
      document.querySelector("main").appendChild(renderTask(json.data));
    });
}

function deleteTask(event){
  event.stopPropagation();
    apiDeleteTask(event.target.id)
    .then(resp => {
      if (resp.ok){
        const section = closestParentElement(event.target, 'section')
        section.setAttribute('id', 'section-to-remove');
        section.parentElement.removeChild(document.querySelector('#section-to-remove'));
      }
    })
}

function closestParentElement(el, selector){
  for (; el && el !== document; el = el.parentNode){
    if (el.matches(selector)) return el;
  }
  return null;
}

function createOperationForTask(event){
  event.stopPropagation();
    event.preventDefault();
    const section = closestParentElement(event.target, 'section');
    const form = section.querySelector('form');
    const formData = new FormData(form);
    formData.set("timeSpent", 0);
    const formJson = formToJson(formData);
    const taskId = section.dataset.sectionId;
    const ul = section.querySelector('ul');
    apiCreateOperationForTask(taskId, formJson).then(json =>{
      ul.appendChild(renderOneOperation(json.data));
    })
}

function updateOperation(event){
  event.stopPropagation();
  function disableAllBtns(state){
    const btns = root.querySelectorAll('button[data-duration]');
    for (btn of btns){
      if (state === "on") {
        btn.setAttribute('disabled', '');
      } else {
        btn.removeAttribute('disabled');
      }
    }
  }

  const root = closestParentElement(event.target, 'li');
  disableAllBtns('on');
  let dataToUpdate = {};
  const operationId = root.dataset.operationId;
  const spanDuration = root.querySelector('span[name=duration');
  dataToUpdate.timeSpent = currentDuration = 
    Number(spanDuration.dataset.currentDuration) + Number(event.target.dataset.duration);
  dataToUpdate.description = root.querySelector('span[name=description]').innerText;
  dataToUpdate = JSON.stringify(dataToUpdate);
  apiUpdateOperation(operationId, dataToUpdate).then(json =>{
    const parentSpan = spanDuration.parentElement;
    parentSpan.replaceChild(renderTimeDuration(json.data.timeSpent), spanDuration);
    disableAllBtns('off');
  })

}

function deleteOperation(event){
  event.stopPropagation();
  const root = closestParentElement(this, 'li');
  apiDeleteOperation(root.dataset.operationId)
  .then(resp => {
    if (resp.ok){
      root.parentElement.removeChild(root);
    }
  })
}

function updateTask(event){
  event.stopPropagation();
  const data = {}
  const root = closestParentElement(this, 'section');
  const taskId = root.dataset.sectionId;
  data.title = root.querySelector('h5').innerText;
  data.description = root.querySelector('h6').innerText;
  data.status = 'closed';
  apiUpdateTask(taskId, JSON.stringify(data)).then(resp =>{
    const parent = root.parentElement;
    parent.replaceChild(renderTask(resp.data), root);
  })

}

function setUp(){
    document.querySelector('#btn-add-task').addEventListener("click", createTask);
}


async function mainFunction() {

    setUp();
    renderTasks(apiListTasks());

}
