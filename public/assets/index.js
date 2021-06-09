(function () {
  fetch('/authenticate', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((resp) => resp.json())
    .then((json) => {
      window.location = json.url;
    })
    .catch(console.error);
})();
