import fetchify    from 'fetchify';
import jwt_decode  from 'jwt-decode';

var fetch = fetchify(Promise).fetch;

export default class Auth0ApiStrategy {

  constructor(domain) {
    this.domain = domain;
    this.user_token = null;
  }

  setUserToken(user_token) {
    this.user_token = user_token;

    var decoded = jwt_decode(user_token);
    this.user_id = decoded.sub;

    return this;
  }

  get() {

    if (!this.user_token) throw "Token not setted";

    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.user_token
    };

    return fetch('https://' + this.domain + '/api/v2/users/' + this.user_id, {
        method: 'GET',
        headers: headers,
      })
      .then(response => {
        if (response.status != 200) {
          throw "ERROR";
        }
        
        return response.json();
      })

  }

  patch(data) {

    if (!this.user_token) throw "Token not set";

    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.user_token
    };

    return fetch('https://' + this.domain + '/api/v2/users/' + this.user_id, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          user_metadata: data
        })
      })
      .then(response => {
        if (response.status != 200) {
          throw "ERROR";
        }
        
        return response.json();
      });
  }

}
