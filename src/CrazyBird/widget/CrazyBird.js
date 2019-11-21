define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin",
    "dojo/_base/lang",
    "dojo/text!CrazyBird/widget/template/CrazyBird.html"
], function (declare, _WidgetBase, _TemplatedMixin, lang, /*_jQuery,*/ widgetTemplate) {
    "use strict";
    // var $ = _jQuery.noConflict(true);
    return declare("CrazyBird.widget.CrazyBird", [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,
        // DOM elements
        canvas: null,
        // Parameters configured in the Modeler.
        messageString: "",
        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {

            const score = document.querySelector(".score");
            const startScreen = document.querySelector(".startScreen");
            const gameArea = document.querySelector(".gameArea");
            const gameMessage = document.querySelector(".gameMessage");
            gameMessage.addEventListener("click", start);
            startScreen.addEventListener("click", start);
            document.addEventListener("keydown", pressOn);
            document.addEventListener("keyup", pressOff);
            let keys = {};
            let player = {};

            function start() {
                player.speed = 2;
                player.score = 0;
                player.inplay = true;
                gameArea.innerHTML = "";
                gameMessage.classList.add("hide");
                startScreen.classList.add("hide");
                let bird = document.createElement("div");
                bird.setAttribute("class", "bird");
                let wing = document.createElement("span");
                wing.setAttribute("class", "wing");
                wing.pos = 15;
                wing.style.top = wing.pos + "px";
                bird.appendChild(wing);
                gameArea.appendChild(bird);
                player.x = bird.offsetLeft;
                player.y = bird.offsetTop;
                player.pipe = 0;
                let spacing = 500;
                let howMany = Math.floor((gameArea.offsetWidth) / spacing);
                ///console.log(howMany);
                for (let x = 0; x < howMany; x++) {
                    buildPipes(player.pipe * spacing);
                }
                window.requestAnimationFrame(playGame);
            }

            function buildPipes(startPos) {
                let totalHeight = gameArea.offsetHeight;
                let totalWidth = gameArea.offsetWidth;
                player.pipe++;
                let pipeColor = clr();
                let pipe1 = document.createElement("div");
                pipe1.start = startPos + totalWidth;
                pipe1.classList.add("pipe");
                pipe1.innerHTML = "<br>" + player.pipe;
                pipe1.height = Math.floor(Math.random() * 350);
                pipe1.style.height = pipe1.height + "px";
                pipe1.style.left = pipe1.start + "px";
                pipe1.style.top = "0px";
                pipe1.x = pipe1.start;
                pipe1.id = player.pipe;
                pipe1.style.backgroundColor = pipeColor ;
                gameArea.appendChild(pipe1);
                let pipeSpace = Math.floor(Math.random() * 250) + 150;
                let pipe2 = document.createElement("div");
                pipe2.start = pipe1.start;
                pipe2.classList.add("pipe");
                pipe2.innerHTML = "<br>" + player.pipe;
                pipe2.style.height = totalHeight - pipe1.height - pipeSpace + "px";
                pipe2.style.left = pipe1.start + "px";
                pipe2.style.bottom = "900px";
                pipe2.x = pipe1.start;
                pipe2.id = player.pipe;
                pipe2.style.backgroundColor = pipeColor ;
                gameArea.appendChild(pipe2);
            }

            function clr(){
                return "#"+Math.random().toString(16).substr(-6);
            }

            function movePipes(bird) {
                let lines = document.querySelectorAll(".pipe");
                let counter = 0; //counts pips to remove
                lines.forEach(function (item) {
                    item.x -= player.speed;
                    item.style.left = item.x + "px";
                    if (item.x < 0) {
                        item.parentElement.removeChild(item);
                        counter++;
                    }
                    if (isCollide(item, bird)) {
                        playGameOver(bird);
                    }
                })
                counter = counter / 2;
                for (let x = 0; x < counter; x++) {
                    buildPipes(0);
                }
            }

            function isCollide(a, b) {
                let aRect = a.getBoundingClientRect();
                let bRect = b.getBoundingClientRect();
                return !(
                    (aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) || (aRect.right < bRect.left) || (aRect.left > bRect.right))
            }

            function playGame() {
                if (player.inplay) {
                    let bird = document.querySelector(".bird");
                    let wing = document.querySelector(".wing");
                    movePipes(bird);
                    let move = false;
                    if (keys.ArrowLeft && player.x > 0) {
                        player.x -= player.speed;
                        move = true;
                    }
                    if (keys.ArrowRight && player.x < (gameArea.offsetWidth - 50)) {
                        player.x += player.speed;
                        move = true;
                    }
                    if ((keys.ArrowUp || keys.Space) && player.y > 0) {
                        player.y -= (player.speed * 5);
                        move = true;
                    }
                    if (keys.ArrowDown && player.y < (gameArea.offsetHeight - 50)) {
                        player.y += player.speed;
                        move = true;
                    }
                    if (move) {
                        wing.pos = (wing.pos == 15) ? 25 : 15;
                        wing.style.top = wing.pos + "px";
                    }
                    player.y += (player.speed * 2);
                    if (player.y > gameArea.offsetHeight) {
                        playGameOver(bird);
                    }
                    bird.style.top = player.y + "px";
                    bird.style.left = player.x + "px";
                    window.requestAnimationFrame(playGame);
                    player.score++;
                    score.innerText = "Score:" + player.score;
                }
            }

            function playGameOver(bird) {
                player.inplay = false;
                gameMessage.classList.remove("hide");
                bird.setAttribute("style", "transform:rotate(180deg)");
                gameMessage.innerHTML = "Game Over<br>You scored " + player.score + "<br>Click here to start again";
            }

            function pressOn(e) {
                e.preventDefault();
                keys[e.code] = true;
                ///console.log(keys);
            }

            function pressOff(e) {
                e.preventDefault();
                keys[e.code] = false;
            }

            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {

            this._contextObj = obj;
            this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        enable: function () { },
        disable: function () { },
        resize: function (box) { },
        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // Attach events to HTML dom elements
        _setupEvents: function () {
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            if (this._contextObj !== null) {
            } else {
            }
            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            this._executeCallback(callback, "_updateRendering");
        },
        _executeCallback: function (cb, from) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["CrazyBird/widget/CrazyBird"]);
