/*
    All vizes could in theory have sculptables, and all sculptables obviously have vizes

 */

function initButtonLabels() {

    //on left hand
    let ps = {
        trigger: new THREE.Vector3(0., 0.05, -.0175),
        stick: new THREE.Vector3(-.04, 0.02, .0125),
        grip: new THREE.Vector3(-.025, -.0075, -.0225),
        y: new THREE.Vector3(0.015, 0.0225, 0.0075),
        x: new THREE.Vector3(.0025, -.01, .0025)
    }

    let labelProfiles = {}
    labelProfiles.neitherHolding = {
        "Paint": ps.trigger,
        "Grab": ps.grip,
        "Menu": ps.x,
        "Undo": ps.y,
    }

    labelProfiles.justHolding = {
        "Delete (push)": ps.trigger,
        "Snap": ps.x,
        "Start recording": ps.y,
    }
    labelProfiles.justHoldingOpposition = {
        "Paint": ps.trigger,
        "Clone": ps.x,
        "Change brush": ps.stick,
        "Chirality": ps.grip,
    }

    labelProfiles.justPainting = {
        "Paint": ps.trigger,
        "Change brush": ps.stick,
    }
    labelProfiles.justPaintingOpposition = {
        "Grab": ps.grip,
    }

    labelProfiles.blank = {
    }


    let leftGroups = {}
    let rightGroups = {}
    let groupses = [leftGroups,rightGroups]
    groupses.forEach((groups, isLeft) => { 
        
        for (let profileName in labelProfiles) {
            groups[profileName] = new THREE.Group()
            // scene.add(groups[profileName])
            if (isLeft)
                handLeft.add(groups[profileName])
            else
                handRight.add(groups[profileName])

            for (let labelName in labelProfiles[profileName]) {
                let label = text(labelName, false, "#000000")
                label.scale.multiplyScalar(.015)
                label.position.copy(labelProfiles[profileName][labelName])
                if (!isLeft)
                    label.position.x *= -1.

                groups[profileName].add(label)
            }
        }
    })

    setLabels = (painteeExists, grabbeeExists, paintHandIsRight, grabbHandIsRight) => {

        Object.keys(leftGroups).forEach(p => leftGroups[p].visible = false)
        Object.keys(rightGroups).forEach(p => rightGroups[p].visible = false)

        if (!painteeExists && !grabbeeExists) {
            leftGroups.neitherHolding.visible = true
            rightGroups.neitherHolding.visible = true
        }
        else if(painteeExists && grabbeeExists) {
            leftGroups.blank.visible = true
            rightGroups.blank.visible = true
        }
        else if(painteeExists) {
            paintHandIsRight ? leftGroups.justPainting.visible = true : rightGroups.justPainting.visible = true
            paintHandIsRight ? rightGroups.justPaintingOpposition.visible = true : leftGroups.justPaintingOpposition.visible = true
        }
        else if(grabbeeExists) {
            grabbHandIsRight ? leftGroups.justHolding.visible = true : rightGroups.justHolding.visible = true
            grabbHandIsRight ? rightGroups.justHoldingOpposition.visible = true : leftGroups.justHoldingOpposition.visible = true
        }
    }
    




    // let labelsOn2 = {
    //     "grab": null, "paint": null, "change brush": null, "undo": null,
    //     "delete": null, "record": null, "snap": null, "duplicate": null, "change versor": null //while grabbed
    // }
    // let labelsOn1 = {
    //     "grab": null, "versor": null, "change versor": null,
    //     "delete": null, "record": null, "snap": null, "duplicate": null
    // }
    //last two there are contingent on having just 
    // let groups = [new THREE.Group(), new THREE.Group()]
    // handRight.add( groups[0] )
    // handLeft.add( groups[1] )
    putButtonLabelsOnVrControllers = () => {
        // handRight.add(groups[0])
        // handLeft.add(groups[1])
        // groups[0].rotation.x = -TAU / 4.
        // groups[1].rotation.x = -TAU / 4.

        // groups[0].position.set(0., -0.0025, 0.0475)
        // groups[1].position.set(0., -0.0025, 0.0475)
    }

    //delete, duplicate, snap, record, could all be for while-holding
    //leaving only undo
    
    // let both = [labelsOn1, labelsOn2]
    // both.forEach((labels, isHand1) => {
    //     let group = (isHand1 ? groups[0] : groups[1])
    //     Object.keys(labels).forEach((labelName, i) => {
    //         let label = text(labelName, false, "#000000")
    //         label.scale.multiplyScalar(.015)
    //         group.add(label)
    //         labels[labelName] = label
    //     })
    // })

    // labelsOn2["paint"        ].position.set(0., 0.05, -.0175)
    // labelsOn2["change brush" ].position.set(-.04, 0.02, .0125)
    // labelsOn2["grab"         ].position.set(.025, -.0075, -.0225)
    // labelsOn2["delete"       ].position.set(0.015, 0.0225, 0.0075)
    // labelsOn2["undo"         ].position.set(.0025, -.01, .0025)
    // labelsOn2["duplicate"    ].position.set(.0025, -.01, .0025)
    

    // labelsOn1["versor"       ].position.set(-0., 0.05, -.0175)
    // labelsOn1["change versor"].position.set(.04, 0.02, .0125)
    // labelsOn1["grab"         ].position.set(-.025, -.0075, -.0225)
    // labelsOn1["delete"       ].position.set(-0.015, 0.0225, 0.0075)
    // labelsOn1["record"       ].position.set(-.0025, -.01, .0025)
    // labelsOn1["snap"         ].position.set(-.0025, -.01, .0025)

    toggleButtonsVisibility = (isPaintingHand) => {
        // if(isPaintingHand) {
        //     let exceptionVisibility = !labelsOn2["duplicate"].visible
        //     labelsOn2["duplicate"].visible = exceptionVisibility

        //     labelsOn2["paint"       ].visible = !exceptionVisibility
        //     labelsOn2["change brush"].visible = !exceptionVisibility

        //     labelsOn2["grab"        ].visible = !exceptionVisibility
        //     labelsOn2["delete"      ].visible = !exceptionVisibility
        //     labelsOn2["undo"        ].visible = !exceptionVisibility
        // }
        // else {
        //     let exceptionVisibility = !labelsOn1["snap"].visible
        //     labelsOn1["snap"].visible = exceptionVisibility

        //     labelsOn1["versor"       ].visible = !exceptionVisibility
        //     labelsOn1["change versor"].visible = !exceptionVisibility

        //     labelsOn1["grab"         ].visible = !exceptionVisibility
        //     labelsOn1["delete"       ].visible = !exceptionVisibility
        //     labelsOn1["record"       ].visible = !exceptionVisibility
        // }
    }

    // toggleButtonsVisibility(true)
    // toggleButtonsVisibility(false)
   
}