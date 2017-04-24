class Video {
    constructor({videoPlayer, videoContainer, thumbnailContainer, seekProgress, seekThumb, timeStamp, playButton}) {
        this.fragments = [];
        this.videoPlayer = videoPlayer;
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

    playLoop() {
        this.updateTime(this.currentTime);

        if (this.activeFragment.currentTime + 1 / this.activeFragment.fps > this.activeFragment.duration) {
            let currentIndex = this.fragments.indexOf(this.activeFragment);
            if (currentIndex + 1 >= this.fragments.length) {
                this.pause();
            } else {
                this.activeFragment.pause();
                this.activeFragment = this.fragments[currentIndex + 1];

                this.activeFragment.play(0);
                this.updateTime();
            }
        }
    }

    play() {
        if (!this.playing) {
            this.playButton.innerText = "pause";

            this.playing = self.setInterval(() => this.playLoop(), 1000 / 60);
            this.activeFragment.play();
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
        if (value === undefined)
            value = this.currentTime;

        let duration = this.duration;
        let percentage = value / duration * 100;

        this.seekThumb.style.left = `calc(${percentage}% - 7px)`;
        this.seekProgress.style.width = percentage + '%';

        this.timeStamp.innerText = this.secondsToHms(value) + ' / ' + this.secondsToHms(duration);

        if (this.activeFragment) {
            let thumbPercentage = this.activeFragment.currentTime / this.activeFragment.duration * 100;
            this.activeFragment.thumbnailSeeker.style.left = `calc(${thumbPercentage}% - 2px)`;
        }
    }

    secondsToHms(seconds) {
        let stamp = new Date();
        stamp.setTime(seconds * 1000);

        let h = stamp.getHours();

        let m = stamp.getMinutes();
        m = m < 10 ? '0' + m : m;

        let s = stamp.getSeconds();
        s = s < 10 ? '0' + s : s;

        let cs = Math.floor(stamp.getMilliseconds() / 10);
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

        this.loaded = 0;
        this.toLoad = files.length;

        for (let file of files) {
            let fragment = new VideoFragment(file);

            this.addFragment(fragment);
        }
    }

    addFragment(fragment, index) {
        fragment.thumbnailSeeker.addEventListener('mousedown', e => {
            this.seeking = true;
            this.onMouseMove(e);
        });
        fragment.thumbnailElement.addEventListener('mouseenter', () => this.hoveringFragment = fragment);

        fragment.thumbnailElement.addEventListener('mouseup', () => {
            this.activeFragment = fragment;
        });

        fragment.addEventListener('loadedMetadata', () => {
            if (++this.loaded === this.toLoad) {
                if (!this.activeFragment) {
                    this.currentTime = 0;
                }
            }
            this.updateTime();
        });

        fragment.addEventListener('timeChange', () => this.updateTime());

        if (index) {
            this.moveFragment(fragment, index);
        } else {
            this.videoContainer.appendChild(fragment.element);
            this.thumbnailContainer.appendChild(fragment.thumbnailElement);
            this.fragments.push(fragment);
        }

        this.showPlayer();
    }

    get playerIsVisible() {
        return this.videoPlayer.style.display !== "none" && this.videoPlayer.style.display !== "";
    }

    showPlayer() {
        if (!this.playerIsVisible)
            this.videoPlayer.style.display = "block";
    }

    hidePlayer() {
        if (this.playerIsVisible)
            this.videoPlayer.style.display = "none";
    }

    removeFragment(fragment) {
        fragment.pause();

        if (fragment.element.parentNode)
            fragment.element.parentNode.removeChild(fragment.element);

        if (fragment.thumbnailElement.parentNode)
            fragment.thumbnailElement.parentNode.removeChild(fragment.thumbnailElement);

        let foundIndex = this.fragments.indexOf(fragment);
        if (foundIndex !== -1)
            this.fragments.splice(foundIndex, 1);

        if (this.activeFragment === fragment && this.fragments.length > 0) {
            this.activeFragment = this.fragments[Math.max(foundIndex - 1, 0)];
            console.log(1);
        }

        if (this.fragments.length === 0) {
            this.hidePlayer();
            video.activeFragment = undefined;
        }
        else {
            this.updateTime();
        }
    }

    insertNodeAt(parent, newChild, desiredIndex) {
        let children = parent.children;
        if (desiredIndex === children.length) {
            parent.appendChild(newChild);
        } else {
            parent.insertBefore(newChild, children[desiredIndex]);
        }
    }

    moveFragment(fragment, index) {
        this.removeFragment(fragment);
        this.insertNodeAt(this.thumbnailContainer, fragment.thumbnailElement, index);
        this.insertNodeAt(this.videoContainer, fragment.element, index);
        this.fragments.splice(index, 0, fragment);
        this.updateTime();
    }

    split(fragment, timePercent = 0.5) {
        let index = this.fragments.indexOf(fragment);
        let newFragment = new VideoFragment(fragment.file);
        this.addFragment(newFragment, index);

        newFragment.startTime = timePercent;
        fragment.endTime = timePercent;
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
            let prevFragment = this.activeFragment;
            let originalValue = value;

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

            this.updateTime(originalValue);
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
        if (value !== undefined) {
            if (this._activeFragment !== undefined && this._activeFragment !== value)
                this._activeFragment.active = false;
            value.active = true;
        }
        this._activeFragment = value;
    }

    get activeFragment() {
        return this._activeFragment;
    }
}