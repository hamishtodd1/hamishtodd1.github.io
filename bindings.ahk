#SingleInstance force

NumpadClear::Down
!NumpadClear::!Down
!NumpadUp::!Up
!NumpadDown::!Down
;to turn numlock off, shift+numlock
NumLock::\
+NumLock::|

!1::!F4

;Chrome back and forward
XButton1::XButton2
XButton2::XButton1
; 	IfWinActive, Unrig - Google Chrome
; 	{
; 		Return
; 	}
; 	Send,{XButton1}
; Return

^q::
	; ^+q vscode start debugging

	; may want ctrl refresh
	ControlClick, x210 y136, ahk_exe chrome.exe
	WinActivate, ahk_exe Code.exe

	Send,^+{'} ;clear debug console

	Send,^' ;focus debug. ' is the generic thing for this kind of vscode navigation
	Sleep,50
	Send,^' ;and back to editor
Return
; ^s::
; 	IfWinActive, ahk_exe Code.exe
; 	{
; 		Send,^!' ;put terminal in view
; 		Send,^'  ;and back to editor
; 	}
; 	; IfWinActive, ahk_exe Chrome.exe
; 	; {
		
; 	; }
; Return

PositionBothWindows()
{
	if WinExist("ahk_exe chrome.exe")
	{
		WinGetPos, X, Y, Width, Height, ahk_exe chrome.exe
		if X < 1
			WinActivateBottom, ahk_exe chrome.exe,
		else
			WinActivate, ahk_exe chrome.exe, ;if it's minimized it has to be activated before being minimized
		WinMove, ahk_exe chrome.exe,,	 	2516, 0, 1153, 2180
	}
	
	if WinExist("ahk_exe Code.exe")
	{
		WinActivate, ahk_exe Code.exe,
		WinMove, ahk_exe Code.exe,, 0, 0, 2529, 2160
	}
}

#UseHook, On
AddToPlaybackRate(amt)
{
	Send,^l
	SendInput,javascript:document.querySelector('video').playbackRate
	SendInput,{+}
	SendInput,=%amt%
	Send,{Enter}
}
]::
	IfWinActive, ahk_exe Chrome.exe
		AddToPlaybackRate(0.25)
	else
		Send,]
Return
[::
	IfWinActive, ahk_exe Chrome.exe
		AddToPlaybackRate(-0.25)
	else
		Send,[
Return

;might be nice to bring up both windows. Can check for a non-maximized version of chrome
!CapsLock::Return
+CapsLock::Return
; ^CapsLock::Return
; ^+CapsLock::Return ;use this to undo it
CapsLock::
	PositionBothWindows()
Return

;I mean ideally capslock creates a new one if it's not there
^+n::
	WinActivateBottom, ahk_exe chrome.exe,
	Send,^n
	WinWait, ahk_exe chrome.exe,
	WinRestore, ahk_exe chrome.exe,
	Send,^l
	Sleep,50
	SendInput,file:///C:/hamishtodd1.github.io/ga/mr2/index.html
	Send,{Enter}
	Sleep,50
	PositionBothWindows()
Return


Right::
	IfWinActive, ahk_exe Chrome.exe
		Send,!{Right}
	else IfWinActive, ahk_exe explorer.exe
		Send,!{Right}
	else
		Send,{Right}
Return
Left::
	IfWinActive, ahk_exe Chrome.exe
		Send,!{Left}
	else IfWinActive, ahk_exe explorer.exe
		Send,!{Left}
	else
		Send,{Left}
Return

^!t::
    run, cmd.exe, C:\rustPractice
return

;For when you edit this!
^o::
	Send, ^+s
	Reload
Return

; Joy7::
; 	; Send,{F3} //this was for intelligent qube probably
; 	MsgBox, you just pressed select
; Return
; Joy9::
; 	Send,!{Tab}
; Return




;not sure what this is
; ^+k::
; ;RCtrl::
; 	Send, {ALT DOWN}{TAB}{ALT UP}
; 	Sleep,100
; 	Send, ^{f5}
; 	Sleep,50
; 	Send, {ALT DOWN}{TAB}{ALT UP}
; Return





; ^+e::
	;save image
	; Mouseclick, right
	; Send {Down 2}{Enter}
	; Sleep,550
	; Send {Enter}

	;save video
	; Mouseclick, right
	; Send {Down 4}{Enter} 
	; Sleep,550
	; Send {Enter}
; Return







;--------------Okcupid

;open profile
; CapsLock & a::
; 	Send,{Home}
; 	MouseMove, 1190,1080 ;here you put the mouse position of the top-left result Input okcupid.com/match. Use the autohotkey "window spy" to get
; 	Click

; 	Send,{Down}{Down}{Down}{Down}{Down}{Down}{Down}
; 	Sleep,2200 ;such a long fucking time but the page must load
; 	Send,^f
; 	Send,More
; 	Send,+{Enter}
; 	Sleep,20
; 	Send,{Esc}
; 	Sleep,20
; 	Send,{Enter}

; 	SetCapsLockState, Off
; Return

; ;swipe left
; CapsLock & d::
; 	Send,{Home}
; 	MouseMove, 2250,650
; 	Sleep,40
; 	Click
	
; 	Send,^l
; 	SendInput,okcupid.com/match
; 	Send,{Enter}

; 	SetCapsLockState, Off
; Return

; ;swipe right
; CapsLock & f::
; 	Send,{Home}
; 	Sleep,30
; 	MouseMove, 2650,650
; 	Sleep,30
; 	Click

; 	InputBox, greeting,
; 	if ( ErrorLevel = 0 && greeting) ;write something AND press ok or enter
; 	{
; 		Sleep,30
; 		SendRaw,%greeting%

; 		;click send
; 		MouseMove, 3480,2110
; 		Sleep,60
; 		Click
; 		Sleep,60
; 		Click
; 		Sleep,60
; 		Click
; 	}
	
; 	Sleep,500

; 	Send,^l
; 	SendInput,okcupid.com/match
; 	Send,{Enter}

; 	SetCapsLockState, Off
; Return