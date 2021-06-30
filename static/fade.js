

window.onload = function() {

  const elIdToTarget = {
    '#welcome': 0,
    '#info': 200,
  }
  let ctr = 0;

  const doFade = (delta) => {
    ctr += delta;
    ctr = Math.max(0, ctr)
    ctr = Math.min(200, ctr)

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
  // Others
  document.addEventListener('mousewheel', function(e) {
    doFade(e.wheelDelta);
  }, false);

};