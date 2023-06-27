function initSound() {
    sounds = {};
    let fileNames = [
        "levelComplete"
    ];
    for (let i = 0; i < fileNames.length; i++)
        sounds[fileNames[i]] = new Audio(`https://hamishtodd1.github.io/ga/common/data/sounds/` + fileNames[i] + `.wav` )
    log(sounds)
}