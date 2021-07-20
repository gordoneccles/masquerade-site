
const addFadeEffect = () => {
  const elIdToTarget = {
    '#welcome': 0,
    '#info': 200,
    '#warning': 400,
    '#final': 600,
  };
  let ctr = 0;

  const doFade = (delta) => {
    const normalizedDelta = delta / Math.abs(delta);
    ctr += (2 * normalizedDelta)
    ctr = Math.max(0, ctr)
    ctr = Math.min(600, ctr)

    for (const [elId, target] of Object.entries(elIdToTarget)) {
      const el = document.querySelector(elId);
      const opacity = (100 - Math.abs(target - ctr)) / 100
      el.style.opacity = '' + opacity;
    }
  }

  // Firefox
  document.addEventListener('DOMMouseScroll', function(e) {
    doFade(e.detail);
  }, false);

  // Chrome, Safari
  document.addEventListener('mousewheel', function(e) {
    doFade(-1 * e.wheelDelta);
  }, false);
};

const addSubmitHandler = () => {
  const acceptForm = document.getElementById('accept');
  acceptForm.addEventListener('submit', e => {
    e.preventDefault();
    fetch(
        '/accept',
        {
          body: new FormData(e.target),
          method: 'POST'
        }
    ).then(d =>
        d.json()
    ).then(res => {
      if (res['success']) {
        const thankYou = document.getElementById('thank-you');
        acceptForm.style.display = 'none';
        thankYou.style.display = 'block';
      }
    }).catch(err =>
        console.log(err)
    )
  })
}

window.onload = function() {
  addFadeEffect();
  addSubmitHandler();
};