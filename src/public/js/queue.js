export class Queue {
  constructor() {
    this.tasks = [];
    this.running = false;
  }

  add(task) {
    this.tasks.push(task);

    if (!this.running) {
      this.running = true;
      this.runNext();
    }
  }

  runNext() {
    if (this.tasks.length > 0) {
      const task = this.tasks.shift();

      task(() => {
        this.runNext();
      });
    } else {
      this.running = false;
    }
  }
}
