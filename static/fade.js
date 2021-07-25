const OPACITY_POINTS = {
    '#welcome': 0,
    '#info': 200,
    '#warning': 400,
    '#final': 600,
};
let opacityPoint = 0;

const setOpacity = val => {
    opacityPoint = Math.min(600, Math.max(0, val));
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
    document.addEventListener(
        "touchstart",
        e => {
            startY = e.changedTouches[0].clientY;
            opacityStart = opacityPoint;
            moveEvents = [];
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
            const recentMoves = moveEvents.filter(mvE => e.timeStamp - mvE.timeStamp < 200);
            if (recentMoves.length > 0) {
                const yDelta = moveEvents[0].changedTouches[0].clientY - e.changedTouches[0].clientY;
                let velocity = Math.floor(yDelta / (e.timeStamp - recentMoves[0].timeStamp));
                const inertiaScroll = v => {
                    if (Math.abs(v) > .1) {
                        const newV = v > 0 ? v - .1 : v + .1;
                        setTimeout(inertiaScroll.bind(null, newV), 20)
                    }
                    setOpacity(opacityPoint + v);
                }
                inertiaScroll(velocity);
            }
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
        )
    })
}


window.onload = function () {
    addDomScrollHandler();
    addMousewheelHandler();
    addTouchHandlers();
    addSubmitHandler();
};