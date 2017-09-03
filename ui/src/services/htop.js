import request from 'superagent';


class HtopService {
  constructor() {
    this.url = 'http://localhost/htop';
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