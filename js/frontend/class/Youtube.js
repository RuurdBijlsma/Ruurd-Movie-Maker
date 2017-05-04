const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const {BrowserWindow} = require("electron").remote;
const ResumableUpload = require('node-youtube-resumable-upload');

class Youtube {
    static upload({
                      path, title, description, publicity = 'public', onProgress = () => {
        }, tokens
                  }) {
        return new Promise(resolve => {
            const fileSize = node.fileSize(path);
            const metadata = {
                snippet: {
                    title: title,
                    description: description
                },
                status: {privacyStatus: publicity}
            };
            const resumableUpload = new ResumableUpload(); //create new ResumableUpload
            resumableUpload.tokens = tokens; //Google OAuth2 tokens
            resumableUpload.filepath = path;
            // resumableUpload.monitor = true;
            resumableUpload.metadata = metadata; //include the snippet and status for the video
            resumableUpload.retry = 3; // Maximum retries when upload failed.

            console.log('starting upload');
            resumableUpload.upload();
            resumableUpload.on('progress', p => {
                console.log('2');
                onProgress(p / fileSize);
            });
            resumableUpload.on('success', s => {
                console.log('1');
                resolve(JSON.parse(s));
            });
            resumableUpload.on('error', e => {
                console.log('3');
                console.log(e);
            });
        });
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
                            resolve(client.credentials);
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
                let win = new BrowserWindow({
                    width: 885,
                    height: 668,
                    frame: false,
                    show: false,
                    parent: remote.getCurrentWindow(),
                    modal: true,
                });
                win.once('ready-to-show', () => win.show());
                win.setMenu(null);
                win.on('closed', () => {
                    win = null;
                });

                win.webContents.on('did-finish-load', () => {
                    let title = win.webContents.getTitle();
                    if (title.includes('Success')) {
                        let code = title.split('code=')[1];
                        win.close();
                        localStorage.authCode = code;
                        resolve(code);
                    }
                });

                win.loadURL(url);
                // win.show();
            });
        });
    }

    static async getAuthUrl() {
        return new Promise(resolve => {
            Youtube.getAuthClient().then(client => {
                const url = client.generateAuthUrl({
                    // 'online' (default) or 'offline' (gets refresh_token)
                    access_type: 'offline',

                    // If you only need one scope you can pass it as a string
                    scope: 'https://www.googleapis.com/auth/youtube.upload'

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