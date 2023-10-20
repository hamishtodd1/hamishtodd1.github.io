// import { XRControllerModelFactory } from 'https://threejs.org/examples/jsm/webxr/XRControllerModelFactory.js';
// import { XRHandModelFactory } from 'https://threejs.org/examples/jsm/webxr/XRHandModelFactory.js';

// navigator.xr.isSessionSupported('immersive-vr').then((gotVr) => {
//     if (gotVr) {
//         const controllerModelFactory = new XRControllerModelFactory();
//         const handModelFactory = new XRHandModelFactory();

//         // Hand 1
//         let controllerGrip1 = renderer.xr.getControllerGrip(0);
//         controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
//         scene.add(controllerGrip1);

//         let hand1 = renderer.xr.getHand(0);
//         hand1.add(handModelFactory.createHandModel(hand1));

//         scene.add(hand1);

//         // Hand 2
//         let controllerGrip2 = renderer.xr.getControllerGrip(1);
//         controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
//         scene.add(controllerGrip2);

//         let hand2 = renderer.xr.getHand(1);
//         hand2.add(handModelFactory.createHandModel(hand2));
//         scene.add(hand2);
//     }
// })

init()