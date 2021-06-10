function request(url) {
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
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

let results = [];
let url = '/messages';
function batch(resolve) {
  request(url).then((json) => {
    if (!json.data) return authenticate();

    results = results.concat(json.data.messages);
    if (json.data.nextPageToken) {
      url = '/messages?pageToken=' + json.data.nextPageToken;
      batch(resolve);
    } else {
      resolve(results);
    }
  });
}

function messages() {
  return new Promise(function (resolve, reject) {
    batch(resolve);
  });
}

let loading = window.localStorage.getItem('gmail-reset-loading') !== null;
function app() {
  return {
    loading: loading,
    showIntro: !loading,
    showFetch: false,
    showResults: false,
    results: [],
    done: false,
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
      messages().then((results) => {
        window.localStorage.removeItem('gmail-reset-loading');
        this.results = results;
        this.showFetch = false;
        this.loading = false;
        this.showResults = true;
      });
    },
    close() {
      this.show = false;
    },
    isOpen() {
      return this.show === true;
    },
  };
}
