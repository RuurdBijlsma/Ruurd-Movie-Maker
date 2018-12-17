class WindowHider {
    constructor(window, body) {
        this.smallSize = [150, commands.length * 49];
        window.setSize(...this.smallSize);

        window.on('blur', () => this.hide());

        this.window = window;
        this.body = body;

        this.isVisible = false;

        // setTimeout(() => this.show(), 500);
        this.hide();
    }

    async show() {
        this.isVisible = true;
        this.body.style.opacity = "1";
        this.window.setIgnoreMouseEvents(false);
        this.window.focus();
    }

    async hide() {
        this.isVisible = false;
        this.body.style.opacity = "0";
        this.window.setIgnoreMouseEvents(true);
        this.window.blur();
    }

    async toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}