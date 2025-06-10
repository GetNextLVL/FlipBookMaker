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
Source: "run_app.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "main.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "launcher.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "flipbook_generator.spec"; DestDir: "{app}"; Flags: ignoreversion
Source: "requirements.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "app.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "routes.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "utils.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "pyproject.toml"; DestDir: "{app}"; Flags: ignoreversion
Source: "uv.lock"; DestDir: "{app}"; Flags: ignoreversion

Source: "templates\*"; DestDir: "{app}\templates"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "static\*"; DestDir: "{app}\static"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "output\*"; DestDir: "{app}\output"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Flipbook Generator"; Filename: "{app}\run_app.bat"
Name: "{userdesktop}\Flipbook Generator"; Filename: "{app}\run_app.bat"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"
