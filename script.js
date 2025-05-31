export class ToDo {
  constructor(title, description, dueDate, priority, notes = "") {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.completed = false;
    this.createdAt = new Date();
    this.id = crypto.randomUUID();
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  updateDetails({ title, description, dueDate, priority, notes }) {
    if (title !== undefined) this.title = title;
    if (description !== undefined) this.description = description;
    if (dueDate !== undefined) this.dueDate = dueDate;
    if (priority !== undefined) this.priority = priority;
    if (notes !== undefined) this.notes = notes;
  }
}

export class ToDoList {
  constructor() {
    this.projects = [
      { name: "Default", list: [] },
      { name: "Work", list: [] },
      { name: "Personal", list: [] },
      { name: "Shopping", list: [] },
    ];
  }

  getProject(name) {
    return this.projects.find((p) => p.name === name);
  }

  addProject(name) {
    if (this.getProject(name)) return false;
    this.projects.push({ name, list: [] });
    return true;
  }

  addTodoToProject(projectName, todo) {
    const project = this.getProject(projectName);
    if (!project) throw new Error("Project not found");
    project.list.push(todo);
  }

  removeTodo(projectName, todoId) {
    const project = this.getProject(projectName);
    if (!project) return;
    project.list = project.list.filter((todo) => todo.id !== todoId);
  }

  listTodos(projectName) {
    const project = this.getProject(projectName);
    return project ? project.list : [];
  }

  listProjects() {
    return this.projects.map((project) => project.name);
  }
}
