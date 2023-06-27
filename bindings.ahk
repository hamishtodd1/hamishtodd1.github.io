#SingleInstance force

#UseHook, On
SetTitleMatchMode 2

DetectHiddenWindows, On

^m::
	Send,{n}
Return

^h::
	Send,{b}
Return

; here's the shader recompilation
; C:\hamish.todd_dev_ws\mdk\DEV\hamish.todd\Vulkan\data\shaders\glsl\variablerateshading>glslangvalidator -V scene.frag -o scene.frag.spv

; !s::
; 	WinActivate,ahk_exe Code.exe
; 	Send,^a
; 	Send,^c
; 	Sleep,20
; 	WinActivate,ahk_exe Godot_v3.3.2-stable_win64.exe
; 	MouseMove,135,957
; 	Click
; 	Send,^a
; 	Send,^v
; 	Send,^s
; 	WinActivate,ahk_exe Code.exe
; Return

; #Tab::

; ^3::
; 	SendInput ``
; Return

; #InstallKeybdHook
; F2::
; 	if WinActive("ouTube")
; 		Send,{Down}
; 	else
; 		Send,{Volume_Down}
; Return
; F3::
; 	if WinActive("ouTube")
; 		Send,{Up}
; 	else
; 		Send,{Volume_Up}
; Return

; for youtube de-recommending. WIP
; y & LButton::
; 	if WinActive("ouTube")
; 	{
; 		Send,Up
; 		Send,Tab
; 		Send,Tab
; 		Send,Tab
; 		Send,Tab
; 		Send,Tab
; 		; Send,Enter
; 	}
; 	else
; 		MsgBox,Hey
; Return

NumpadClear::Down
!NumpadClear::!Down
!NumpadUp::!Up
!NumpadDown::!Down
;to turn numlock off, shift+numlock
NumLock::\
+NumLock::|

;Chrome back and forward
XButton1::XButton2
XButton2::XButton1

!1:: 
	Send,!{F4}
Return

; ^q::
; 	IfWinExist, ahk_exe chrome.exe

	; IfWinExist, ahk_exe devenv.exe
	; {
	; 	WinActivate, ahk_exe devenv.exe
	; 	Send,^p
	; 	Return
	; }

	; IfWinExist, ahk_exe Unity.exe
	; {
	; 	WinActivate, ahk_exe Unity.exe
	; 	Send,^p
	; }

	; python
	; WinActivate, ahk_exe cmd.exe
	; Send,{Up}
	; Send,{Enter}
	; WinActivate,Code.exe

	; IfWinExist, ahk_exe UE4Editor.exe
	; {
	; 	WinActivate,ahk_exe UE4Editor.exe
	; 	WinWaitActive, ahk_exe UE4Editor.exe
	; 	Send,{Esc}
	; 	Sleep,500
	; 	Send,^+p
	; 	Sleep,2000
	; 	Send,^+q
	; }
; Return


; This is old ray tracing demo
; CancelAndRestart()
; {
; 	IfWinActive, ahk_exe Code.exe
; 		Send,^s
		
; 	WinGet, lastWindowInUse,,A

; 	WinClose, ahk_exe RTDiscovery.exe

; 	WinActivate, ahk_exe devenv.exe
; 	Sleep,100
; 	Send,+{F5} ; if it's currently running, stop it
; 	Send,^+{F5} ; if it's currently building, stop it
; 	Sleep,500 ; it needs to update from your vscode changes, and wait for shaders to be deleted
; 	Send,{F5}
; 	Sleep,600 ; make sure you see it
	
; 	WinActivate, ahk_id %lastWindowInUse%
; }
; ^q::
; 	CancelAndRestart()
; Return
; ^+q::
; 	FileRemoveDir, C:\hamish.todd_dev_ws\mdk\DEV\hamish.todd\MDK3\Demos\RTDiscovery\Demo\build\windows\Shaders, 1
; 	CancelAndRestart()
; Return

; if you want to close all browser tabs, that's ctrl 1. Unless you're in vscode it was a mistake
^+w::
	IfWinActive, ahk_exe Code.exe
		Send,^+w
Return



; Could be "compile current shader, then run"
; glslangValidator -S frag -e main -o skybox.frag.spv -V skybox.frag

; !e::
; 	Send,^+!c ; ctrl+shift+alt+c
	
; 	WinActivate, ahk_exe p4v.exe
; 	Sleep,150
	
; 	; Click, 1333 140 Left 3
; 	; Sleep,20
; 	; SendInput,{BackSpace}
; 	; Sleep,750
; 	; SendInput,C:\hamish.todd_dev_ws\ ; so we're at the top and going to the file highlights at the bottom
; 	; Sleep,750
; 	; SendInput,{Delete} ; so it doesn't autocomplete, or something
; 	; Send,{Enter}
; 	; Sleep,1500

; 	Click, 1333 140 Left 3
; 	; SendInput,{BackSpace}
; 	Send,^v ; paste it into that bar
	
; 	MouseMove, 314,845
; Return

AddToPlaybackRate(amt)
{
	Send,^l
	SendInput,javascript:document.querySelector('video').playbackRate
	SendInput,{+}
	SendInput,=%amt%
	Sleep,500
	Send,{Enter}
}
]::
	if WinActive("ouTube")
		AddToPlaybackRate(0.25)
	else if WinActive("imeo")
		AddToPlaybackRate(0.25)
	else
		Send,]
Return
[::
	if WinActive("ouTube")
		AddToPlaybackRate(-0.25)
	else if WinActive("imeo")
		AddToPlaybackRate(-0.25)
	else
		Send,[
Return


^q::
	WinGet, lastWindowInUse,,A

	if WinExist( "ahk_exe PVRShaderEditorGUI.exe" )
	{
		WinActivate, ahk_exe Code.exe,
		Send,^a
		Sleep,35
		Send,^c
		
		WinActivate, ahk_exe PVRShaderEditorGUI.exe
		MouseMove,113,537
		Sleep,35
		Click
		Send,^a
		Sleep,35
		Send,^v
	}

	; else if WinExist( "ahk_exe cmd.exe" )
	; {
	; 	; jai,
	; 	WinActivate, ahk_exe cmd.exe,
	; 	Send, ^C
	; 	SendInput,jai source\main.jai && bin\anim.exe
	; 	Send,{Enter}
	; 	WinActivate, ahk_exe Code.exe,
	; }

	else if WinExist( "ahk_exe chrome.exe" )
	{
		WinActivate, ahk_exe chrome.exe,
		Sleep,650 ;35 without server
		Send, ^{F5} ; but wifi + security = fuck you
		Sleep,35
	}

	WinActivate, ahk_id %lastWindowInUse%
Return

^+q::
	WinGet, lastWindowInUse,,A

	Run, python C:\hamishtodd1.github.io\ga\ed\textbookPages\generatePresentations.py
	Sleep,1600

	WinActivate, ahk_exe chrome.exe,
	Sleep,35
	Send, ^{F5} ; but wifi + security = fuck you
	Sleep,35

	WinActivate, ahk_id %lastWindowInUse%
Return

PositionWindowIfExistent(name)
{
	if WinExist(name)
	{
		WinActivate, %name%, ;if it's minimized it has to be activated before being minimized
		WinMove, %name%,,	 	1009, -1, 918, 1088	
	}
}

PositionBothWindows()
{
	PositionWindowIfExistent("Latex Diagrams - Google Chrome")
	PositionWindowIfExistent("Blade - Google Chrome")
	; PositionWindowIfExistent("Lambda reduction - Google Chrome")
	PositionWindowIfExistent("ahk_exe PVRShaderEditorGUI.exe")
	; PositionWindowIfExistent("ahk_exe cmd.exe")
	PositionWindowIfExistent("Camera GA - Google Chrome")
	PositionWindowIfExistent("Conformal - Google Chrome")
	
	if WinExist("ahk_exe Code.exe")
	{
		WinActivate, ahk_exe Code.exe,
		WinMove, ahk_exe Code.exe,, -1, -1, 1020, 1080
	}
}

;might be nice to bring up both windows. Can check for a non-maximized version of chrome
!CapsLock::Return
+CapsLock::Return
; ^CapsLock::Return
; ^+CapsLock::Return ;use this to undo it
CapsLock::
	WinActivate, ahk_exe Code.exe
	PositionBothWindows()
Return

; Home::
; 	IfWinActive, ahk_exe chrome.exe
; 		Send,!{Right}
; 	else IfWinActive, ahk_exe explorer.exe
; 		Send,!{Right}
; 	else
; 		Send,{Right}
; Return
; End::
; 	IfWinActive, ahk_exe chrome.exe
; 		Send,!{Left}
; 	else IfWinActive, ahk_exe explorer.exe
; 		Send,!{Left}
; 	else
; 		Send,{Left}
; Return

^!t::
    run, cmd.exe, C:\
return

;For when you edit this!
^o::
	Reload
Return

^Esc::
	Process,Close,vrmonitor.exe
	Process,Close,OculusClient.exe
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

^SPACE::
	IfWinExist, Webcam - Google Chrome
		WinGet, ExStyle, ExStyle, Webcam - Google Chrome

		If (ExStyle & 0x8)
		{
			Winset, Alwaysontop, Off, Webcam - Google Chrome
			WinHide, Webcam - Google Chrome
			
			WinActivate, Kortijk presentation - Google Slides - Google Chrome
		}
		Else
		{
			WinShow, Webcam - Google Chrome
			WinActivate, Webcam - Google Chrome
			Winset, Alwaysontop, On, Webcam - Google Chrome
			
			WinActivate, Kortijk presentation - Google Slides - Google Chrome
		}
Return