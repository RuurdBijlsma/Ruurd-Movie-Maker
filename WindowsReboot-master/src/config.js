exports.config = {
    shortcut: 'Super+Space',
    commands: [
        {
            name: 'Restart',
            command: 'shutdown /r /t 0'
        },
        {
            name: 'Shutdown',
            command: 'shutdown /s /t 0'
        },
        {
            name: 'Sleep',
            command: 'RUNDLL32.EXE powrprof.dll,SetSuspendState 0,1,0'
        },
        {
            name: 'Sign out',
            command: 'shutdown -L'
        }
    ]
};