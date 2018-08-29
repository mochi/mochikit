import counter from '../base/counter';
const _counter = counter(0);

export default class Visibility {
    constructor(el) {
        this.element = el;

        //Customize these:
        this.hiddenDisplay = 'hidden';
        this.visibleDisplay = 'block';
        this.hiddenVisibility = 'hidden';
        this.visibleVisibility = 'visible';

        this.modifiable = true;
        this.token = _counter();
    }

    show() {
        return this.setDisplay(this.visibleDisplay);
    }

    hide() {
        return this.setDisplay(this.hiddenDisplay);
    }

    isHiddenInAnyWay() {
        return this.isHidden() || this.isInvisible();
    }

    invisible() {
        return this.setVisibility(this.hiddenVisibility);
    }

    visible() {
        return this.setVisibility(this.visibleVisibility);
    }

    isInvisible() {
        return this.getVisibility() === this.hiddenVisibility;
    }

    isVisible() {
        return this.getVisibility() === this.visibleVisibility;
    }

    setVisibility(val) {
        if (!this.isLocked()) {
            this.element.style.visibility = val;
        }

        return this;
    }

    getVisibility() {
        return this.element.style.visibility;
    }

    isHidden() {
        return this.getDisplay() === this.hiddenDisplay;
    }

    isVisible() {
        return this.getDisplay() === this.visibleDisplay;
    }

    toggle() {
        this.isHidden() ? this.show() : this.hide();
        return this;
    }

    hideAfter(timeout) {
        return this.taskAfter('hide', timeout);
    }

    showAfter(timeout) {
        return this.taskAfter('show', timeout);
    }

    toggleAfter(timeout) {
        return this.taskAfter('toggle', timeout);
    }

    taskAfter(method, timeout) {
        let self = this;
        this.timeoutID = setTimeout(
            () => ((self.timeoutID = null), self[method]()),
            timeout
        );
        return this;
    }

    getDisplay() {
        return this.element.style.display;
    }

    setDisplay(val) {
        if (!this.isLocked()) {
            this.element.style.display = val;
        }

        return this;
    }

    cancelTimeout() {
        clearTimeout(this.timeoutID);
        return this;
    }

    timeoutActive() {
        return this.timeoutID != null;
    }

    lock() {
        this.modifiable = false;
        return this;
    }

    unlock() {
        this.modifiable = true;
        return this;
    }

    isLocked() {
        return !this.modifiable;
    }

    isModifiable() {
        return !this.isLocked();
    }

    clone() {
        let vis = new Visibility();
        vis.modifiable = this.modifiable;
        vis.timeoutID = this.timeoutID;
        vis.visibleDisplay = this.visibleDisplay;
        vis.element = this.element;
        vis.hiddenDisplay = this.hiddenDisplay;
        return vis;
    }

    fromParent() {
        return new Visibility(this.element.parentNode);
    }

    fromChildAt(index) {
        return new Visibility(this.element.childNodes[+index]);
    }

    fromFirstMatch(selector) {
        return new Visibility(this.element.querySelector(selector));
    }

    clearContent() {
        this.element.innerHTML = '';
        return this;
    }

    cloneWithEl(el) {
        let vis = this.clone();
        vis.element = el;
        return vis;
    }

    setShowStates(display, visibility) {
        this.visibleDisplay = display;
        this.visibleVisibility = visibility;
        return this;
    }

    getShowStates() {
        return [this.visibleDisplay, this.visibleVisibility];
    }

    setHiddenStates(display, visibility) {
        this.hiddenVisibility = visibility;
        this.hiddenDisplay = display;
        return this;
    }

    getHiddenStates() {
        return [this.visibleVisibility, this.hiddenVisibility];
    }
}
