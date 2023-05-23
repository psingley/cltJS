define([
    'jquery',
    'underscore',
    'app'
], function ($, _, App) {
    var titleAlert = (function () {

        /**
         * Exposes operations for flashing text on screen.
         *
         * @class titleAlert
         * @param text
         * @param settings
         * @param $element
         */
        var constructor = function (text, settings, $element) {
            var context = this;

            /**
             * If the window currently has focus
             *
             * @property hasFocus
             * @type {boolean}
             * @private
             */
            var _hasFocus = true;

            /**
             * If the interval is currently running
             *
             * @property _running
             * @type {boolean}
             * @private
             */
            var _running = false;

            /**
             * private accessor for the interval
             *
             * @property _intervalToken
             * @type {null}
             * @private
             */
            var _intervalToken = null;

            /**
             * private accessor for timeout (if there is a duration specified)
             *
             * @property _timeoutToken
             * @type {null}
             * @private
             */
            var _timeoutToken = null;

            /**
             * The original text of the element
             *
             * @property _initialText
             * @type {null}
             * @private
             */
            var _initialText = null;

            /**
             * private accessor for title alert settings
             *
             * @property _settings
             * @type {null}
             * @private
             */
            var _settings = null;

            /**
             * default settings for the title alert
             *
             * @property defaults
             * @type {{interval: number, originalTitleInterval: null, duration: number, stopOnFocus: boolean, requireBlur: boolean, stopOnMouseMove: boolean}}
             */
            var defaults = {
                interval: 500,
                originalTitleInterval: null,
                duration: 0,
                stopOnFocus: true,
                requireBlur: false,
                stopOnMouseMove: false
            };

            // override default settings with specified settings
            _settings = settings = $.extend({}, defaults, settings);

            // originalTitleInterval defaults to interval if not set
            settings.originalTitleInterval = settings.originalTitleInterval || settings.interval;

            /**
             * When switching back to the window will stop the title tag from flashing
             *
             * @method onFocus
             */
            this.onFocus = function () {
                _hasFocus = true;

                if (_running && _settings.stopOnFocus) {
                    var initialText = _initialText;
                    context.stop();

                    // ugly hack because of a bug in Chrome which causes a change of $element immediately after tab switch
                    // to have no effect on the browser title
                    setTimeout(function () {
                        if (_running)
                            return;
                        $element.text(".");
                        $element.text(initialText);
                    }, 1000);
                }
            };

            /**
             * Sets _hasFocus to false
             *
             * @method onBlur
             */
            this.onBlur = function () {
                _hasFocus = false;
            };

            //check to see if it is the title tag before registering these events
            if ($element.is('title')) {
                // bind focus and blur event handlers
                $(window).bind("focus", this.onFocus);
                $(window).bind("blur", this.onBlur);
            }

            // is the title alert running
            this.isRunning = function () {
                console.log('hit is running method');
                console.log(_running);

                return _running;
            };

            /**
             * Stops the process
             *
             * @method stop
             */
            this.stop = function () {
                clearTimeout(_intervalToken);
                clearTimeout(_timeoutToken);
                $element.text(_initialText);

                _timeoutToken = null;
                _intervalToken = null;
                _initialText = null;
                _running = false;
                _settings = null;
            };

            /**
             * starts the flashing text
             *
             * @method start
             */
            this.start = function () {
                // if it's required that the window doesn't have focus, and it has, just return
                if (settings.requireBlur && _hasFocus)
                    return;

                _running = true;
                _initialText = $element.text();
                $element.text(text);
                var showingAlertTitle = true;

                var switchTitle = function () {
                    // WTF! Sometimes Internet Explorer 6 calls the interval function an extra time!
                    if (!_running)
                        return;

                    showingAlertTitle = !showingAlertTitle;
                    $element.text((showingAlertTitle ? text : _initialText));
                    _intervalToken = setTimeout(switchTitle, (showingAlertTitle ? settings.interval : settings.originalTitleInterval));
                };

                _intervalToken = setTimeout(switchTitle, settings.interval);

                if (settings.stopOnMouseMove) {
                    $(document).mousemove(function (event) {
                        $(context).unbind(event);
                        context.stop();
                    });
                }

                // check if a duration is specified
                if (settings.duration > 0) {
                    _timeoutToken = setTimeout(function () {
                        context.stop();
                    }, settings.duration);
                }
            };
        };

        return constructor;
    })();

    return titleAlert;
});