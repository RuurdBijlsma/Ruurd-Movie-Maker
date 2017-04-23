class VideoFragment {
    constructor(file) {
        this.eventListeners = {};
        this.file = file;

        this.element = document.createElement("video");
        this.element.src = file.path;
        this.element.load();

        this.widthPerSecond = 3;

        this.startTime = 0;
        this.endTime = 0;
        // this._playbackSpeed = 1;

        this.metadataLoaded = false;
        this.element.onloadedmetadata = () => {
            this.metadataLoaded = true;
            this.endTime = this.duration;

            this.executeEvent("loadedMetadata");
        };
        this.element.onloadeddata = () => this.updateThumbnail().then(url => {
            this.executeEvent("thumbnail");
            this.thumbnailElement.style.width = this.thumbnailWidth + "px";
            this.thumbnailElement.style.backgroundImage = `url('${this.thumbnail}')`;

            this.executeEvent("loadedData");
        });

        this.thumbnailElement = document.createElement("div");
        this.thumbnailElement.setAttribute("class", "thumbnail");
        this.thumbnailSeeker = document.createElement('div');
        this.thumbnailSeeker.setAttribute("class", "thumbnail-seeker");
        this.thumbnailElement.appendChild(this.thumbnailSeeker);
        let innerSeeker = document.createElement('div');
        innerSeeker.setAttribute("class", "thumbnail-inner-seeker");
        this.thumbnailSeeker.appendChild(innerSeeker);

        this._active = false;

        this.updateFps();
    }


    play(from) {
        if (from) {
            this.element.currentTime = from;
        }
        if (this.element.paused)
            this.element.play();
    }

    pause() {
        this.element.pause();
    }

    get currentTime() {
        return this.element.currentTime;
    }

    set currentTime(value) {
        this.element.currentTime = value;

        let percentage = value / this.duration * 100;
        this.thumbnailSeeker.style.left = `calc(${percentage}% - 2px)`;
    }

    set active(value) {
        this._active = value;
        if (value) {
            this.element.style.zIndex = 1;
            this.thumbnailElement.setAttribute("active", "");
        } else {
            this.element.style.zIndex = 0;
            this.thumbnailElement.removeAttribute("active");
        }
    }

    get active() {
        return this._active;
    }

    // get playbackSpeed() {
    //     return this._playbackSpeed;
    // }
    //
    // set playbackSpeed(value) {
    //     this._playbackSpeed = value;
    //     this.element.playbackRate = value;
    //     this.executeEvent("widthChange");
    // }

    addEventListener(name, action) {
        if (!this.eventListeners[name])
            this.eventListeners[name] = [];

        this.eventListeners[name].push(action);
    }

    executeEvent(name) {
        if (this.eventListeners.hasOwnProperty(name))
            for (let action of this.eventListeners[name])
                action();
    }

    get thumbnail() {
        if (this._thumbnail) {
            return this._thumbnail;
        }
        console.warn("Thumbnail hasn't loaded yet");
        return null;
    }

    get duration() {
        if (this.metadataLoaded) {
            return this.element.duration;
        }
        console.warn("Video metadata hasn't loaded yet");
        return 0;
    }

    get thumbnailWidth() {
        return Math.round(this.duration * this.widthPerSecond);
    }

    updateFps() {
        runFFMPEGCommand(['-i', this.file.path]).then(info => {
            let words = info.in.split('\n').find(line => line.includes(' fps')).split(' fps')[0].split(' ');
            this.fps = Number(words[words.length - 1]);
            this.executeEvent("loadedFps");
        });
    }

    updateThumbnail(height = 80, timestamp = 0) {
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');

            timestamp = this.element.duration * timestamp;
            this.element.currentTime = timestamp;

            this.element.oncanplaythrough = e => {
                context.width = height / this.element.videoHeight * this.element.videoWidth;
                context.height = height;
                canvas.setAttribute("width", context.width);
                canvas.setAttribute("height", context.height);

                context.drawImage(this.element, 0, 0, context.width, context.height);

                if (context.getImageData(10, 10, 1, 1).data[3] !== 0) {
                    this._thumbnail = canvas.toDataURL();
                    resolve(this._thumbnail);
                }
            };
        });
    }
}