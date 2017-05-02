const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const {BrowserWindow} = require("electron").remote;
const ResumableUpload = require('node-youtube-resumable-upload');

class Youtube {
    static upload({path, title, description, status = 'public'}) {
        Youtube.getAccessToken().then(() => {
            Youtube.getAuthClient().then(client => {
                console.log(client);

                const metadata = {
                    snippet: {
                        title: title,
                        description: description
                    },
                    status: {privacyStatus: status}
                };
                const resumableUpload = new ResumableUpload(); //create new ResumableUpload
                resumableUpload.tokens = tokens; //Google OAuth2 tokens
                resumableUpload.filepath = path;
                resumableUpload.metadata = metadata; //include the snippet and status for the video
                resumableUpload.retry = 3; // Maximum retries when upload failed.
                resumableUpload.upload();
                resumeableUpload.on('progress', progress => {
                    console.log('[PROGRESS]', progress);
                });
                resumableUpload.on('success', success => {
                    console.log('[PROGRESS]', success);
                });
                resumableUpload.on('error', error => {
                    console.log('[PROGRESS]', error);
                });
            });
        }).catch(err => console.debug('Could not get tokens:', err));
    }
///todo: refresh tokens functionlity maken als dit weer werkt
    static getAccessToken() {
        return new Promise((resolve, error) => {
            Youtube.getAuthCode().then(code => {
                Youtube.getAuthClient().then(client => {
                    client.getToken(code, (err, tokens) => {
                        // Now tokens contains an access_token and an optional refresh_token. Save them.
                        if (!err) {
                            client.setCredentials(tokens);
                            localStorage.authClient = JSON.stringify(client);
                            resolve(tokens);
                        } else {
                            error(err);
                        }
                    });
                });
            });
        });
    }

    static getAuthCode() {
        return new Promise(resolve => {
            Youtube.getAuthUrl().then(url => {
                let win = new BrowserWindow({width: 885, height: 668})
                win.on('closed', () => {
                    win = null;
                });

                win.webContents.on('did-finish-load', e => {
                    let title = win.webContents.getTitle();
                    if (title.includes('Success')) {
                        let code = title.split('code=')[1];
                        win.close();
                        localStorage.authCode = code;
                        resolve('loaded', code);
                    }
                });

                win.loadURL(url);
            });
        });
    }

    static getAuthUrl() {
        return new Promise(resolve => {
            Youtube.getAuthClient().then(client => {
                const url = client.generateAuthUrl({
                    // 'online' (default) or 'offline' (gets refresh_token)
                    access_type: 'offline',

                    // If you only need one scope you can pass it as a string
                    scope: 'https://www.googleapis.com/auth/youtube.upload',

                    // Optional property that passes state parameters to redirect URI
                    // state: { foo: 'bar' }
                });

                resolve(url);
            })
        });
    }

    static getAuthClient() {
        return new Promise(resolve => {
            if (Youtube._oAuth2Client) {
                resolve(Youtube._oAuth2Client);
            } else {
                Youtube.readTextFile("./../../Resources/secret.json").then(txt => {
                    let {client_id, client_secret, redirect_uris} = JSON.parse(txt).installed;

                    Youtube._oAuth2Client = new OAuth2(
                        client_id,
                        client_secret,
                        redirect_uris[0]
                    );
                    resolve(Youtube._oAuth2Client);
                });
            }
        });
    }

    static readTextFile(file) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", file, true);
            xhr.onload = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        console.error(xhr.statusText);
                    }
                }
            };
            xhr.onerror = () => {
                console.error(xhr.statusText);
            };
            xhr.send(null);
        });
    }
}