//Base class. Do not use directly:
export default class Widget {
    constructor(element) {
        this.element = element;
        this[Symbol.species] = Widget;
    }

    //Override:
    show() {
        this.element.display = 'initial';
        return this;
    }

    hide() {
        this.element.display = 'none';
        return this;
    }

    toggle() {
        this.isHidden() ? this.show() : this.hide();
        return this;
    }

    isHidden() {
        return this.element.display === 'none';
    }

    on(event, handler) {
        this.element.addEventListener(event, handler);
        return this;
    }

    off(event, handler) {
        this.element.removeEventListener(event, handler);
        return this;
    }

    isDisabled() {
        return this.element.disabled;
    }

    attr(key, value) {
        if(value !== undefined) {
            this.element.setAttribute(key, value);
        } else {
            return this.element.getAttribute(key);
        } 

        return this;
    }

    setAttr(key, val) {
        return this.attr(key, val);
    }

    getAttr(key) {
        return this.attr(key);
    }

    detatch() {
        (this.oldParent = this.parent()).removeChild(this.element);
        return this;
    }

    attach(parent) {
        parent.appendChild(this.element);
        return this;
    }

    parent() {
        return this.element.parentNode;
    }

    parentWidget() {
        return new this[Symbol.species](this.parent());
    }

    reattach() {
        if(this.oldParent) {
            this.attach(this.oldParent);
        }

        return this;
    }

    detatched() {
        return !this.parent();
    }

    dimensions() {
        return this.element.getBoundingClientRect();
    }

    x() {
        return this.dimensions().x;
    }

    y() {
        return this.dimensions().y;
    }

    width() {
        return this.dimensions().width;
    }

    height() {
        return this.dimensions().height;
    }

    top() {
        return this.dimensions().top;
    }

    right() {
        return this.dimensions().right;
    }

    bottom() {
        return this.dimensions().bottom;
    }

    left() {
        return this.dimensions().left;
    }

    clearAttr(key) {
        return this.attr(key, '');
    }

    clearID() {
        return this.clearAttr('id');
    }

    clearClass() {
        return this.clearAttr('class');
    }

    hasAttr(attr) {
        return this.element.hasAttribute(attr);
    }

    hasClass(name) {
        return this.element.className.indexOf(name) > -1;
    }

    isEmpty() {
        return this.html() === '';
    }

    hasChildren() {
        return this.children().length !== 0;
    }

    children(array) {
        if(array && Array.isArray(array)) {
            this.html('');
            for(let item of array) {
                this.element.appendChild(item);
            }
        } else {
            return this.element.childNodes;
        }
    }

    html(value) {
        if(value === undefined) {
            return this.element.innerHTML;
        } else {
            this.element.innerHTML = value;
            return this;
        }
    }
}