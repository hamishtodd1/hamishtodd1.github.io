function initMouse() {
    
    let clickedRect = null
    let rightClickedRect = null

    function getRels(event, dw) {
        let [x, y] = getDwXy(dw)
        return [
            (event.clientX                      - (x+dwDimension/2.)) / dwDimension,
            (window.innerHeight - event.clientY - (y+dwDimension/2.)) / dwDimension
        ]
    }

    const overlayScene = new THREE.Scene()
    const overlayCamera = new THREE.OrthographicCamera(-1., 1., 1., -1., .1, 10.)
    overlayCamera.position.z = 3.

    let overlayButtons = []
    createButton = (dw) => {
        let overlayConversion = 2. / (spacing * 5 + dwDimension * 4)
        let overlaySpaceSpacing = spacing * overlayConversion
        let overlaySpaceDwDimension = dwDimension * overlayConversion

        let btn = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), new THREE.MeshBasicMaterial({ color: 0x00FF00 }))
        btn.scale.set(.05, .05, 1.)
        overlayScene.add(btn)
        btn.position.x = -1. + overlaySpaceSpacing + overlaySpaceDwDimension * .5 + dw.horizontalIndex * (overlaySpaceDwDimension + overlaySpaceSpacing)
        btn.position.y = overlayCamera.top - dw.verticalIndex * (overlaySpaceSpacing + overlaySpaceDwDimension) - overlaySpaceSpacing - overlaySpaceDwDimension - overlaySpaceSpacing * .5

        overlayButtons.push(btn)

        return btn
    }

    document.addEventListener('mousedown', function (event) {
        dwColumns.forEach((dwColumn) => {
            dwColumn.forEach((dw) => {
                let [x,y] = getRels(event, dw)
                let inRect = -.5 < x && x < .5 &&
                             -.5 < y && y < .5
                if(inRect) {
                    if(event.button === 0) {
                        clickedRect = dw
                        clickedRect.onClick(x, y)
                    }
                    else if (event.button === 2) {
                        rightClickedRect = dw
                        rightClickedRect.onRightClick(x, y)
                    }
                }
            })
        })
        let clientXOverlay = -1. + event.clientX/window.innerWidth * 2.
        let clientYOverlay = overlayCamera.bottom + (window.innerHeight-event.clientY)/window.innerHeight * (overlayCamera.top-overlayCamera.bottom)
        overlayScene.children.forEach((btn)=>{
            let inRect = 
                btn.position.x - btn.scale.x / 2. < clientXOverlay && clientXOverlay < btn.position.x + btn.scale.x / 2. &&
                btn.position.y - btn.scale.y / 2. < clientYOverlay && clientYOverlay < btn.position.y + btn.scale.y / 2.
            if(inRect)
                btn.onClick()
        })
        event.preventDefault()
    }, false)

    document.addEventListener('mouseup', function (event) {
        if (clickedRect !== null) {
            let [relX, relY] = getRels(event, clickedRect)
            clickedRect.onLetGo(relX, relY)
        }

        if(event.button === 0)
            clickedRect = null
        else if(event.button === 2)
            rightClickedRect = null
        event.preventDefault()
    }, false)
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault()
    }, false)

    document.addEventListener('mousemove', function (event) {
        if(clickedRect !== null) {
            let [relX, relY] = getRels(event, clickedRect)
            clickedRect.onDrag(relX, relY)
        }
        if (rightClickedRect !== null) {
            let [relX, relY] = getRels(event, rightClickedRect)
            rightClickedRect.onRightDrag(relX, relY)
        }
    }, false)

    

    // let asynchronous = {
    //     clicking: false,
    //     rightClicking: false,

    //     raycaster: new THREE.Raycaster(), //top right is 1,1, bottom left is -1,-1
    // };
    // asynchronous.raycaster.setFromCamera(new THREE.Vector2(), camera)

    // onClicks = []
    // mouse = {
    //     clicking: false,
    //     oldClicking: false,
    //     oldRightClicking: false,

    //     //don't use too much if clicking is not true - touchscreens. There are other ways to do things, and many people will be on phone
    //     raycaster: new THREE.Raycaster(),
    //     oldRaycaster: new THREE.Raycaster(),
    // };
    // mouse.raycaster.ray.copy(asynchronous.raycaster.ray)
    // mouse.oldRaycaster.ray.copy(mouse.raycaster.ray)

    // mouse.rotateObjectByGesture = function (object) {
    //     let rotationAmount = mouse.raycaster.ray.direction.angleTo(mouse.oldRaycaster.ray.direction) * 1.8
    //     // console.log(mouse.raycaster.ray.direction,mouse.oldRaycaster.ray.direction)
    //     if (rotationAmount === 0.)
    //         return

    //     let rotationAxis = mouse.raycaster.ray.direction.clone().cross(mouse.oldRaycaster.ray.direction);
    //     rotationAxis.applyQuaternion(object.quaternion.clone().inverse()).normalize();
    //     object.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount))
    // }

    // mouse.getZZeroPosition = (target) => {
    //     if (target === undefined)
    //         console.error("target needed")
    //     return mouse.raycaster.intersectZPlane(0., target)
    // }

    // mouse.get2dDiff = (target) => {
    //     mouse.raycaster.intersectZPlane(0., v0)
    //     mouse.oldRaycaster.intersectZPlane(0., v1)
    //     target.x = v1.x - v0.x
    //     target.y = v1.y - v0.y

    //     return target
    // }

    // mouse.justMoved = () => !mouse.raycaster.ray.equals(mouse.oldRaycaster.ray)

    // let currentClick = null

    // mouse.updateFromAsyncAndCheckClicks = function () {
    //     this.oldClicking = this.clicking;
    //     this.clicking = asynchronous.clicking
    //     this.oldRightClicking = this.rightClicking
    //     this.rightClicking = asynchronous.rightClicking

    //     mouse.oldRaycaster.ray.copy(mouse.raycaster.ray);
    //     mouse.raycaster.ray.copy(asynchronous.raycaster.ray);
    //     // log(mouse.raycaster.ray.origin)
    //     // log(mouse.raycaster.ray.direction)

    //     if (this.clicking && !this.oldClicking) {
    //         let topZ = -Infinity
    //         currentClick = null
    //         onClicks.forEach((onClick) => {
    //             let z = onClick.z()
    //             if (z > topZ) {
    //                 topZ = z
    //                 currentClick = onClick
    //             }
    //         })

    //         if (currentClick !== null && currentClick.start !== undefined) {
    //             currentClick.start()
    //             if (currentClick.during === undefined && currentClick.end === undefined)
    //                 currentClick = null
    //         }
    //     }

    //     if (this.clicking && currentClick !== null && currentClick.during !== undefined)
    //         currentClick.during()
    //     if (!this.clicking) {
    //         if (currentClick !== null && currentClick.end !== undefined)
    //             currentClick.end()
    //         currentClick = null
    //     }
    // }

    // mouse.areaIn = function () {
    //     let mouseX = mouse.getZZeroPosition(v1).x
    //     if (outputColumn.right() < mouseX)
    //         return "pad"
    //     else if (outputColumn.left() < mouseX && mouseX < outputColumn.right())
    //         return "column"
    //     else
    //         return "left"
    // }

    // mouse.displayWindowMouseIsOn = () => {
    //     let oneItsOn = null
    //     displayWindows.forEach((dw) => {
    //         if (mouse.checkIfOnScaledUnitSquare(dw))
    //             oneItsOn = dw
    //     })
    //     return oneItsOn
    // }

    // mouse.checkIfOnScaledUnitSquare = function (scaledSquare) {
    //     mouse.getZZeroPosition(v1)
    //     scaledSquare.worldToLocal(v1)
    //     return -.5 < v1.x && v1.x < .5 &&
    //         -.5 < v1.y && v1.y < .5
    // }

    // {
    //     let currentRawX = 0;
    //     let currentRawY = 0;

    //     document.addEventListener('mousemove', function (event) {
    //         event.preventDefault();
    //         //for some bizarre reason this can be called more than once with the same values
    //         if (event.clientX !== currentRawX || event.clientY !== currentRawY) {
    //             asynchronous.raycaster.updateFromClientCoordinates(event.clientX, event.clientY)

    //             currentRawX = event.clientX;
    //             currentRawY = event.clientY;
    //         }
    //     }, false);

        
        // document.addEventListener('mouseup', function (event) {
        //     if (event.which === 1) asynchronous.clicking = false
        //     if (event.which === 3) asynchronous.rightClicking = false
        // }, false)

    //     document.addEventListener('contextmenu', (event) => event.preventDefault(), false);
    // }

    // //todo buggy with multiple touches
    // {
    //     document.addEventListener('touchstart', function (event) {
    //         event.preventDefault();

    //         asynchronous.clicking = true;

    //         asynchronous.raycaster.updateFromClientCoordinates(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
    //     }, { passive: false });
    //     document.addEventListener('touchmove', function (event) {
    //         event.preventDefault();

    //         //apparently this can come even if touch has ended
    //         asynchronous.raycaster.updateFromClientCoordinates(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
    //     }, { passive: false });
    //     document.addEventListener('touchend', function (event) {
    //         event.preventDefault();

    //         asynchronous.clicking = false;
    //     }, false);
    // }

    return [overlayScene,overlayCamera]
}