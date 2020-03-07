;open profile
CapsLock & a::
	Send,{Home}
	MouseMove, matchMousePositionX,matchMousePositionY ;here you put the mouse position of the top-left result on okcupid.com/match. Use the autohotkey "window spy" to get
	Click

	Send,{Down}{Down}{Down}{Down}{Down}{Down}{Down}
	Sleep,2200 ;such a long fucking time but the page must load
	Send,^f
	Send,More
	Send,{Esc}
	Send,{Enter}
	; MouseMove, 960,1300

	SetCapsLockState, Off
Return

;swipe left
CapsLock & d::
	Send,{Home}
	MouseMove, passMousePositionWhenScrolledToTopOfPageX,passMousePositionWhenScrolledToTopOfPageY ;scroll to the top of the page and hover your mouse over "pass". Put in the "absolute" mouse positions listed in the autohotkey window spy
	Sleep,40
	Click

	SetCapsLockState, Off
Return

;swipe right
CapsLock & f::
	Send,{Home}
	Sleep,30
	MouseMove, likeMousePositionWhenScrolledToTopOfPageX,likeMousePositionWhenScrolledToTopOfPageY ;the location of the "like" button, when at the top of the page, must be put here
	Sleep,20
	Click

	InputBox, greeting,
	if ErrorLevel = 1
		Sleep,20
		SendRaw,%greeting%

		;click send
		MouseMove, 3480,2110
		Sleep,20
		Click
		
		Sleep,500

	Send,^l
	SendRaw,okcupid.com/match
	Send,{Enter}

	SetCapsLockState, Off
Return