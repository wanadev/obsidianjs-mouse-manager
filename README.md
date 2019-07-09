# Mouse-manager

Manage advanced mouse events on HTMLElements.

## Using This Module

   const obsidian = require("@obsidianjs/obsidian");
   const mouseManager = require("mouse-manager");

   const app = obsidian("my-application");
   app.use(mouseManager);
   app.start();

  Finally require it in modules that need it::

     {
         name: "my-module",
         requires: ["mouse-manager"],

         load(app) {
             const MouseManager = app.modules;
             // ...
         },

         // ...

     }

## Use it in your JavaScript

      const MouseManager = self.app.modules.mouseManager;
      let currentMouseManager = new MouseManager(null, uniqId);


      self.app.events.on("@mouse-manager.scroll-up", this.myEventFunc.bind(this));
      self.app.events.on("@mouse-manager.scroll-down", this.myEventFunc.bind(this));
      self.app.events.on("@mouse-manager.mouse-move", this.myEventFunc.bind(this));
      self.app.events.on("@mouse-manager.double-click", this.myEventFunc.bind(this));
      self.app.events.on("@mouse-manager.dragging", this.myEventFunc.bind(this));

      const canvas = document.getElementById("myCanvas");
      currentMouseManager.setElement(canvas);

      myEventFunc(mstate) {
        console.log(mstate.x, mstate.y, mstate.deltaX, mstate.deltaY);
      }


## List of events :
  * mouse-event:
     - description: Called for *ALL* mouse events.
     - callback:    function(manager, mstate)
  * mouse-down:
     - description: Mouse button pressed.
     - callback:    function(manager, mstate)
  * mouse-up:
     - description: Mouse button released.
     - callback:    function(manager, mstate)
  * click:
     - description: Click...
     - callback:    function(manager, mstate)
  * double-click:
     - description: Double click...
     - callback:    function(manager, mstate)
  * drag-start:
     - description: Start dragging.
     - callback:    function(manager, mstate)
  * dragging:
     - description: dragging.
     - callback:    function(manager, mstate)
  * drag-end:
     - description: Stop dragging.
     - callback:    function(manager, mstate)
  * mouse-move:
     - description: Mouse move on the element.
     - callback:    function(manager, mstate)
  * scroll-up:
     - description: Scroll up.
     - callback:    function(manager, mstate)
  * scroll-down:
     - description: Scroll down.
     - callback:    function(manager, mstate)

## mstate:
  A snapshot of the mouse state ath the moment when the event occured.

    {
        event: <Object>,       // The original js event
        action: <String>,      // The event name (mouse-down/up/move, click, double-click,
                               //    drag-start/end, dragging, scroll-up/down)
        pageX: <Number>,       // X position, relative to page top-left corner.
        pageY: <Number>,       // Y position, relative to page top-left corner.
        x: <Number>,           // X position, relative to the HTML element.
        y: <Number>,           // Y position, relative to the HTML element.
        deltaX: <Number>,      // Delta X (current_x - previous_x)
        deltaY: <Number>,      // Delta Y (current_y - previous_y)
        btnLeft: <Boolean>,    // Current state of the mouse left button.
        btnMiddle: <Boolean>,  // Current state of the mouse middle button.
        btnRight: <Boolean>,   // Current state of the mouse right button.
        button: <String>       // The button that triggered the last event
                                  (none, "left", "middle", "right").
    }
