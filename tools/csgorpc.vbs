Set oShell = CreateObject ("Wscript.Shell") 
Dim strArgs
strArgs = "cmd /c %APPDATA%\csgorpc\csgorpc_win.exe"
oShell.Run strArgs, 0, false