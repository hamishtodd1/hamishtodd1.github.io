function initSound()
{
    sounds = {};
    let fileNames = [
        "bump",

        "pop1",
        "pop2",
        "pop3",

        "rotateTick",

        "press1",
        "unpress1",
        "press2",
        "unpress2",
    ];
    for (let i = 0; i < fileNames.length; i++)
        sounds[fileNames[i]] = new Audio("data/sounds/" + fileNames[i] + ".mp3");

    playRandomPop = function()
    {
        let index = 1 + Math.floor(Math.random()*3)

        //wanna supress that warning
        let soundPromise = sounds["pop" + index].play()
        soundPromise.then(function(){}).catch(function(){})
    }
}