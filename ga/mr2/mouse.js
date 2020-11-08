/*
    hover the mouse over a box and it pops up a display window
*/

function initMouse() {
    mouse = {
        clicking: false,
        clickingOld: false,
        rightClicking: false,
        rightClickingOld: false,
        position: new ScreenPosition(),
        positionOld: new ScreenPosition()
    }

    let asynchronous = {
        clicking: false,
        rightClicking: false,
        position: new ScreenPosition()
    };
    function updateFromClientCoordinates(clientX, clientY) {
        asynchronous.position.x = (clientX / window.innerWidth) * 2. - 1.
        asynchronous.position.y =-(clientY / window.innerHeight) * 2. + 1.
        
        asynchronous.position.x *= mainCamera.rightAtZZero
        asynchronous.position.y *= mainCamera.topAtZZero
    }

    mouse.inBounds = (l,r,t,b) => {
        return  l <= mouse.position.x && mouse.position.x <= r &&
                b <= mouse.position.y && mouse.position.y <= t
    }

    let allMouseResponses = [mouseResponses,rightMouseResponses] //z, start, during, end
    let currentResponses = [null,null]
    function respond(clicking,clickingOld,index) {
        if (clicking && !clickingOld) {
            let topZ = -Infinity
            currentResponses[index] = null
            allMouseResponses[index].forEach((mf) => {
                let z = mf.z()
                if (z > topZ) {
                    topZ = z
                    currentResponses[index] = mf
                }
            })

            if (currentResponses[index] !== null && currentResponses[index].start !== undefined) {
                currentResponses[index].start()
                if (currentResponses[index].during === undefined && currentResponses[index].end === undefined)
                    currentResponses[index] = null
            }
        }

        if (clicking && currentResponses[index] !== null && currentResponses[index].during !== undefined)
            currentResponses[index].during()
        if (!clicking) {
            if (currentResponses[index] !== null && currentResponses[index].end !== undefined)
                currentResponses[index].end()
            currentResponses[index] = null
        }
    }

    mouse.updateFromAsyncAndCheckClicks = () => {
        mouse.positionOld.copy(mouse.position)
        mouse.position.copy(asynchronous.position)

        mouse.clickingOld = mouse.clicking
        mouse.clicking = asynchronous.clicking
        respond(mouse.clicking,mouse.clickingOld,0)

        mouse.rightClickingOld = mouse.rightClicking
        mouse.rightClicking = asynchronous.rightClicking
        respond(mouse.rightClicking, mouse.rightClickingOld, 1)
    }

    {
        document.addEventListener('mousemove', function (event) {
            event.preventDefault()
            updateFromClientCoordinates(event.clientX, event.clientY)
        }, false);

        document.addEventListener('mousedown', function (event) {
            event.preventDefault()
            asynchronous[event.button === 2 ? "rightClicking" : "clicking"] = true
            updateFromClientCoordinates(event.clientX, event.clientY)
        }, false);
        document.addEventListener('mouseup', function (event) {
            event.preventDefault()
            asynchronous[event.button === 2 ? "rightClicking" : "clicking"] = false
            updateFromClientCoordinates(event.clientX, event.clientY)
        }, false);
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault()
        })
    }
}