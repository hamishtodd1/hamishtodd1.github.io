function init(VRButton, OrbitControls, XRControllerModelFactory) {
    let container = document.createElement('div');
    document.body.appendChild(container);

    scene.background = new THREE.Color(0x808080);
    camera.position.set(0, 1.6, 3);
    
    let orbitControls = new OrbitControls(camera, container);
    orbitControls.target.set(0, 1.6, 0);
    orbitControls.update();

    const floorGeometry = new THREE.PlaneGeometry(4, 4);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 1.0,
        metalness: 0.0
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-2., 5.3, 2.);
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = - 2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = - 2;
    light.shadow.mapSize.set(4096, 4096);
    scene.add(light);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    // controllers

    function controllerConnected(evt) {

        controllers.push({
            gamepad: evt.data.gamepad,
            grip: evt.target
        });

    }

    function controllerDisconnected(evt) {

        const index = controllers.findIndex(o => o.controller === evt.target);
        if (index !== - 1) {

            controllers.splice(index, 1);

        }

    }

    let controller1 = renderer.xr.getController(0);
    scene.add(controller1);
    controller1.visible = true
    controller1.position.y = 1.6

    let controller2 = renderer.xr.getController(1);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    let controllerGrip1, controllerGrip2;
    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.addEventListener('connected', controllerConnected);
    controllerGrip1.addEventListener('disconnected', controllerDisconnected);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.addEventListener('connected', controllerConnected);
    controllerGrip2.addEventListener('disconnected', controllerDisconnected);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);
}