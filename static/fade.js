const OPACITY_POINTS = {
    '#welcome': 0,
    '#info': 200,
    '#warning': 400,
    '#final': 600,
};
let opacityPoint = -100;

const setOpacity = (val, isIntro = false) => {
    const minVal = isIntro ? -100 : 0;
    opacityPoint = Math.min(600, Math.max(val, minVal));
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
            let velocity = Math.floor(yDelta / (e.timeStamp - recentMoves[0].timeStamp));
            const inertiaScroll = v => {
                if (userIsScrolling) return;

                if (Math.abs(v) > .1) {
                    const newV = v > 0 ? v - .1 : v + .1;
                    setTimeout(inertiaScroll.bind(null, newV), 20)
                }

                setOpacity(opacityPoint + v * 4);
            }
            inertiaScroll(velocity);
        },
        false);
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
        );
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