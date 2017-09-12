import request from 'superagent';


class TaskService {
  constructor() {
    this.url = 'http://localhost/tasks';
  }

  get(then) {
    request
      .get(this.url)
      .end((err, res) => {
        if (!err) then(res);
        else console.error(err);
      });
  }
}


export default TaskService;