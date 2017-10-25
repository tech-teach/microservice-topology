import request from 'superagent';


class TaskService {
  post(file, numCores, then) {
    request
      .post('/tasks')
      .field('numCores', numCores)
      .attach('file', file)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
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