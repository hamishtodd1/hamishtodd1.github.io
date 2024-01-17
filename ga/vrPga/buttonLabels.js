function initButtonLabels() {

    let labelsOn2 = {
        "grab": null, "paint": null,                           //buttons you hold
        "delete": null, "change brush": null, "undo": null, //not available while holding
        "duplicate": null                                   //only if you've grabbed something
    }
    let labelsOn1 = {
        "grab": null, "versor": null,                          //buttons you hold
        "delete": null, "change versor": null, "record": null, //not available while holding
        "snap": null                                           //only if you've grabbed something
    }                                    
    //last two there are contingent on having just 
    let both = [labelsOn1, labelsOn2]
    let groups = [new THREE.Group(), new THREE.Group()]
    hand1.add( groups[0] )
    hand2.add( groups[1] )
    putButtonLabelsOnVrControllers = () => {
        hand1.add(groups[0])
        hand2.add(groups[1])
        groups[0].rotation.x = -TAU / 4.
        groups[1].rotation.x = -TAU / 4.

        groups[0].position.set(0., -0.0025, 0.0475)
        groups[1].position.set(0., -0.0025, 0.0475)
    }

    //delete, duplicate, snap, record, could all be for while-holding
    //leaving only undo
    
    both.forEach((labels, isHand1) => {
        let group = (isHand1 ? groups[0] : groups[1])
        Object.keys(labels).forEach((labelName, i) => {
            let label = text(labelName, false, "#000000")
            label.scale.multiplyScalar(.015)
            group.add(label)
            labels[labelName] = label
            label.position.z = .015
            label.position.y = -.02
        })
    })

    labelsOn2["paint"        ].position.set(0., 0.05, -.0175)
    labelsOn2["change brush" ].position.set(-.04, 0.02, .0125)
    labelsOn2["grab"         ].position.set(.025, -.0075, -.0225)
    labelsOn2["delete"       ].position.set(0.015, 0.0225, 0.0075)
    labelsOn2["undo"         ].position.set(.0025, -.01, .0025)
    labelsOn2["duplicate"    ].position.set(.0025, -.01, .0025)

    labelsOn1["versor"       ].position.set(-0., 0.05, -.0175)
    labelsOn1["change versor"].position.set(.04, 0.02, .0125)
    labelsOn1["grab"         ].position.set(-.025, -.0075, -.0225)
    labelsOn1["delete"       ].position.set(-0.015, 0.0225, 0.0075)
    labelsOn1["record"       ].position.set(-.0025, -.01, .0025)
    labelsOn1["snap"         ].position.set(-.0025, -.01, .0025)

    toggleButtonsVisibility = (isPaintingHand) => {
        if(isPaintingHand) {
            let exceptionVisibility = !labelsOn2["duplicate"].visible
            labelsOn2["duplicate"].visible = exceptionVisibility

            labelsOn2["paint"       ].visible = !exceptionVisibility
            labelsOn2["change brush"].visible = !exceptionVisibility

            labelsOn2["grab"        ].visible = !exceptionVisibility
            labelsOn2["delete"      ].visible = !exceptionVisibility
            labelsOn2["undo"        ].visible = !exceptionVisibility
        }
        else {
            let exceptionVisibility = !labelsOn1["snap"].visible
            labelsOn1["snap"].visible = exceptionVisibility

            labelsOn1["versor"       ].visible = !exceptionVisibility
            labelsOn1["change versor"].visible = !exceptionVisibility

            labelsOn1["grab"         ].visible = !exceptionVisibility
            labelsOn1["delete"       ].visible = !exceptionVisibility
            labelsOn1["record"       ].visible = !exceptionVisibility
        }
    }

    toggleButtonsVisibility(true)
    toggleButtonsVisibility(false)

    updateButtonLabelVisibilities = () => {
        
        {
            let exceptionVisibility2 = sclptableBeingModified !== null

            labelsOn2["duplicate"].visible = exceptionVisibility2

            labelsOn2["paint"       ].visible = !exceptionVisibility2
            labelsOn2["change brush"].visible = !exceptionVisibility2

            labelsOn2["grab"        ].visible = !exceptionVisibility2
            labelsOn2["delete"      ].visible = !exceptionVisibility2
            labelsOn2["undo"        ].visible = !exceptionVisibility2
        }
        
        {
            let exceptionVisibility1 = vizBeingModified !== null

            labelsOn1["snap"].visible = exceptionVisibility1

            labelsOn1["versor"       ].visible = !exceptionVisibility1
            labelsOn1["change versor"].visible = !exceptionVisibility1

            labelsOn1["grab"         ].visible = !exceptionVisibility1
            labelsOn1["delete"       ].visible = !exceptionVisibility1
            labelsOn1["record"       ].visible = !exceptionVisibility1
        }
    }
    
}