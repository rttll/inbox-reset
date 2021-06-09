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

function messages() {
  let params = new URLSearchParams(window.location.search);
  let code = params.get('code');
  if (code) {
    window.location.replace('/');
  }
  request('/messages').then((json) => {
    if (!json.data.messages) return authenticate();
    debugger;
  });
}

(function () {
  messages();
})();
