class VideoFragment {
    constructor(file) {
        this.eventListeners = {};
        this.file = file;

        this.element = document.createElement("video");
        this.element.src = file.path;
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
            this.widthPerSecond = 3;
            this.updateThumbnail(this.startTime);
        };

        this.active = false;
        this.startTime = 0;
        this.endTime = 1;
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

    get playbackSpeed() {
        return this._playbackSpeed;
    }

    set playbackSpeed(value) {
        this._playbackSpeed = value;
        this.element.playbackRate = value;
        this.updateThumbnailWidth();
    }

    get startTime() {
        return this._startTime;
    }

    set startTime(value) {
        if (value < 0) {
            console.warn("startTime can't be lower than 0");
            return;
        }

        this._startTime = value;
        this.updateThumbnailWidth();
    }

    get endTime() {
        return this._endTime;
    }

    set endTime(value) {
        if (value > 1) {
            console.warn("endTime can't be higher than the video duration");
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
        let point = this.durationWithoutEndTime * (this.startTime * this.element.duration - this.element.currentTime);
        point /= (this.startTime - 1) * this.element.duration;

        // console.log('getting currentTime:', point, "based on:", {
        //     elementDuration: this.element.duration,
        //     elementTime: this.element.currentTime,
        //     fragmentStartTime: this.startTime,
        //     fragmentDurationWithoutStartTime: this.durationWithoutEndTime,
        // });

        return point;
    }

    set currentTime(value) {
        let point = this.startTime + (value / this.durationWithoutEndTime) * (1 - this.startTime);
        point *= this.element.duration;

        // console.info('setting element time:', point, "based on:", {
        //     percentagePoint: this.startTime + value / this.durationWithoutEndTime,
        //     elementDuration: this.element.duration,
        //     fragmentDurationWithoutEndTime: this.durationWithoutEndTime,
        //     valueDividedByDurationWithoutEndTime: value / this.durationWithoutEndTime,
        //     setValue: value,
        //     fragmentStartTime: this.startTime,
        // });

        if (!isNaN(point))
            this.element.currentTime = point;
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

    get duration() {
        if (this.metadataLoaded) {
            return (this.endTime - this.startTime) * (this.element.duration / this.playbackSpeed);
        }
        console.warn("Video metadata hasn't loaded yet");
        return 0;
    }

    get durationWithoutEndTime() {
        if (this.metadataLoaded) {
            return (1 - this.startTime) * (this.element.duration / this.playbackSpeed);
        }
        console.warn("Video metadata hasn't loaded yet");
        return 0;
    }

    get fps() {
        return this._fps * this.playbackSpeed;
    }

    updateFps() {
        runFFMPEGCommand(['-i', this.file.path]).then(info => {
            let words = info.in.split('\n').find(line => line.includes(' fps')).split(' fps')[0].split(' ');
            this._fps = Number(words[words.length - 1]);
            this.executeEvent("loadedFps");
        });
    }

    updateThumbnail(timePercentage = 0) {
        console.log('1', timePercentage);
        this.getThumbnail(80, timePercentage).then(url => {
            this.executeEvent("thumbnail");
            this.thumbnailElement.style.backgroundImage = `url('${this.thumbnail}')`;
        });
    }

    getThumbnail(height = 80, timePercentage = 0) {
        console.log('2', timePercentage);
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
}