import { ToDo, ToDoList } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const projectsList = document.querySelector(".project-list");

  // Load todoList from localStorage or create new one
  const todoList = loadFromLocalStorage() || new ToDoList();

  // Save to localStorage whenever data changes
  function saveToLocalStorage() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem("todoList");
    if (saved) {
      const data = JSON.parse(saved);
      const todoList = new ToDoList();

      (data.projects || []).forEach((project) => {
        const projectName = project.name;
        const todoArray = project.list;

        todoArray.forEach((todoData) => {
          const todo = new ToDo(
            todoData.title,
            todoData.description,
            todoData.dueDate,
            todoData.priority,
            todoData.notes
          );
          todo.id = todoData.id;
          todo.completed = todoData.completed;
          todoList.addTodoToProject(projectName, todo);
        });
      });

      return todoList;
    }
    return null;
  }

  // Modals
  const detailsModal = document.getElementById("todoModal");
  const addTaskModal = document.getElementById("addTaskModal");
  const editTaskModal = document.getElementById("editTaskModal");

  // Close buttons
  detailsModal.querySelector(".close").onclick = () =>
    (detailsModal.style.display = "none");
  addTaskModal.querySelector(".close").onclick = () =>
    (addTaskModal.style.display = "none");
  editTaskModal.querySelector(".close").onclick = () =>
    (editTaskModal.style.display = "none");

  // Outside click
  window.onclick = function (event) {
    if (event.target === detailsModal) detailsModal.style.display = "none";
    if (event.target === addTaskModal) addTaskModal.style.display = "none";
    if (event.target === editTaskModal) editTaskModal.style.display = "none";
  };

  // Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      detailsModal.style.display = "none";
      addTaskModal.style.display = "none";
      editTaskModal.style.display = "none";
    }
  });

  let currentEditingTodo = null;
  let currentEditingProject = null;

  const editTaskForm = document.getElementById("editTaskForm");
  editTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(editTaskForm);

    // Only update editable fields
    currentEditingTodo.dueDate = formData.get("dueDate");
    currentEditingTodo.priority = formData.get("priority");

    saveToLocalStorage(); // Save changes
    displayTasks(currentEditingProject);

    editTaskModal.style.display = "none";
    editTaskForm.reset();
  });

  const addTaskForm = document.getElementById("addTaskForm");
  addTaskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(addTaskForm);
    const taskData = {
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      priority: formData.get("priority"),
      project: formData.get("project"),
      notes: formData.get("notes"),
    };

    todoList.addTodoToProject(
      taskData.project,
      new ToDo(
        taskData.title,
        taskData.description,
        taskData.dueDate,
        taskData.priority,
        taskData.notes
      )
    );

    saveToLocalStorage(); // Save changes
    displayTasks(taskData.project);
    addTaskModal.style.display = "none";
    addTaskForm.reset();
  });

  // Display projects
  todoList.listProjects().forEach((project) => {
    const li = document.createElement("li");
    li.textContent = project;
    li.onclick = () => displayTasks(project);
    projectsList.appendChild(li);
  });

  function populateProjectDropdown() {
    const projectSelect = document.getElementById("taskProject");
    projectSelect.innerHTML = "";
    todoList.listProjects().forEach((project) => {
      const option = document.createElement("option");
      option.value = project;
      option.textContent = project;
      projectSelect.appendChild(option);
    });
  }

  function displayTasks(projectName) {
    const todos = todoList.listTodos(projectName);
    const emptyState = document.querySelector(".empty-state");
    const list = document.querySelector(".list-todo");

    list.innerHTML = "";

    if (todos.length === 0) {
      emptyState.style.display = "flex";
      list.hidden = true;
    } else {
      emptyState.style.display = "none";
      list.hidden = false;
      todos.forEach((todo) => {
        const entry = document.createElement("li");
        const entryLeft = document.createElement("div");
        const entryRight = document.createElement("div");
        entryLeft.classList.add("left");
        entryRight.classList.add("right");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("todo-check");
        checkbox.checked = todo.completed;

        const titleSpan = document.createElement("span");
        titleSpan.textContent = todo.title;

        const detailButton = document.createElement("button");
        detailButton.classList.add("detail");
        detailButton.textContent = "DETAILS";
        detailButton.onclick = () => showTodoDetails(todo);

        const taskDate = document.createElement("div");
        taskDate.classList.add("task-date");
        taskDate.textContent = new Date(todo.dueDate).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        );

        const editButton = document.createElement("button");
        editButton.classList.add("edit-icon");
        editButton.innerHTML = "✏️";
        editButton.onclick = () => editTodo(todo);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-icon");
        deleteButton.innerHTML = "🗑️";
        deleteButton.onclick = () => {
          todoList.removeTodo(projectName, todo.id);
          saveToLocalStorage(); // Save changes
          displayTasks(projectName);
        };

        checkbox.onchange = () => {
          todo.toggleComplete();
          saveToLocalStorage(); // Save changes
          entry.classList.toggle("completed", todo.completed);
        };

        entryLeft.appendChild(checkbox);
        entryLeft.appendChild(titleSpan);
        entryRight.appendChild(detailButton);
        entryRight.appendChild(taskDate);
        entryRight.appendChild(editButton);
        entryRight.appendChild(deleteButton);
        entry.appendChild(entryLeft);
        entry.appendChild(entryRight);
        entry.classList.add("todo-entry");
        if (todo.completed) entry.classList.add("completed");
        entry.classList.add(todo.priority);

        list.appendChild(entry);
      });
    }
  }

  function showTodoDetails(todo) {
    const modal = document.getElementById("todoModal");
    document.getElementById("modalTitle").textContent = todo.title;
    document.getElementById("modalDescription").textContent = todo.description;
    document.getElementById("modalDueDate").textContent = todo.dueDate;
    document.getElementById("modalPriority").textContent = todo.priority;
    document.getElementById("modalStatus").textContent = todo.completed
      ? "Completed"
      : "Pending";
    document.getElementById("modalNotes").textContent = todo.notes;
    modal.style.display = "block";
  }

  function editTodo(todo) {
    currentEditingTodo = todo;

    // Identify the project this todo belongs to
    const projects = todoList.listProjects();
    for (const project of projects) {
      const todos = todoList.listTodos(project);
      if (todos.includes(todo)) {
        currentEditingProject = project;
        break;
      }
    }

    // Populate the edit form with read-only fields and editable ones
    document.getElementById("editTaskTitleText").textContent = todo.title;
    document.getElementById("editTaskDescriptionText").textContent =
      todo.description;
    document.getElementById("editTaskProjectText").textContent =
      currentEditingProject;
    document.getElementById("editTaskNotesText").textContent = todo.notes;
    document.getElementById("editTaskDueDate").value = todo.dueDate;
    document.getElementById("editTaskPriority").value = todo.priority;

    editTaskModal.style.display = "block";
  }

  function closeAddTaskModal() {
    const modal = document.getElementById("addTaskModal");
    modal.style.display = "none";
    document.getElementById("addTaskForm").reset();
  }
  function closeEditTaskModal() {
    const modal = document.getElementById("editTaskModal");
    modal.style.display = "none";
    document.getElementById("editTaskForm").reset();
  }
  window.openAddTaskModal = () => {
    populateProjectDropdown();
    addTaskModal.style.display = "block";
  };
  window.closeAddTaskModal = closeAddTaskModal;
  window.closeEditTaskModal = closeEditTaskModal;
});
