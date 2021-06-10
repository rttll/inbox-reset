'use strict';

function request(url, data) {
  let options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  return fetch(url, options)
    .then((resp) => resp.json())
    .then((json) => {
      return json;
    })
    .catch((err) => {
      return err;
    });
}

function authenticate() {
  request('/authenticate').then((json) => {
    window.location = json.url;
  });
}

function messages() {
  return request('/messages').then((json) => {
    return json;
  });
}

function archive() {
  return request('/archive').then((resp) => {
    return resp;
  });
}

let loading = window.localStorage.getItem('gmail-reset-loading') !== null;
function app() {
  let defaults = {
    loading: loading,
    showIntro: !loading,
    showFetch: false,
    showResults: false,
    count: -1,
    done: false,
  };
  return {
    ...defaults,
    init() {
      if (this.loading) {
        this.fetch();
      }
      let params = new URLSearchParams(window.location.search);
      let code = params.get('code');
      if (code) {
        history.replaceState({ reset: 'index' }, '', 'index.html');

        this.showIntro = false;
        this.showFetch = true;
      }
    },
    authorize() {
      authenticate();
    },
    fetch() {
      this.loading = true;
      window.localStorage.setItem('gmail-reset-loading', 'anythingfooooo');
      messages().then(({ count }) => {
        window.localStorage.removeItem('gmail-reset-loading');
        this.count = count;
        this.showFetch = false;
        this.loading = false;
        this.showResults = true;
      });
    },
    archive() {
      archive().then((resp) => {
        debugger;
      });
    },
    reset() {
      for (let k in defaults) {
        this[k] = defaults[k];
      }
    },
  };
}
