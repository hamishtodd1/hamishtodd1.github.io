/*
    hover the mouse over a box and it pops up a display window
*/

function initMouse() {
    mouse = {
        clicking: false,
        position: new ScreenPosition()
    }
    let currentMouseResponse = null

    let asynchronous = {
        clicking: false,
        position: new ScreenPosition()
    };
    function updateFromClientCoordinates(clientX, clientY) {
        asynchronous.position.x = (clientX / window.innerWidth) * 2. - 1.
        asynchronous.position.y =-(clientY / window.innerHeight) * 2. + 1.
        
        asynchronous.position.x *= mainCamera.rightAtZZero
        asynchronous.position.y *= mainCamera.topAtZZero
    }

    mouse.updateFromAsyncAndCheckClicks = () => {
        let oldClicking = mouse.clicking
        mouse.clicking = asynchronous.clicking
        mouse.position.copy(asynchronous.position)

        if (mouse.clicking && !oldClicking) {
            let topZ = -Infinity
            currentMouseResponse = null
            mouseResponses.forEach((mf) => {
                let z = mf.z()
                if (z > topZ) {
                    topZ = z
                    currentMouseResponse = mf
                }
            })

            if (currentMouseResponse !== null && currentMouseResponse.start !== undefined) {
                currentMouseResponse.start()
                if (currentMouseResponse.during === undefined && currentMouseResponse.end === undefined)
                    currentMouseResponse = null
            }
        }

        if (mouse.clicking && currentMouseResponse !== null && currentMouseResponse.during !== undefined)
            currentMouseResponse.during()
        if (!mouse.clicking) {
            if (currentMouseResponse !== null && currentMouseResponse.end !== undefined)
                currentMouseResponse.end()
            currentMouseResponse = null
        }
    }

    {
        document.addEventListener('mousemove', function (event) {
            event.preventDefault()
            updateFromClientCoordinates(event.clientX, event.clientY)
        }, false);

        document.addEventListener('mousedown', function (event) {
            event.preventDefault()
            asynchronous.clicking = true
            updateFromClientCoordinates(event.clientX, event.clientY)
        }, false);
        document.addEventListener('mouseup', function (event) {
            event.preventDefault()
            asynchronous.clicking = false
            updateFromClientCoordinates(event.clientX, event.clientY)
        }, false);

        document.addEventListener('contextmenu', (event) => event.preventDefault(), false);
    }
}