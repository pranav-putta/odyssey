/*
	Linear by Pixelarity
	pixelarity.com | hello@pixelarity.com
	License: pixelarity.com/license
*/
(function($) {

	var	$window = $(window),
		$body = $('body'),
		$banner = $('#banner'),
		$header = $('#header');

	// Breakpoints.
		breakpoints({
			default:   ['1681px',   null       ],
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Menu.
		$('#menu')
			.append('<a href="#menu" class="close"></a>')
			.appendTo($body)
			.panel({
				target: $body,
				visibleClass: 'is-menu-visible',
				delay: 500,
				hideOnClick: true,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				side: 'right'
			});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() { $window.trigger('scroll'); });

			$banner.scrollex({
				bottom:		$header.outerHeight(),
				terminate:	function() { $header.removeClass('alt'); },
				enter:		function() { $header.addClass('alt'); $header.removeClass('reveal'); },
				leave:		function() { $header.removeClass('alt'); $header.addClass('reveal'); }
			});

		}

	// Image sections.
		$('#main > .inner > section > .image').each(function() {

			var $image = $(this),
				$img = $image.children('img').first(),
				$this = $image.parent();

			// Background.

				// Hide img.
					$img.hide();

				// Apply background to image.
					$image.css('background-image', 'url("' + $img.attr('src') + '")');

			// Scroll transitions.
				if (browser.canUse('transition'))
					$this.scrollex({
						mode:		'middle',
						delay:		0,
						initialize:	function() { $this.addClass('inactive'); },
						terminate:	function() { $this.removeClass('inactive'); },
						enter:		function() { $this.removeClass('inactive'); },
						//leave:		function() { $this.addClass('inactive'); }
					});

		});

	// Events.
		var resizeTimeout, resizeScrollTimeout;

		$window
			.on('resize', function() {

				// Disable animations/transitions.
					$body.addClass('is-resizing');

				// Clear existing delay.
					clearTimeout(resizeTimeout);

				// Delay.
					resizeTimeout = setTimeout(function() {

						// Update scrolly links.
							$('a[href^="#"]').scrolly({
								speed: 1000,
								offset: $header.outerHeight() - 1
							});

						// Re-enable animations/transitions.
							setTimeout(function() {
								$body.removeClass('is-resizing');
								$window.trigger('scroll');
							}, 0);

					}, 100);

			})
			.on('load', function() {
				$window.trigger('resize');
			});

})(jQuery);