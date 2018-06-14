class VideoFragment {
    constructor(path, widthPerSecond = 3) {
        this.eventListeners = {};
        this.path = path;

        this.element = document.createElement("video");
        this.element.src = path;
        this.element.load();
        // this._playbackSpeed = 1;

        this.thumbnailElement = document.createElement("div");
        this.thumbnailElement.setAttribute("class", "thumbnail");
        this.thumbnailSeeker = document.createElement('div');
        this.thumbnailSeeker.setAttribute("class", "thumbnail-seeker");
        this.thumbnailElement.appendChild(this.thumbnailSeeker);
        let innerSeeker = document.createElement('div');
        innerSeeker.setAttribute("class", "thumbnail-inner-seeker");
        this.thumbnailSeeker.appendChild(innerSeeker);

        this.metadataLoaded = false;
        this.element.onloadedmetadata = () => {
            this.metadataLoaded = true;

            this.executeEvent("loadedMetadata");
        };
        this.element.onloadeddata = () => {
            this.executeEvent("loadedData");
            this.widthPerSecond = widthPerSecond;
            this.updateThumbnail(this.startPoint);
        };

        this.active = false;
        this.startPoint = 0;
        this.endPoint = 1;
        this.playbackSpeed = 1;

        this.updateFps();
    }

    get thumbnailWidth() {
        return Math.round(this.duration * this.widthPerSecond);
    }

    updateThumbnailWidth() {
        this.thumbnailElement.style.width = this.thumbnailWidth + "px";
        this.executeEvent("timeChange");
    }

    get volume() {
        return this.element.volume;
    }

    set volume(value) {
        if (value < 0 || value > 1)
            console.warn("Value must be within range [0-1]");
        this.element.volume = value;
        this.executeEvent("timeChange");
    }

    get playbackSpeed() {
        return this._playbackSpeed;
    }

    set playbackSpeed(value) {
        this._playbackSpeed = value;
        this.element.playbackRate = value;
        this.updateThumbnailWidth();
    }

    get startPoint() {
        return this._startTime;
    }

    set startPoint(value) {
        if (value < 0) {
            console.warn("startPoint can't be lower than 0");
            return;
        }

        this._startTime = value;
        this.updateThumbnailWidth();
    }

    get endPoint() {
        return this._endTime;
    }

    set endPoint(value) {
        if (value > 1) {
            console.warn("endPoint can't be higher than the video duration");
            return;
        }

        this._endTime = value;

        if (this.currentTime > this.duration)
            this.currentTime = this.duration;

        this.updateThumbnailWidth();
    }

    get widthPerSecond() {
        return this._widthPerSecond;
    }

    set widthPerSecond(value) {
        this._widthPerSecond = value;
        this.updateThumbnailWidth();
    }

    play(from) {
        if (from !== undefined) {
            this.currentTime = from;
        }
        if (this.element.paused)
            this.element.play();
    }

    pause() {
        this.element.pause();
    }

    get currentTime() {
        let point = this.durationWithoutEndTime * (this.startPoint * this.element.duration - this.element.currentTime);
        point /= (this.startPoint - 1) * this.element.duration;

        // console.log('getting currentTime:', point, "based on:", {
        //     elementDuration: this.element.duration,
        //     elementTime: this.element.currentTime,
        //     fragmentStartTime: this.startPoint,
        //     fragmentDurationWithoutStartTime: this.durationWithoutEndTime,
        // });

        return point;
    }

    set currentTime(value) {
        let point = this.timeToPoint(value);
        point *= this.element.duration;

        // console.info('setting element time:', point, "based on:", {
        //     percentagePoint: this.startPoint + value / this.durationWithoutEndTime,
        //     elementDuration: this.element.duration,
        //     fragmentDurationWithoutEndTime: this.durationWithoutEndTime,
        //     valueDividedByDurationWithoutEndTime: value / this.durationWithoutEndTime,
        //     setValue: value,
        //     fragmentStartTime: this.startPoint,
        // });

        if (!isNaN(point))
            this.element.currentTime = point;
    }

    timeToPoint(time) {
        return this.startPoint + (time / this.durationWithoutEndTime) * (1 - this.startPoint);
    }

    get currentPoint() {
        return this.timeToPoint(this.currentTime);
    }

    set active(value) {
        this._active = value;
        if (value) {
            this.element.style.zIndex = 1;
            this.thumbnailElement.setAttribute("active", "");
            this.executeEvent("timeChange");
        } else {
            this.element.style.zIndex = 0;
            this.thumbnailElement.removeAttribute("active");
            this.currentTime = 0;
            this.pause();
        }
    }

    get active() {
        return this._active;
    }

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

    get exportStartTime() {
        if (this.metadataLoaded) {
            return this.startPoint * (this.element.duration /* / this.playbackSpeed*/ );
        }
        console.warn("Video metadata hasn't loaded yet");
        return 0;
    }

    get duration() {
        if (this.metadataLoaded) {
            return (this.endPoint - this.startPoint) * (this.element.duration / this.playbackSpeed);
        }
        console.warn("Video metadata hasn't loaded yet");
        return 0;
    }

    get durationWithoutEndTime() {
        if (this.metadataLoaded) {
            return (1 - this.startPoint) * (this.element.duration / this.playbackSpeed);
        }
        console.warn("Video metadata hasn't loaded yet");
        return 0;
    }

    get fps() {
        return this._fps * this.playbackSpeed;
    }

    updateFps() {
        FFMPEG.runCommand(['-i', this.path]).then(info => {
            let words = info.stderr.split('\n').find(line => line.includes(' fps')).split(' fps')[0].split(' ');
            this._fps = Number(words[words.length - 1]);
            this.executeEvent("loadedFps");
        });
    }

    updateThumbnail(timePercentage = 0) {
        this.getThumbnail(80, timePercentage).then(url => {
            this.executeEvent("thumbnail");
            this.thumbnailElement.style.backgroundImage = `url('${this.thumbnail}')`;
        });
    }

    getThumbnail(height = 80, timePercentage = 0) {
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');

            if (!isNaN(this.element.duration))
                this.element.currentTime = timePercentage * this.element.duration;

            this.element.oncanplaythrough = () => {

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

    export ({
        outputFile = 'output.mp4',
        fps = null,
        process = s => console.log(s),
    }) {
        let f = new FFMPEG();

        f.input = this.path;
        f.output = outputFile;
        f.startTime = this.exportStartTime;
        console.log("Exporting", this.exportStartTime);
        f.overwrite = true;
        if (this.duration !== this.element.duration)
            f.duration = this.duration;
        if (this.fps !== fps && fps !== null)
            f.frameRate = fps;
        if (this.playbackSpeed !== 1)
            f.playbackSpeed = this.playbackSpeed;
        if (this.volume !== 1)
            f.volume = this.volume;

        console.log(f);

        return f.run(i => process(Math.min(i.time, this.duration)));
    }
}