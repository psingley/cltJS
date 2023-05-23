define([
    'domReady!',
    'jquery'
], function (doc, $) {
    //checks to see if the element exists and then
    //if it has a value
    $.fn.isNullOrEmpty = function () {

        if (this.length == 0) {
            return true;
        }
        else {
			//check if this has some attributes
	        if ($(this).get(0).attributes) {
		        //check to see if the element has a value
		        if ($(this).val() == '') {
			        return true;
		        }
	        }
        }

        return false;
    };

    $.fn.hasScrollBar = function () {
    	return this.get(0).scrollHeight > this.height();
    }

    //Optional parameter includeMargin is used when calculating outer dimensions
    $.fn.getHiddenDimensions = function (includeMargin) {
        var $item = this,
            props = { position: 'absolute', visibility: 'hidden', display: 'block' },
            dim = { width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0 },
            $hiddenParents = $item.parents().andSelf().not(':visible'),
            includeMargin = (includeMargin == null) ? false : includeMargin;

        var oldProps = [];
        $hiddenParents.each(function () {
            var old = {};

            for (var name in props) {
                old[ name ] = this.style[ name ];
                this.style[ name ] = props[ name ];
            }

            oldProps.push(old);
        });

        dim.width = $item.width();
        dim.outerWidth = $item.outerWidth(includeMargin);
        dim.innerWidth = $item.innerWidth();
        dim.height = $item.height();
        dim.innerHeight = $item.innerHeight();
        dim.outerHeight = $item.outerHeight(includeMargin);

        $hiddenParents.each(function (i) {
            var old = oldProps[i];
            for (var name in props) {
                this.style[ name ] = old[ name ];
            }
        });

        return dim;
    };

    $.fn.prettySelect = function (options) {
        var opts = $.extend({}, $.fn.prettySelect.defaults, options);

        this.each(function () {
            //if it already has a pretty select set up skip this drop down
            if ($(this).hasClass('old_select') || $(this).hasClass('chosen-select') ) {
                return;
            }

            var $selectBox = $(this);
            var $options = $selectBox.find('option');
            var $newBox = $('<div>', {"class": opts.containerClass});
            var $current = $('<div>', {"class": "current"}).appendTo($newBox);
            var $currentAnchor = $('<a>', {href: "#"}).appendTo($current);
            var $list = $('<ul>').appendTo($newBox);
            var $item = $('<li>');
            var $link = $('<a>', {href: "#"});
            var $body = $('body');
            var disabledCheck;


            var flipDropDown = function(){
                var listDistFromTop = $newBox.offset().top; //the list's distance from the top of the page
                var distDownPage = $(window).height() + $(window).scrollTop(); //how far down the page we are
                var space = distDownPage - listDistFromTop; //amount of space between the list and the bottom of the viewport
                var listHeight = $list.height();
                var toggle = space <= listHeight;
                $list.toggleClass("flipDropDown",toggle);
                $list.css("z-index",'20');
            };


            var disabled = function () {
                if (!$selectBox.is(':disabled')) {
                    $newBox.removeClass('disabled');
                    window.clearInterval(disabledCheck);
                    disabledCheck = window.setInterval(enabled, 1000);
                }
            };

            var enabled = function () {
                if ($selectBox.is(':disabled')) {
                    $newBox.addClass('disabled');
                    window.clearInterval(disabledCheck);
                    disabledCheck = window.setInterval(disabled, 1000);
                }
            };

            var openList = function () {
                flipDropDown();
                if (!$newBox.hasClass('open')) {
                    $newBox.addClass('open more');
                    $list.slideDown(opts.openSpeed, function () {
                        $body.on('click.selectBox', function (e) {
                            $newBox.removeClass('open');
                            $list.slideUp(opts.openSpeed);
                            $body.off('click.selectBox');
                        });
                    });
                }
            };

            var closeList = function () {
                if ($newBox.hasClass('open')) {
                    $list.slideUp(opts.openSpeed, function () {
                        $newBox.removeClass('open');
                        $body.off('click.selectBox');
                    });
                }
            };

            var loadOptions = function () {
                $list.empty();
                $options = $selectBox.find('option');
                var $selected = $options.filter(':selected');
                $newBox.addClass($selectBox.attr('class')).removeClass('old_select');
                $currentAnchor.text($selected.text());
                $list.find('li').eq($selected.index()).addClass('selected');
                $selectBox.addClass('old_select');

                $options.each(function () {
                    var $this = $(this);
                    //clone the item and then add text/attributes
                    var newListItem = $item.clone();
                    newListItem
                        .text($this.text())
                        .attr('data-value', $this.val())

                    //loop through all of the attributes in the option and append
                    //it to the li element
                    $.each(this.attributes, function () {
                        newListItem.attr(this.name, this.value);
                    });

                    $list.append(newListItem);
                });

                $newBox.insertAfter($selectBox);
                $list.css({position: 'relative'});
                $newBox.attr('style', '');
                $newBox.width($newBox.getHiddenDimensions(false));
                $list.css({ position: 'absolute' }).hide();

                disabledCheck = window.setInterval(enabled, 1000);
            };

            $list.on('click', 'li', function (e) {
                e.preventDefault();
                var $this = $(this);
                $currentAnchor.text($this.text());
                $selectBox.val($this.data('value'))
                    .trigger('change');
                $list.find('li').removeClass('selected');
                $this.addClass('selected');
            });

            $newBox.on('click', function (e) {
                if (!$newBox.hasClass('disabled')) {
                    if ($newBox.hasClass('open')) {
                        closeList();
                    } else {
                        openList();
                    }
                }
            });

            $currentAnchor.on('click', function (e) {
                e.preventDefault();
            });

            $currentAnchor.on('focus', function (e) {
                if (e.relatedTarget != null)
                {
                e.preventDefault;
                var currentIndex = 0,
                    $items = $list.find('li');
                if (!$newBox.hasClass('disabled')) {
                    openList();
                    $currentAnchor.on('blur.selectBox', function () {
                        if ($newBox.hasClass('open')) {
                            closeList();
                        }
                        $currentAnchor.off('blur.selectBox');
                        $body.off('keydown.selectBox');
                    });

                    $items.removeClass('highlight').eq(currentIndex).addClass('highlight');
                    $body.on('keydown.selectBox', function (e) {
                        if (e.keyCode == 40) {
                            e.preventDefault();
                            if (!$newBox.hasClass('open')) {
                                openList();
                            } else {
                                currentIndex += 1;
                                if (currentIndex >= $items.length) {
                                    currentIndex = $items.length - 1;
                                }
                            }
                            $items.removeClass('highlight').eq(currentIndex).addClass('highlight');
                        } else if (e.keyCode == 38) {
                            e.preventDefault();
                            currentIndex -= 1;
                            if (currentIndex < 0) {
                                currentIndex = 0;
                            }
                            $items.removeClass('highlight').eq(currentIndex).addClass('highlight');
                        } else if (e.keyCode == 13) {
                            e.preventDefault();
                            closeList();
                            $items.removeClass('highlight');
                            $currentAnchor.text($items.eq(currentIndex).text());
                            $selectBox
                                .val($items.eq(currentIndex)
                                    .data('value'))
                                .trigger('change');
                            $items.removeClass('selected');
                            $items.eq(currentIndex).addClass('selected');
                        }
                    });
                }
                }
            });

            $selectBox.on('change',function (e) {
                var $currentOption = $options.filter(':selected');
                $currentAnchor.text($currentOption.text());
            }).on('update', function (e) {
                    console.log("update");
                    loadOptions();
                });

            loadOptions();
        });
    };

    $.fn.prettySelect.defaults = {
        containerClass: 'new_select',
        openSpeed: 'fast',
        closeSpeed: 'fast'
    };
});