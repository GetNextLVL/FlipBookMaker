[Setup]
AppName=Flipbook Generator
AppVersion=1.0
DefaultDirName={pf}\Flipbook Generator
DefaultGroupName=Flipbook Generator
OutputBaseFilename=FlipbookSetup
Compression=lzma
SolidCompression=yes
DisableDirPage=no

[Files]
Source: "FlipbookGenerator.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "templates\*"; DestDir: "{app}\templates"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "static\*"; DestDir: "{app}\static"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "attached_assets\*"; DestDir: "{app}\attached_assets"; Flags: ignoreversion recursesubdirs createallsubdirs

; הוספת אייקון לתוכנה (אם קיים)
; לדוגמה: Source: "flipbook_icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Flipbook Generator"; Filename: "{app}\FlipbookGenerator.exe"
Name: "{userdesktop}\Flipbook Generator"; Filename: "{app}\FlipbookGenerator.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"
