This involves some setting up, maybe half an hour depending. So, might not be worth it for you. I am finding that it feels nicer though, a more fluid experience - basically just not moving the mouse around. If you have a programming background this'll be easier, but if you follow instructions closely it should be ok.
1. For this you need autohotkey: https://www.autohotkey.com/
2. Open notepad. Without adding anything to the file at all, do file>save as and save the file with the name "bindings.ahk" in the folder %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
3. Go to %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup in File Explorer. Double click the file. You should now have autohotkey running! But it doesn't do anything :) because your file was blank! We need to put some our custom bindings in there. We have a little job to do first though...
4. Right click the autohotkey icon ("H" in a green box) that should be on your windows taskbar, and click "window spy". In the window spy, there is a box under "Mouse Position:" and in it it says "Absolute: [some number], [some other number]".
5. Go to okcupid.com/match (the window spy window should stay on top). Hover your mouse over the top-left profile (don't click it, not yet). Look at the window spy - on a piece of paper, write down the two numbers shown next to "Absolute:". We're going to call these numbers aX and aY
6. Click on someone's profile. Do NOT scroll down the page. Hover over "Pass". Write down those two numbers - we're going to call them bX and bY. Hover over "Like". Write down the numbers next to "Absolute:" again - those are cX and cY. You can close window spy now
7. With bindings.ahk open in notepad, paste everything that's in here into it: http://hamishtodd1.github.io/personal/okcupid/okcupidBindings.ahk
8. The script contains a place where there is aX and aY, bX and bY, cX and cY. Put in your values of those numbers. The line should say something like "MouseMove, 1190,1070" - note the comma. Don't get cX and bX mixed up or you'll be sending messages to people you wanted to dislike ;)
9. Save the file you have made. Right click the autohotkey icon and click "Reload this script". You're now set up!
Here's how it works:
1. On okcupid.com/match, HOLD capslock and press a. This will take you to looking at the expanded body of the top profile (useful if you have arranged people by match percentage!).
2. Read their profile, decide what you want to do...
    If you want to pass, hold capslock and press d.
    If you like them, still holding capslock, press f. You can enter a message
    ether you want to pass, like and then move on, or like and leave a message
Note that if you mess up and pass on a profile that you actually liked, you can just press the back button in your browser (alt+left arrow!) and change what you did.
