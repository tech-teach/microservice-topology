import request from 'superagent';


class TaskService {
  constructor() {
    this.url = '/tasks';
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

  fetch(uid, then) {
    request
      .get('/tasks/' + uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }

  cancel(uid, then) {
    request
      .delete('/tasks/' + uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }
}


export default TaskService;