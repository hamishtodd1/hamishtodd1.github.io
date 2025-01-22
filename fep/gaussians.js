function initGaussians() {
    
    let tubeRadius = .01
    let tubularSegments = 200
    {
        let mean = 0.
        let constant0 = -1.
        let constant1 = -1.
        function computeGaussianConstants(newMean, newSd) {
            // debugger
            mean = newMean
            let sd = newSd
            constant0 = 1. / (sd * Math.sqrt(2. * Math.PI))
            constant1 = -1. / (2. * sd * sd)
        }
        class GaussianCurve extends THREE.Curve {

            constructor() {
                super();
            }

            getPoint(t, optionalTarget = new THREE.Vector3()) {

                let x = (t - .5) * 3.5
                let y = constant0 * Math.exp((x - mean) * (x - mean) * constant1)
                y *= .65 //hacked in but why not, it's linear
                // y = -Math.log(y)

                return optionalTarget.set(x, y, 0.)
            }
        }
        window.GaussianCurve = GaussianCurve
    }

    let meanSdVec = new THREE.Vector3()
    let zrc = new Mv31()
    let something = new Mv31()
    meanSdToPosPp = (mean, sd, mv) => {

        if(mean === Infinity || mean === -Infinity ) {
            if(sd !== 0.)
                console.error(`mean is infinite but sd is not zero`)
            return mv.copy(_e10)
        }
        else {
            zrc.vecToZrc(meanSdVec.set(mean,sd,0.))
            zrc.wedge(_e2, something).inner(_e12pm, mv) //so it's a rotation pp
            return mv.cheapNormalize(mv)
        }
    }

    let vecs = [new THREE.Vector3(), new THREE.Vector3()]
    let diracDeltaGeo0 = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 3.5, 4)
    diracDeltaGeo0.rotateZ(TAU / 4.)
    let diracDeltaGeo1 = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 100., 4)
    diracDeltaGeo1.translate(0.,50.,0.)
    class Gaussian extends THREE.Group {

        constructor(color) {

            super()

            galtonScene.add(this)

            const path = new GaussianCurve(10)

            this.buzzStart = -1.

            computeGaussianConstants(0., 1.)
            const geometry = new THREE.TubeGeometry(path, tubularSegments, tubeRadius, 4, false)
            const material = new THREE.MeshPhongMaterial({ color })

            this.ordinary = new THREE.Mesh(geometry, material)
            this.diracDelta = new THREE.Group()
            this.diracDelta.add(new THREE.Mesh(diracDeltaGeo1, material))
            this.diracDelta.add(new THREE.Mesh(diracDeltaGeo0, material))
            this.add(this.ordinary, this.diracDelta)

            obj3dsWithOnBeforeRenders.push(this)

            this.viz = new PtPairViz(false, color, this)
            meanSdToPosPp(Infinity, 0., this.viz.mv)
        }

        updateFromMv() {
            this.viz.mv.pointPairToVecs(vecs)
            let vec = vecs[0].y > vecs[1].y ? vecs[0] : vecs[1]
            this.setCurve(vec.x, vec.y)
        }

        setMeanSd(newMean, newSd) {
            meanSdToPosPp( newMean, newSd, this.viz.mv)
            this.updateFromMv()
        }

        setCurve(newMean, newSd) {
            if(newSd > .01 ) {
                this.ordinary.visible = true
                this.diracDelta.visible = false

                computeGaussianConstants(newMean, newSd)
                this.ordinary.geometry.regenerateAllSegments()
                this.ordinary.geometry.attributes.position.needsUpdate = true
                this.ordinary.geometry.attributes.normal.needsUpdate = true
            }
            else {
                this.ordinary.visible = false
                this.diracDelta.visible = true
                this.diracDelta.children[0].position.x = newMean
            }
        }

        onBeforeRender() {
            if (this.buzzStart !== -1.) {
                this.ordinary.material.color.getHSL(hsl)
                this.ordinary.material.color.setHSL

                let framesSinceStart = frameCount - this.buzzStart - 1
                let x = (.5+.5*Math.sin(framesSinceStart * .45)) / (1. + framesSinceStart * .1) //goes to 0
                let l = .5 + .5 * x
                this.ordinary.material.color.setHSL(hsl.h, hsl.s, l)

                this.viz.children[0].material.color.copy(this.ordinary.material.color)
                this.viz.children[1].material.color.copy(this.ordinary.material.color)
            }
        }
    }
    window.Gaussian = Gaussian

    let hsl = {h:0.,s:0.,l:0.}
}