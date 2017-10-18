import request from 'superagent';


class ResultService {

  setUid(uid) {
    this.uid = uid;
  }

  get(then) {
    console.log('http://localhost/tasks/' + this.uid);
    request
      .get('http://localhost/tasks/' + this.uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }

  getCancel(then) {
    console.log('http://localhost/tasks/cancel/' + this.uid);
    request
      .get('http://localhost/tasks/cancel/' + this.uid)
      .end((err, res) => {
        if (!err) then(res);
        else console.log(err);
      });
  }
}


export default ResultService;