function initXrRendering() {
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
}

function initXrHands() {
    let controller1 = renderer.xr.getController(0);
    scene.add(controller1);

    let controller2 = renderer.xr.getController(1);
    scene.add(controller2);

    // const controllerModelFactory = new XRControllerModelFactory();
    // const handModelFactory = new XRHandModelFactory().setPath( "models/" );

    box = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .1))

    // Hand 1
    let controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .1)));
    scene.add(controllerGrip1);

    let hand1 = renderer.xr.getHand(0);
    hand1.addEventListener('pinchstart', () => {
        controller1.scale.setScalar(1.1)
    });
    hand1.addEventListener('pinchend', () => {
        controller1.scale.setScalar(1.)
    });
    hand1.add(box);
    scene.add(hand1);

    

    // Hand 2
    let controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .1)));
    scene.add(controllerGrip2);

    let hand2 = renderer.xr.getHand(1);
    hand2.add(new THREE.Mesh(new THREE.BoxGeometry(.3)));
    scene.add(hand2)
}