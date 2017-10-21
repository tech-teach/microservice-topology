import request from 'superagent';


class ResultService {

  setUid(uid) {
    this.uid = uid;
  }

  get(then) {
    request
      .get('/tasks/' + this.uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }

  getCancel(then) {
    request
      .delete('/tasks/' + this.uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }
}


export default ResultService;