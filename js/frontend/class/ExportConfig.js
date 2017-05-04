class ExportConfig {
    constructor({
                    format = 'mp4',
                    fps = 60
                }) {
        this.format = format;
        this.fps = fps;
    }

    static get default() {
        return new ExportConfig({});
    }

    static get supportedFormats() {
        return ['mp4', 'avi', 'flv']
    }
}