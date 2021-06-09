(function () {
  fetch('/labels', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((resp) => resp.json())
    .then((json) => {
      debugger;
    })
    .catch(console.error);
})();
