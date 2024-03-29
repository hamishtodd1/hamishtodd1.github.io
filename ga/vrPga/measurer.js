function initMeasurer() {
    
        let measurer = new THREE.Group()
        measurer.visible = false
        scene.add(measurer)
        let lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 0., 0.),
            new THREE.Vector3(0., 1., 0.)])
        let notchGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 0., 0.),
            new THREE.Vector3(-0.02, 0., 0.)])

        const lineMat = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        })

        let line = new THREE.Line(lineGeo, lineMat)
        measurer.add(line)
        let totalNotches = 20
        for(let i = 0; i < totalNotches; i++) {
            let notch = new THREE.Line(notchGeo, lineMat)
            notch.position.y = i * notchSpacing
            measurer.add(notch)
        }
        measurer.position.y = 1.

        let startPoints = [e123, e023, e031]
        let endPoints = [new Fl(), new Fl(), new Fl()]

        let rotationPart = new Dq()
        let translationPart = new Dq()
        let displacerAxis = new Dq()
        let displacer = new Dq()
        setMeasurer = (dqViz) => {

            dqViz.dq.invariantDecomposition( rotationPart, translationPart )

            if(translationPart.approxEquals(oneDq)) {
                measurer.visible = false
                return
            }
            measurer.visible = true

            let arrowLine = dqViz.markupPos.momentumLineFromRotor(translationPart,dq0)
            let cameraArrowPlane = arrowLine.joinPt(camera.mvs.pos, fl0).normalize()
            cameraArrowPlane.meet(e0, displacerAxis)
            let measurerDisplacementFromArrow = .007
            oneDq.addScaled(displacerAxis, measurerDisplacementFromArrow, displacer)
            let startPoint = displacer.sandwichFl(dqViz.markupPos, fl1)

            for(let i = 0; i < 3; ++i)
                endPoints[i].copy(startPoints[i])
            endPoints[0].copy(startPoint).normalizePoint()
            e0.meet(dqViz.markupPos.joinPt(startPoint, dq1), endPoints[1]).normalize()
            e0.meet(arrowLine, endPoints[2]).normalize()

            dq0.align(startPoints, endPoints)
            dq0.toPosQuat(measurer.position, measurer.quaternion)

            let length = translationPart.translationDistance()
            line.scale.y = length
            for(let i = 0; i < totalNotches; ++i) {
                let notch = measurer.children[i+1]
                notch.visible = notch.position.y < length
            }
        }
    }