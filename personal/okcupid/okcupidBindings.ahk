;open profile
CapsLock & a::
	Send,{Home}
	MouseMove, 1190,1080 ;here you put the mouse position of the top-left result Input okcupid.com/match. Use the autohotkey "window spy" to get
	Click

	Send,{Down}{Down}{Down}{Down}{Down}{Down}{Down}
	Sleep,2200 ;such a long fucking time but the page must load
	Send,^f
	Send,More
	Send,+{Enter}
	Sleep,20
	Send,{Esc}
	Sleep,20
	Send,{Enter}

	SetCapsLockState, Off
Return

;swipe left
CapsLock & d::
	Send,{Home}
	MouseMove, 2250,650
	Sleep,40
	Click
	
	Send,^l
	SendInput,okcupid.com/match
	Send,{Enter}

	SetCapsLockState, Off
Return

;swipe right
CapsLock & f::
	Send,{Home}
	Sleep,30
	MouseMove, 2650,650
	Sleep,30
	Click

	InputBox, greeting,
	if ( ErrorLevel = 0 && greeting) ;write something AND press ok or enter
	{
		Sleep,30
		SendRaw,%greeting%

		;click send
		MouseMove, 3480,2110
		Sleep,60
		Click
		Sleep,60
		Click
		Sleep,60
		Click
	}
	
	Sleep,500

	Send,^l
	SendInput,okcupid.com/match
	Send,{Enter}

	SetCapsLockState, Off
Return