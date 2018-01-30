class Main {
    constructor({videoContainer, thumbnailContainer}) {
        this.video = new Video({
            videoContainer: videoContainer,
            thumbnailContainer: thumbnailContainer
        });
    }
}
