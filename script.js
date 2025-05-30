class ToDo {
  constructor(title, description, dueDate, priority, notes) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.completed = false;
    this.createdAt = new Date();
    this.id = crypto.randomUUID();
  }
}
class ToDoList {
  constructor() {
    this.projects = [{ name: "default", list: [] }];
  }
}
