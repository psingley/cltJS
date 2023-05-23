(function () {

    /**
     * Timeline Class used to control the banner
     * */
    function Timeline() {
        this.queue = [];
    }

    /**
     * Adds a function to be executed
     * Functions are executed in the order that they are added to the timeline
     * Delay is the time a function waits after the preceding function was executed
     *
     * @param {Function} fn
     * @param {Number} delay is a number in milliseconds
     *
     * */
    Timeline.prototype.add = function (fn, delay) {
        this.queue.push({
            fn: fn,
            delay: delay,
            complete: false
        });
    };

    /**
     * Start executing the Timeline's sequence of Functions
     * */
    Timeline.prototype.start = function (loop) {
        var tl = this;
        if (tl.timelineActive) {
            console.log('timeline already active');
            return;
        }
        tl.timelineActive = true;
        tl.startTime = new Date().getTime();
        tl.queue.reduce(function (timestamp, currentValue, currentIndex, array) {
            timestamp += currentValue.delay;
            currentValue.timestamp = timestamp;
            return timestamp;
        }, 0);
        function animate() {
            var now = new Date().getTime();
            var completed = 0;
            tl.forEach(tl.queue, function (q, i) {
                if (!q.complete && now >= q.timestamp + tl.startTime) {
                    q.complete = true;
                    q.fn();
                    completed++;
                } else if (q.complete) {
                    completed++;
                }
            });
            if (tl.queue.length > completed) {
                tl.reqAnimFrame = window.requestAnimationFrame(animate);
            } else if (tl.queue.length === completed && loop) {
                // LOOP
                tl.startTime = new Date().getTime();
                tl.forEach(tl.queue, function (currentVal) {
                    currentVal.complete = false;
                });
                tl.reqAnimFrame = window.requestAnimationFrame(animate);

            } else if (tl.queue.length === completed) {
                window.cancelAnimationFrame(tl.reqAnimFrame);
                tl.timelineActive = false;
            }
        }
        tl.reqAnimFrame = window.requestAnimationFrame(animate);
    };

    /**
     * Stop the Timeline early
     *
     * @param {Function} cb is a callback that can used to clean things up after the Timeline has stopped
     *
     * */
    Timeline.prototype.stop = function (cb) {
        window.cancelAnimationFrame(this.reqAnimFrame);
        this.timelineActive = false;
        if (cb) {
            cb();
        } else {
            // console.warn('no cleanup was performed on the timeline');
        }
    };

    /**
     * A specialized version of `forEach` for arrays.
     *
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    Timeline.prototype.forEach = function (array, iteratee) {
        var index = -1;
        var length = array == null ? 0 : array.length;
        while (++index < length) {
            if (iteratee(array[index], index, array) === false) {
                break;
            }
        }
        return array;
    };

    window.Timeline = Timeline;

})();
