class Video {
    constructor({videoContainer, thumbnailContainer, seekProgress, seekThumb, timeStamp, playButton}) {
        this.fragments = [];
        this.videoContainer = videoContainer;
        this.thumbnailContainer = thumbnailContainer;
        this.seekProgress = seekProgress;
        this.seekThumb = seekThumb;
        this.timeStamp = timeStamp;
        this.playButton = playButton;

        document.addEventListener('mousemove', e => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.seeking = false);
        this.seeking = false;
    }

    nextFrame() {
        this.pause();
        this.currentTime += 1 / this.activeFragment.fps;
    }

    previousFrame() {
        this.pause();
        this.currentTime += 1 / this.activeFragment.fps;
    }

    play() {
        if (!this.playing) {
            this.playButton.innerText = "pause";

            this.playing = self.setInterval(() => this.updateTime(this.currentTime), 1000 / 60);
            this.activeFragment.play();
            this.activeFragment.element.onended = () => {
                let currentIndex = this.fragments.indexOf(this.activeFragment);
                if (currentIndex + 1 >= this.fragments.length) {
                    this.pause();
                } else {
                    this.activeFragment = this.fragments[currentIndex + 1];
                    this.activeFragment.play(0);
                }
            }
        }
    }

    pause() {
        if (this.playing) {
            this.playButton.innerText = "play_arrow";

            clearInterval(this.playing);
            this.activeFragment.pause();
            delete this.playing;
        }
    }

    updateTime(value) {
        if (!value)
            value = this.currentTime;
        let duration = this.duration;
        let percentage = value / duration * 100;
        this.seekThumb.style.left = `calc(${percentage}% - 7px)`;
        this.seekProgress.style.width = percentage + '%';

        this.timeStamp.innerText = this.secondsToHms(value) + ' / ' + this.secondsToHms(duration);
    }

    secondsToHms(seconds) {
        let stamp = new Date();
        stamp.setTime(seconds * 1000);

        let h = stamp.getHours();

        let m = stamp.getMinutes();
        m = m < 10 ? '0' + m : m;

        let s = stamp.getSeconds();
        s = s < 10 ? '0' + s : s;

        let cs = Math.round(stamp.getMilliseconds() / 10);
        cs = cs < 10 ? '0' + cs : cs;

        let hms = `${m}:${s}.${cs}`;
        if (h === "0")
            hms = h + hms;

        return hms;
    }

    get duration() {
        let duration = 0;
        for (let fragment of this.fragments) {
            duration += fragment.duration;
        }
        return duration;
    }

    addFragments(...files) {
        if (files[0] instanceof FileList)
            files = files[0];

        let loaded = 0;
        let toLoad = files.length;

        for (let file of files) {
            let fragment = new VideoFragment(file);

            fragment.thumbnailSeeker.addEventListener('mousedown', e => {
                this.seeking = true;
                this.onMouseMove(e);
            });
            fragment.thumbnailElement.addEventListener('mouseenter', () => this.hoveringFragment = fragment);

            this.videoContainer.appendChild(fragment.element);
            this.thumbnailContainer.appendChild(fragment.thumbnailElement);
            this.fragments.push(fragment);

            fragment.addEventListener('loadedMetadata', () => {
                if (++loaded === toLoad) {
                    if (!this.activeFragment) {
                        this.currentTime = 0;
                    }
                }
                this.updateTime();
            });
        }
    }

    onMouseMove(e) {
        if (this.seeking && this.hoveringFragment) {
            let offset = this.hoveringFragment.thumbnailElement.getBoundingClientRect();
            let x = e.pageX - offset.left;
            let width = this.hoveringFragment.thumbnailElement.offsetWidth;

            x = x < 0 ? 0 : x;
            x = x > width ? width : x;

            let startTime = 0;
            for (let fragment of this.fragments) {
                if (fragment === this.hoveringFragment) {
                    break;
                }
                startTime += fragment.duration;
            }
            this.currentTime = startTime + this.hoveringFragment.duration * x / width;
        }
    }

    set currentTime(value) {
        if (value >= 0 && value <= this.duration) {
            this.updateTime(value);
            let prevFragment = this.activeFragment;

            for (let fragment of this.fragments) {
                if (value < fragment.duration) {
                    fragment.currentTime = value;
                    this.activeFragment = fragment;
                    break;
                } else {
                    value -= fragment.duration;
                }
            }

            if (this.activeFragment !== prevFragment) {
                for (let fragment of this.fragments) {
                    if (this.activeFragment === fragment && this.playing)
                        fragment.play();
                    else
                        fragment.pause();
                }
            }
        }
    }

    get currentTime() {
        let time = 0;
        for (let fragment of this.fragments) {
            if (fragment === this.activeFragment) {
                return time + fragment.currentTime;
            }
            time += fragment.duration;
        }
    }

    set activeFragment(value) {
        if (this._activeFragment !== undefined)
            this._activeFragment.active = false;
        value.active = true;
        this._activeFragment = value;
    }

    get activeFragment() {
        return this._activeFragment;
    }
}