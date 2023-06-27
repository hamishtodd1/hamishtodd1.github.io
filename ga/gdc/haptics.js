function handleCollisions() {

    for (let i = 0; i < group.children.length; i++) {

        group.children[i].collided = false;

    }

    for (let g = 0; g < controllers.length; g++) {

        const controller = controllers[g];
        controller.colliding = false;

        const { grip, gamepad } = controller;
        const sphere = {
            radius: 0.03,
            center: grip.position
        };

        const supportHaptic = 'hapticActuators' in gamepad && gamepad.hapticActuators != null && gamepad.hapticActuators.length > 0;

        for (let i = 0; i < group.children.length; i++) {

            const child = group.children[i];
            box.setFromObject(child);
            if (box.intersectsSphere(sphere)) {

                child.material.emissive.b = 1;
                const intensity = child.userData.index / group.children.length;
                child.scale.setScalar(1 + Math.random() * 0.1 * intensity);

                if (supportHaptic) {

                    gamepad.hapticActuators[0].pulse(intensity, 100);

                }

                const musicInterval = musicScale[child.userData.index % musicScale.length] + 12 * Math.floor(child.userData.index / musicScale.length);
                oscillators[g].frequency.value = 110 * Math.pow(2, musicInterval / 12);
                controller.colliding = true;
                group.children[i].collided = true;

            }

        }



        if (controller.colliding) {

            if (!controller.playing) {

                controller.playing = true;
                oscillators[g].connect(audioCtx.destination);

            }

        } else {

            if (controller.playing) {

                controller.playing = false;
                oscillators[g].disconnect(audioCtx.destination);

            }

        }

    }

    for (let i = 0; i < group.children.length; i++) {

        const child = group.children[i];
        if (!child.collided) {

            // reset uncollided boxes
            child.material.emissive.b = 0;
            child.scale.setScalar(1);

        }

    }

}