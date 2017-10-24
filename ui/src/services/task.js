import request from 'superagent';


class TaskService {
  post(file, numCores, then) {
    request
      .post('http://localhost:8080/tasks')
      .field('numCores', numCores)
      .attach('file', file)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }

  fetch(uid, then) {
    request
      .get('http://localhost:8080/tasks/' + uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }

  cancel(uid, then) {
    request
      .delete('http://localhost:8080/tasks/' + uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }
}


export default TaskService;