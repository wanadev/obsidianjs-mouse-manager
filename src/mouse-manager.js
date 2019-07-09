const self = require("../index.js").default;

/*
 * Copyright (c) 2014-2019, Wanadev <http://www.wanadev.fr/>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   * Redistributions of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *   * Neither the name of Wanadev nor the names of its contributors may be used
 *     to endorse or promote products derived from this software without specific
 *     prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Authored by: Fabien LOISON <http://flozz.fr/>, adapted by Timotée NEULLAS
 */

/**
 * @class MouseManager
 * @constructor
 * @extends photonui.Base
 * @param {photonui.Widget} element Any PhotonUI Widget (optional).
 * @param {HTMLElement} element Any HTML element (optional).
 */
class MouseManager {

    constructor(element, uniqId) {
        // this._registerWEvents([
        //     "mouse-event", "mouse-down", "mouse-up", "click", "double-click",
        //     "drag-start", "dragging", "drag-end", "mouse-move", "scroll-up",
        //     "scroll-down",
        // ]);

        /**
         * The HTML Element on which the events are binded.
         *
         * NOTE: If a photonui.Widget object is assigned to this property,
         *       its HTML Element will be automatically assigned to the property instead.
         *
         * @property element
         * @type HTMLElement
         * @default null
         */
        this._element = null;

        /**
         * The uniqId can be use when several mouseManager are used
         * UniqId will be transmit on each event involving mouseManager
         * @type {UniqId}
         */
        this.uniqId = uniqId || null;

        if (element && element instanceof HTMLElement) {
            this.setElement(element);
        } else if (self.app.config.get("element") && self.app.config.get("element") instanceof HTMLElement) {
            this.setElement(self.app.config.get("element"));
        }

        /**
         * Minimum distance for triggering a drag-start, and maximum distance
         * to consider a mouse down/up as a click.
         *
         * @property threshold
         * @type Number
         * @default 5
         */
        this._threshold = self.app.config.get("threshold") || 5;

        /**
         * Scale all position events by a factor. Use it when the canvas is scaled.
         *
         * @property scaleX
         * @type Number
         * @default 1
         */
        this._scaleX = 1;

        /**
         * Scale all position events by a factor. Use it when the canvas is scaled.
         *
         * @property scaleY
         * @type Number
         * @default 1
         */
        this._scaleY = 1;

        /**
         * Current state of the mouse right button.
         *
         * @property btnRight
         * @type Boolean
         * @readOnly
         */
        this._btnRight = false;

        /**
         * Current state of the mouse middle button.
         *
         * @property btnMiddle
         * @type Boolean
         * @readOnly
         */
        this._btnMiddle = false;

        /**
         * Current state of the mouse left button.
         *
         * @property btnLeft
         * @type Boolean
         * @readOnly
         */
        this._btnLeft = false;

        /**
         * Translate all position events by a scalar. Use it when the canvas is translated.
         *
         * @property translateX
         * @type Number
         * @default 0
         */
        this._translateX = 0;

        /**
         * Translate all position events by a scalar. Use it when the canvas is translated.
         *
         * @property translateY
         * @type Number
         * @default 0
         */
        this._translateY = 0;

        /**
         * The action:
         *
         *   * "mouse-down"
         *   * "moues-up"
         *   * "click"
         *   * "double-click"
         *   * "drag-start"
         *   * "dragging"
         *   * "drag-end"
         *   * "scroll-down"
         *   * "scroll-up"
         *   * "mouse-move"
         *
         * @property action
         * @readOnly
         * @type String
         */
        this._action = "";

        /**
         * The button that triggered the last event.
         *
         *   * none
         *   * "left"
         *   * "middle"
         *   * "right"
         *
         * @property button
         * @readOnly
         * @type String
         */
        this._button = null;

        // ====== Private properties ======

        /**
         * Previous state.
         *
         * @property __prevState
         * @private
         * @type Object
         */
        this.__prevState = {};

        /**
         * Js event on mouse down.
         *
         * @property __mouseDownEvent
         * @private
         * @type Object
         */
        this.__mouseDownEvent = {};

        /**
         * Last event object.
         *
         * @property __event
         * @private
         * @type Object
         * @default {}
         */
        this.__event = {};

        this.__events = {};
    }

    // ////////////////////////////////////////
    // Properties and Accessors             //
    // ////////////////////////////////////////

    // ====== Public properties ======


    getElement() {
        return this._element || document;
    }

    setElement(element) {
        if (element instanceof HTMLElement) {
            this._element = element;
        } else {
            this._element = null;
        }
        this._updateEvents();
    }

    getThreshold() {
        return this._threshold;
    }

    setThreshold(threshold) {
        this._threshold = threshold;
    }

    getScaleX() {
        return this._scaleX;
    }

    setScaleX(scaleX) {
        this._scaleX = scaleX;
    }

    getScaleY() {
        return this._scaleY;
    }

    setScaleY(scaleY) {
        this._scaleY = scaleY;
    }

    getTranslateX() {
        return this._translateX;
    }

    setTranslateX(translateX) {
        this._translateX = translateX;
    }

    getTranslateY() {
        return this._translateY;
    }

    setTranslateY(translateY) {
        this._translateY = translateY;
    }

    /**
     * X position, relative to page top-left corner.
     *
     * @property pageX
     * @readOnly
     * @type Number
     * @default 0
     */
    getPageX() {
        return this.__event.pageX || 0;
    }

    /**
     * Y position, relative to page top-left corner.
     *
     * @property pageY
     * @readOnly
     * @type Number
     * @default 0
     */
    getPageY() {
        return this.__event.pageY || 0;
    }

    /**
     * X position, relative to the HTML element.
     *
     * @property x
     * @readOnly
     * @type Number
     */
    getX() {
        const ex = MouseManager.getAbsolutePosition(this._element).x;
        return (this.getPageX() - ex) * this.getScaleX() + this.getTranslateX();
    }

    /**
     * Y position, relative to the HTML element.
     *
     * @property y
     * @readOnly
     * @type Number
     */
    getY() {
        const ey = MouseManager.getAbsolutePosition(this._element).y;
        return (this.getPageY() - ey) * this.getScaleY() + this.getTranslateY();
    }

    /**
     * Delta X (current_x - previous_x).
     *
     * @property deltaX
     * @readOnly
     * @type Number
     */
    getDeltaX() {
        return (this.getPageX() - ((this.__prevState.pageX !== undefined)
            ? this.__prevState.pageX : this.getPageX())) * this.getScaleX();
    }

    /**
     * Delta Y (current_y - previous_y).
     *
     * @property deltaY
     * @readOnly
     * @type Number
     */
    getDeltaY() {
        return (this.getPageY() - ((this.__prevState.pageY !== undefined)
            ? this.__prevState.pageY : this.getPageY())) * this.getScaleY();
    }


    getAction() {
        return this._action;
    }

    getBtnLeft() {
        return this._btnLeft;
    }

    getBtnMiddle() {
        return this._btnMiddle;
    }

    getBtnRight() {
        return this._btnRight;
    }

    getButton() {
        return this._button;
    }

    // ////////////////////////////////////////
    // Methods                              //
    // ////////////////////////////////////////

    /**
     * Bind events on the HTML Element.
     *
     * @method _updateEvents
     * @private
     */
    _updateEvents() {
        // Unbind all existing events
        Object.keys(this.__events).forEach((id) => {
            this._unbindEvent(id);
        });
        // Check if we have an html element
        if (!this._element) {
            return;
        }
        // Bind new events
        this._bindEvent("mouse-down", this._element, "mousedown", this.__onMouseDown.bind(this));
        this._bindEvent("mouse-up", this._element, "mouseup", this.__onMouseUp.bind(this));
        this._bindEvent("double-click", this._element, "dblclick", this.__onDoubleClick.bind(this));
        this._bindEvent("mouse-move", this._element, "mousemove", this.__onMouseMove.bind(this));
        this._bindEvent("mousewheel", this._element, "mousewheel", this.__onMouseWheel.bind(this));
        this._bindEvent("mousewheel-firefox", this._element, "DOMMouseScroll", this.__onMouseWheel.bind(this));

        this._bindEvent("document-mouse-up", document, "mouseup", this.__onDocumentMouseUp.bind(this));
        this._bindEvent("document-mouse-move", document, "mousemove", this.__onDocumentMouseMove.bind(this));
    }

    /**
     * Take a snapshot of the MouseManager
     *
     * @method _dump
     * @private
     * @return {Object}
     */
    _dump() {
        return {
            event: this.__event,
            action: this._action,
            uniqId: this.uniqId,
            pageX: this.getPageX(),
            pageY: this.getPageY(),
            x: this.getX(),
            y: this.getY(),
            deltaX: this.getDeltaX(),
            deltaY: this.getDeltaY(),
            btnLeft: this.getBtnLeft(),
            btnMiddle: this.getBtnMiddle(),
            btnRight: this.getBtnRight(),
            button: this.getButton(),
        };
    }

    /**
     * Analyze and dispatche wEvents.
     *
     * @method _stateMachine
     * @private
     * @param {String} action The action name (e.g. "mouse-up").
     * @param {Object} event The js event.
     */
    _stateMachine(action, event) {
        // Save the previous state
        this.__prevState = this._dump();

        // Load the current state
        this._action = action;
        this.__event = event;
        this._button = null;
        if (event.button === 0) {
            this._button = "left";
        }
        if (event.button === 1) {
            this._button = "middle";
        }
        if (event.button === 2) {
            this._button = "right";
        }

        // Analyze the event

        // Mouse Down / Mouse Up
        if (action === "mouse-down") {
            this.__mouseDownEvent = event;

            if (event.button === 0) {
                this._btnLeft = true;
            }
            if (event.button === 1) {
                this._btnMiddle = true;
            }
            if (event.button === 2) {
                this._btnRight = true;
            }

            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit(this._action, this._dump());
        } else if (action === "mouse-up") {
            if (event.button === 0) {
                this._btnLeft = false;
            }
            if (event.button === 1) {
                this._btnMiddle = false;
            }
            if (event.button === 2) {
                this._btnRight = false;
            }

            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit(this._action, this._dump());
        } else if (action === "drag-end") {
            if (event.button === 0) {
                this._btnLeft = false;
            }
            if (event.button === 1) {
                this._btnMiddle = false;
            }
            if (event.button === 2) {
                this._btnRight = false;
            }
        }

        // Click
        if (action === "mouse-up" && (Math.abs(this.getPageX() - this.__mouseDownEvent.pageX) <= this._threshold
                && Math.abs(this.getPageY() - this.__mouseDownEvent.pageY) <= this._threshold)) {
            this._action = "click";
            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit("click", this._dump());
        }

        // Double Click
        if (action === "double-click" && this.__prevState.action === "click") {
            this._action = "double-click";
            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit(this._action, this._dump());
        }

        // Mouse move
        if (action === "mouse-move") {
            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit(this._action, this._dump());
        }

        // Drag Start
        if (action === "mouse-move" && this.__prevState.action !== "drag-start"
            && this.__prevState.action !== "dragging" && (this._btnLeft || this._btnMiddle || this._btnRight)) {
            if (Math.abs(this.getPageX() - this.__mouseDownEvent.pageX) > this._threshold
                || Math.abs(this.getPageY() - this.__mouseDownEvent.pageY) > this._threshold) {
                // Drag Start
                this._action = "drag-start";
                this.__event = this.__mouseDownEvent;
                self.app.events.emit("mouse-event", this._dump());
                self.app.events.emit(this._action, this._dump());
                // Dragging
                this._action = "dragging";
                this.__prevState.event = this.__mouseDownEvent;
                this.__event = event;
                self.app.events.emit("mouse-event", this._dump());
                self.app.events.emit(this._action, this._dump());
            }

            // Dragging
        } else if (action === "dragging" || (action === "mouse-move" && (this.__prevState.action === "drag-start"
                || this.__prevState.action === "dragging") && (this._btnLeft || this._btnMiddle || this._btnRight))) {
            this._action = "dragging";
            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit(this._action, this._dump());

            // Drag End
        } else if (action === "drag-end" || (action === "mouse-up" && (this.__prevState.action === "dragging"
                || this.__prevState.action === "drag-start") && !(this._btnLeft || this._btnMiddle || this._btnRight))) {
            this._action = "drag-end";
            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit(this._action, this._dump());
        }

        // Scroll Up / Scroll Down
        if (action === "scroll-up" || action === "scroll-down") {
            self.app.events.emit("mouse-event", this._dump());
            self.app.events.emit(this._action, this._dump());
        }
    }

    // ////////////////////////////////////////
    // Internal Events Callbacks            //
    // ////////////////////////////////////////

    /**
     * @method __onMouseDown
     * @private
     * @param event
     */
    __onMouseDown(event) {
        this._stateMachine("mouse-down", event);
    }

    /**
     * @method __onMouseUp
     * @private
     * @param event
     */
    __onMouseUp(event) {
        this._stateMachine("mouse-up", event);
    }

    /**
     * @method __onDoubleClick
     * @private
     * @param event
     */
    __onDoubleClick(event) {
        this._stateMachine("double-click", event);
    }

    /**
     * @method __onMouseMove
     * @private
     * @param event
     */
    __onMouseMove(event) {
        this._stateMachine("mouse-move", event);
    }

    /**
     * Used to detect drag-end outside the element.
     *
     * @method __onDocumentMouseUp
     * @private
     * @param event
     */
    __onDocumentMouseUp(event) {
        if (event.target === this._element) {
            return;
        }
        if (this._action === "dragging" || this._action === "drag-start") {
            this._stateMachine("drag-end", event);
        }
    }

    /**
     * Used to detect dragging outside the element.
     *
     * @method __onDocumentMouseMove
     * @private
     * @param event
     */
    __onDocumentMouseMove(event) {
        if (event.target === this._element) {
            return;
        }
        if (this._action === "dragging" || this._action === "drag-start") {
            this._stateMachine("dragging", event);
        }
    }

    /**
     * @method __onMouseWheel
     * @private
     * @param event
     */
    __onMouseWheel(event) {
        let wheelDelta = null;

        // Webkit
        if (event.wheelDeltaY !== undefined) {
            wheelDelta = event.wheelDeltaY;
        }
        // MSIE
        if (event.wheelDelta !== undefined) {
            wheelDelta = event.wheelDelta;
        }
        // Firefox
        if (event.axis !== undefined && event.detail !== undefined) {
            if (event.axis === 2) { // Y
                wheelDelta = -event.detail;
            }
        }

        if (wheelDelta !== null) {
            if (wheelDelta >= 0) {
                this._stateMachine("scroll-up", event);
            } else {
                this._stateMachine("scroll-down", event);
            }
        }
    }

    /**
     * Javascript event binding (for internal use).
     *
     * @method _bindEvent
     * @private
     * @param {String} id An unique id for the event.
     * @param {DOMElement} element The element on which the event will be bind.
     * @param {String} evName The event name (e.g. "mousemove", "click",...).
     * @param {Function} callback The function that will be called when the event occured.
     */
    _bindEvent(id, element, evName, callback) {
        this._unbindEvent(id);
        this.__events[id] = {
            evName: evName,
            element: element,
            callback: callback,
        };
        this.__events[id].element.addEventListener(
            this.__events[id].evName,
            this.__events[id].callback,
            false
        );
    }

    /**
     * Unbind javascript event.
     *
     * @method _unbindEvent
     * @private
     * @param {String} id The id of the event.
     */
    _unbindEvent(id) {
        if (!this.__events[id]) {
            return;
        }
        this.__events[id].element.removeEventListener(
            this.__events[id].evName,
            this.__events[id].callback,
            false
        );
        delete this.__events[id];
    }

    /**
     * Get the absolute position of an HTML Element.
     *
     * @method getAbsolutePosition
     * @static
     * @param {HTMLElement} element The HTML element (or its id)
     * @return {Object} `{x: <Number>, y: <Number>}
     */
    static getAbsolutePosition(element) {
        let elementTested = element;
        if (typeof (elementTested) === "string") {
            elementTested = document.getElementById(elementTested);
        }
        if (!(elementTested instanceof Element)) {
            return {
                x: 0,
                y: 0,
            };
        }

        let css;
        const origElement = elementTested;

        try {
            css = getComputedStyle(elementTested);
        } catch (e) {
            return {
                x: 0,
                y: 0,
            };
        }

        if (!css) {
            return {
                x: 0,
                y: 0,
            };
        }

        let x = -parseInt(css.borderLeftWidth, 10);
        let y = -parseInt(css.borderTopWidth, 10);

        while (elementTested.offsetParent) {
            css = getComputedStyle(elementTested);

            x += elementTested.offsetLeft || 0;
            x += parseInt(css.borderLeftWidth, 10);

            y += elementTested.offsetTop || 0;
            y += parseInt(css.borderTopWidth, 10);

            elementTested = elementTested.offsetParent;
        }

        elementTested = origElement;

        while (elementTested.parentNode && !(elementTested instanceof HTMLBodyElement)) {
            x -= elementTested.scrollLeft || 0;
            y -= elementTested.scrollTop || 0;
            elementTested = elementTested.parentNode;
        }

        return {
            x: x,
            y: y,
        };
    }

}


export default MouseManager;
