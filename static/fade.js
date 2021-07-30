const OPACITY_POINTS = {
    '#welcome': 0,
    '#fae': 200,
    '#warning': 400,
    '#party-info': 600,
    '#accept': 800,
};
let opacityPoint = -100;

const setOpacity = (val, isIntro = false) => {
    const minVal = isIntro ? -100 : 0;
    opacityPoint = Math.min(800, Math.max(val, minVal));
    for (const [elId, target] of Object.entries(OPACITY_POINTS)) {
        const el = document.querySelector(elId);
        const opacity = (100 - Math.abs(target - opacityPoint)) / 100;
        el.style.opacity = '' + opacity;
    }
};

const addDomScrollHandler = () => {
    // Firefox
    document.addEventListener('DOMMouseScroll', function (e) {
        const delta = e.detail;
        const normalizedDelta = delta / Math.abs(delta);
        setOpacity(opacityPoint + 2 * normalizedDelta);
    }, false);
};

const addMousewheelHandler = () => {
    // Chrome, Safari
    document.addEventListener('mousewheel', function (e) {
        const delta = -1 * e.wheelDelta;
        const normalizedDelta = delta / Math.abs(delta);
        setOpacity(opacityPoint + 2 * normalizedDelta);
    }, false);
};

const addTouchHandlers = () => {
    let opacityStart;
    let startY;
    let moveEvents;
    let userIsScrolling = false;

    document.addEventListener(
        "touchstart",
        e => {
            startY = e.changedTouches[0].clientY;
            opacityStart = opacityPoint;
            moveEvents = [];
            userIsScrolling = true;
        },
        false
    );
    document.addEventListener(
        "touchmove",
        e => {
            setOpacity(opacityStart + Math.floor((startY - e.changedTouches[0].clientY) / 4));
            moveEvents.push(e);
            if (moveEvents.length > 1000) {
                moveEvents = moveEvents.slice(Math.floor(moveEvents.length / 2))
            }
        },
        false
    );
    document.addEventListener(
        "touchend",
        e => {
            userIsScrolling = false;
            const recentMoves = moveEvents.filter(mvE => e.timeStamp - mvE.timeStamp < 200);
            if (recentMoves.length === 0) return;

            const yDelta = moveEvents[0].changedTouches[0].clientY - e.changedTouches[0].clientY;
            let velocity = Math.floor(yDelta / (e.timeStamp - recentMoves[0].timeStamp)) * 4;
            const inertiaScroll = v => {
                if (userIsScrolling) return;

                if (Math.abs(v) > .1) {
                    const newV = v > 0 ? v - .1 : v + .1;
                    setTimeout(inertiaScroll.bind(null, newV), 20)
                }

                setOpacity(opacityPoint + v);
            }
            inertiaScroll(velocity);
        },
        false);
};


const fadeBetween = (fromEl, toEl) => {

  const fadeIn = () => {
    const fadeInToken = setInterval(() => {
      const opacity = Number(toEl.style.opacity || 0);
      if (opacity >= 1) {
        clearInterval(fadeInToken);
      } else {
        toEl.style.display = 'block';
        toEl.style.opacity = '' + (opacity + 0.05);
      }
    },
    15
    )
  }

  const fadeOutToken = setInterval(() => {
    const opacity = Number(fromEl.style.opacity || 1);
    if (opacity <= 0) {
      fromEl.style.display = 'none';
      clearInterval(fadeOutToken);
      fadeIn();
    } else {
      fromEl.style.opacity = '' + (opacity - .05);
    }
  },
  15
  )

}

const validateInputs = (nameEl, emailEl) => {
  let valid = true;

  if ([null, undefined, ''].includes(nameEl.value)) {
    nameEl.classList.add('invalid');
    valid = false;
  } else {
    nameEl.classList.remove('invalid');
  }


  if ([null, undefined, ''].includes(emailEl.value)) {
    emailEl.classList.add('invalid');
    valid = false;
  } else if (!emailEl.value.match(/.+@.+/)) {
    emailEl.classList.add('invalid');
    valid = false;
  } else {
    emailEl.classList.remove('invalid');
  }

  return valid;
}

const addSubmitHandler = () => {
    let buttonIsClickable = true
    const acceptInvite = e => {
        const nameInput = document.querySelector('#name-input');
        const emailInput = document.querySelector('#email-input');

        const isValid = validateInputs(nameInput, emailInput);
        if (!isValid) return;

        buttonIsClickable = false;
        fetch(
            '/accept',
            {
                body: JSON.stringify({ name: nameInput.value, email: emailInput.value }),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            },
        ).then(d =>
            d.json()
        ).then(res => {
            if (res['success']) {
                const acceptContainer = document.getElementById('accept-container');
                const thankYou = document.getElementById('thank-you');
                fadeBetween(acceptContainer, thankYou);
            }
        }).catch(err => {
            buttonIsClickable = true;
            console.log(err);
        });
    };

    document.getElementById('chickens').addEventListener('click', e => {
        if (buttonIsClickable) {
            acceptInvite();
        }
    });
};

const fadeInWelcome = () => {
    const token = setInterval(() => {
        if (opacityPoint >= 0) {
            clearInterval(token)
        } else {
            setOpacity(opacityPoint + 2, true);
        }
    }, 50);
};


document.addEventListener('DOMContentLoaded', function () {
    addDomScrollHandler();
    addMousewheelHandler();
    addTouchHandlers();
    addSubmitHandler();
    fadeInWelcome();
}, false);

