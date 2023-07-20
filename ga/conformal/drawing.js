/*

 */

function handleDrawing() {}

function initDrawing () {

    //there's an argument to be made: when you move the mouse around,
    //you should be seeing an infinitely long line stabbing the plane

    let drawingMode = -1
    let selectedCell = null //you're going to be making this a global at some point

    let mousePlanePositionOnStart = new Ega()

    startDrawing = (newSelectedCell,vizType)=>{
        selectedCell = newSelectedCell
        drawingMode = vizType

        resetMouseWheelTransform()

        mousePlanePositionOnStart.copy(mousePlanePosition)
    }

    document.addEventListener(`pointerup`, (event) => {
        if (event.button === 0){
            handleDrawing()
            drawingMode = -1
        }
    })

    let drawnCga = new Cga()
    handleDrawing = () => {

        if(drawingMode === -1)
            return
        
        let newText = ``
        switch(drawingMode) {
            
            case NO_VIZ_TYPE:
                break
            
            case SPHERE:
                if(mousePlanePositionOnStart.equals(mousePlanePosition)) {
                    newText += `ep`
                }
                else {
                    let radius = mousePlanePositionOnStart.distanceTo(mousePlanePosition)
                    mousePlanePositionOnStart.pointToVec3(v1)
                    sphere0.fromCenterAndRadius(v1.x,v1.y,v1.z, radius)
                    sphere0.log(4)
                    newText += translateExpression(sphere0.toString(5))

                    // cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga1).dual()
                }
                break
            
            case ROTOR:
                cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga1).join(e012c, drawnCga)
                newText += translateExpression(drawnCga.toString(3))
                break
            
            case PP:
                if(mousePlanePositionOnStart.equals(mousePlanePosition))
                    drawnCga.fromEga(mousePlanePositionOnStart)
                else {
                    
                    cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga1)
                    cga0.fromEga(mousePlanePositionOnStart).flatPpToConformalPoint(cga2)
                    cga1.join(cga2, drawnCga)

                }
                newText += translateExpression(drawnCga.toString(3))
                break
            
            case CONFORMAL_POINT:
                cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(drawnCga)
                newText += translateExpression(drawnCga.toString(3))
                break
            
            case MESH:
                getMousePositionAndWheelDq(dq0)
                dq0.cast(ega0)
                drawnCga.fromEga(ega0)
                newText += translateExpression(`(` + drawnCga.toString(3) + `) > cow` )
                break
        }

        selectedCell.setText(newText)
    }

    // let drawingPp = new PpViz()
    // let drawingCp = new ConformalPointViz()
    // let drawingSphere = new SphereViz()
    // let laidCga = new Cga().copy(zeroCga)
    // handleDrawing = () => {

    //     if(drawingMode!== 1)
    //         drawingSphere.visible = false
    //     else {
    //         drawingSphere.visible = true
    //         if (laidCga.equals(zeroCga)) {
    //             //zero radius sphere
    //             // cga1.fromEga(mouseRay).meet(e3c, drawingPp.cga)
    //             // drawingSphere.sphere.upSphere()
    //             let intersectionPp = cga0.fromEga(mouseRay).meet(e3c, cga2)
    //             // log(mouseRay)
    //             intersectionPp.flatPpToConformalPoint(cga1)
    //             //.dual(cga0).cast(drawingSphere.sphere)
    //         }
    //         else {

    //         }

    //         // sphere
    //         //initially a zero-radius sphere, because no direction for a plane
    //         //move your hand/mouse outside deadzone and it's a sphere, mouse at its center
    //         //up to a certain point and it's a plane 
    //         //because it's unlikely that anyone would want a super huge sphere

    //         // sooo, zero radius sphere if you don't move, nice
    //     }

    //     // if(drawingMode !== 2)
    //     //     drawingCircle.visible = false
    //     // else {
    //     //     drawingCircle.visible = true

    //     //     // circle/conformal rotor
    //     //     // equivalent of making a point pair, except it's a ring
    //     //     // by default an ordinary 180 bivector
    //     //     // but, you could turn the mousewheel and change its angle to something else
    //     //     // ahhh but you want to make loxodromes too

    //     //     //up and down arrow to have some scaling too (loxodrome)

    //     //     //uhhhh should it
    //     //     //go out to the edge of the screen and it switches to being a rotation
    //     //     //START at the edge of the screen 
    //     // }


    //     if(drawingMode!== 3) 
    //         drawingPp.visible = false
    //     else {
    //         drawingPp.visible = true
    //         cga1.fromEga(mouseRay).meet(e3c, drawingPp.cga)
    //     }

    //     if(drawingMode !== 4) 
    //         drawingCp.visible = false
    //     else {
    //         drawingCp.visible = true
    //         cga0.fromEga(mouseRay).meet(e3c, cga2).flatPpToConformalPoint(drawingCp.cga)
    //     }

    //     // if(drawingMode !== 5) {
    //     // }
    //     // else {
    //     //     // Rotor?
    //     //     //rigid motion: click and drag and it makes a translation
    //     //     //can mousewheel to change it to a rotation, eg curve up the line
    //     //     //up and down arrow to have some scaling in your rotation/translation as well
    //     // }

    //     //and there are other drawing modes too, eg bezier, surface
    // }
}