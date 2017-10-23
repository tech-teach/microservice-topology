import request from 'superagent';


class HtopService {
  constructor() {
    this.url = 'http://localhost:8080/htop';
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


export default HtopService;