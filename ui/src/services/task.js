import request from 'superagent';


class TaskService {
  constructor() {
    this.url = 'http://localhost/tasks';
  }


  post(then) {
    request
      .post(this.url)
      .set('Content-Type', 'multipart/form-data')
      .send(this.props.file)
      .end((err, res) => {
        if (!err) then(res);
        else console.error(err);
      });
  }
}


export default TaskService;