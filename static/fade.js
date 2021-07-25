const OPACITY_POINTS = {
    '#welcome': 0,
    '#info': 200,
    '#warning': 400,
    '#final': 600,
};
let opacityPoint = 0;

const updateOpacities = () => {
    for (const [elId, target] of Object.entries(OPACITY_POINTS)) {
        const el = document.querySelector(elId);
        const opacity = (100 - Math.abs(target - opacityPoint)) / 100;
        el.style.opacity = '' + opacity;
    }
};
const setOpacity = val => {
    opacityPoint = Math.min(600, Math.max(0, val));
    updateOpacities();
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
    document.addEventListener(
        "touchstart",
        e => {
            let t = e.changedTouches[0];
            startY = t.clientY;
            opacityStart = opacityPoint;
            console.log(`capture opacityStart to ${opacityPoint}`)
        },
        false
    );
    document.addEventListener(
        "touchmove",
        e => {
            setOpacity(opacityStart + Math.floor((startY - e.changedTouches[0].clientY) / 4))
        },
        false
    );
    // document.addEventListener(
    //     "touchend",
    //     e => startY = null,
    //     false);
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