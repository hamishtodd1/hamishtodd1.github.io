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

    putButtonLabelsOnVrControllers = () => {
        
        groupses.forEach((groups, isLeft) => {

            for (let profileName in labelProfiles) {
                let g = groups[profileName]

                if (isLeft)
                    handLeft.add(g)
                else
                    handRight.add(g)

                g.rotation.x = -TAU / 4.
                g.position.set(0., -0.0025, 0.0475)
            }
        })
    }
}