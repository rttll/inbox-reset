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
function messages() {
  let params = new URLSearchParams(window.location.search);
  let code = params.get('code');
  if (code) {
    window.location.replace('/');
  }
  request(url).then((json) => {
    if (!json.data) return authenticate();

    // request('/message?id=' + json.data.messages[0].id).then((json) => {
    //   debugger;
    // });

    results = results.concat(json.data.messages);
    if (json.data.nextPageToken) {
      url = '/messages?pageToken=' + json.data.nextPageToken;
      messages();
    } else {
      debugger;
    }
  });
}

(function () {
  messages();
})();
