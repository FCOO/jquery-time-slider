/****************************************************************************
	jquery-base-slider, Description from README.md

	(c) 2015, Niels Holt

	https://github.com/NielsHolt/jquery-base-slider
	https://github.com/NielsHolt

USING
	dreamerslab/jquery.actual - https://github.com/dreamerslab/jquery.actual
	autoclickWhilePressed from https://github.com/silviubogan/jquery-autoclick-while-pressed - Auto-repeat the buttons on-click-function


****************************************************************************/
;(function ($, window, document, undefined) {
	"use strict";

	//Original irs.slider - with modifications
	
	var plugin_count = 0;

  // Template
	var base_html =
		'<span class="bs">' + 
			'<span class="line" tabindex="-1">'+
				'<span class="line-left"></span>'+
			'</span>' +
			'<span class="marker-min">0</span>'+
			'<span class="marker-max">1</span>' +
			'<span class="marker-from">0</span>'+
			'<span class="marker-to">0</span>'+
			'<span class="marker-single">0</span>' +
		'</span>' +
		'<span class="grid"></span>' + 
		'<span class="bar"></span>';

	var single_html =
		'<span class="slider single"></span>';

	var double_html =
		'<span class="slider from"></span>' +
		'<span class="slider to"></span>';

	var pin_html =
		'<span class="slider pin"></span>';

	// Core
	//var BaseSlider = function (input, options, plugin_count) {
	window.BaseSlider = function (input, options, plugin_count) {
		this.VERSION = "1.0.0";
		this.input = input;
		this.plugin_count = plugin_count;
		this.current_plugin = 0;
		this.old_from = 0;
		this.old_to = 0;
		this.raf_id = null;
		this.dragging = false;
		this.force_redraw = false;
		this.is_key = false;
		this.is_update = false;
		this.is_start = true;
		this.is_active = false;
		this.is_resize = false;
		this.is_click = false;
		this.is_repeating_click = false;

		this.$cache = {
			win: $(window),
			body: $(document.body),
			input: $(input),
			cont: null,
			rs: null,
			min: null,
			max: null,
			from: null,
			to: null,
			single: null,
			bar: null,
			line: null,
			s_single: null,
			s_pin: null,
			s_from: null,
			s_to: null,
			grid: null,
			grid_labels: [],
			buttons: { 
				from: {}, 
				to	: {} 
			}
		};

		// get config from options
		this.options = $.extend({
			type: "single",
			slider: "default",
			isInterval: (options.type == 'double'),

			pin_value: null, 

			min: 10,
			max: 100,
			from: null,
			to: null,
			step: 1,
	
			min_interval: 0,
			max_interval: 0,
	
			p_values: [],
	
			from_fixed: false,
			from_min: null,
			from_max: null,
	
			to_fixed: false,
			to_min: null,
			to_max: null,
	
			prettify: null,
			prettify_text: null,
			

			marker_frame: false,
	
			impact_line: false,
			impact_line_reverse: false,
			hide_bar_color: false,

			callback_on_dragging: true,
			callback_delay: 500,

			grid: false,
			hide_minor_ticks: false,
			major_ticks: null, // => calculated automatic
			major_ticks_offset: 0, 

			ticks_on_line: false,
			hide_min_max: true,
			hide_from_to: false,
	
			prefix: "",
			postfix: "",
			max_postfix: "",
			decorate_both: true,
			values_separator: " - ",
	
			disable: false,

			buttons_attr	: ['firstBtn', 'previousBtn', 'nowBtn', 'nextBtn', 'lastBtn'],
			buttons_delta	: [-99, -1, 0, +1, +99],
			buttons				: {from: {}, to: {} },

			gridDistances : [1, 2, 5, 10, 20, 50, 100],
			
			onStart: null,
			onChange: null,
			onFinish: null,
			onUpdate: null
		}, options);
	
		this.validate();
	
		this.options.has_pin = (this.options.slider == 'range') && (this.options.pin_value !== null);

		this.options.p_keyboard_step = 100*this.options.step / (this.options.max - this.options.min);

		this.result = {
			input: this.$cache.input,
			slider: null,
	
			min: this.options.min,
			max: this.options.max,
	
			from: this.options.from,
			from_percent: 0,
			from_value: null,
	
			to: this.options.to,
			to_percent: 0,
			to_value: null
		};
	
		this.coords = {
			// left
			x_gap: 0,
			x_pointer: 0,
	
			// width
			w_rs: 0,
			w_rs_old: 0,
			w_handle: 0,
	
			// percents
			p_gap: 0,
			p_gap_left: 0,
			p_gap_right: 0,
			p_step: 0,
			p_pointer: 0,
			p_handle: 0,
			p_single: 0,
			p_single_real: 0,
			p_from: 0,
			p_from_real: 0,
			p_to: 0,
			p_to_real: 0,
			p_bar_x: 0,
			p_bar_w: 0,
	
			// grid
			grid_gap: 0,
		};
	
		this.labels = {
			// width
			w_min: 0,
			w_max: 0,
			w_from: 0,
			w_to: 0,
			w_single: 0,
	
			// percents
			p_min: 0,
			p_max: 0,
			p_from: 0,
			p_from_left: 0,
			p_to: 0,
			p_to_left: 0,
			p_single: 0,
			p_single_left: 0
		};
	
	  this.init();

	};

	window.BaseSlider.prototype = {
		init: function (is_update) {
			this.coords.p_step = this.options.step / ((this.options.max - this.options.min) / 100);
			this.target = "base";

			this.toggleInput();
			this.append();
			this.setMinMax();
			if (is_update) {
				this.force_redraw = true;
				this.calc(true);
				this.onUpdate(); 

			} else {

				this.force_redraw = true;
				this.calc(true);
				this.onStart();
			}

			this.drawHandles(); 
		},

		//append
		append: function () {
			this.$cache.container = $('<span class="base-slider ' + this.options.slider + ' js-base-slider-' + this.plugin_count + '"></span>'); 
			this.$cache.input.before(this.$cache.container);
			
			this.$cache.input.prop("readonly", true);
			this.$cache.cont = this.$cache.input.prev();
			this.result.slider = this.$cache.cont;

			this.$cache.cont.html(base_html);
			this.$cache.bs = this.$cache.cont.find(".bs");
			this.$cache.min = this.$cache.cont.find(".marker-min");
			this.$cache.max = this.$cache.cont.find(".marker-max");
			this.$cache.from = this.$cache.cont.find(".marker-from");
			this.$cache.to = this.$cache.cont.find(".marker-to");
			this.$cache.single = this.$cache.cont.find(".marker-single");
			this.$cache.bar = this.$cache.cont.find(".bar");
			this.$cache.line = this.$cache.cont.find(".line");
			this.$cache.lineLeft = this.$cache.cont.find(".line-left");
			this.$cache.grid = this.$cache.cont.find(".grid");

			if (this.options.type === "single") {
				this.$cache.cont.append(single_html);
				this.$cache.s_single = this.$cache.cont.find(".single");
				this.$cache.from.css('visibility', 'hidden');
				this.$cache.to.css('visibility', 'hidden');
				this.$cache.lineLeft.remove();
			} else {
				//Add from and to slider
				this.$cache.cont.append(double_html);
				this.$cache.s_from = this.$cache.cont.find(".from");
				this.$cache.s_to = this.$cache.cont.find(".to");
	
				if (this.options.has_pin){
					this.$cache.cont.append(pin_html);
					this.$cache.s_pin = this.$cache.cont.find(".slider.pin"); 
				}

				//Add classs if it is a (reverse) impact-line
				if (this.options.impact_line)
					this.$cache.cont.addClass("impact-line");

				if (this.options.impact_line_reverse)
					this.$cache.cont.addClass("impact-line-reverse");
			}

			if (this.options.hide_from_to) {
				this.$cache.from.hide(); 
				this.$cache.to.hide(); 
				this.$cache.single.hide(); 
			}


			//Add class to set bar color same as line
			if (this.options.hide_bar_color)
				this.$cache.bar.addClass('hide-bar-color');
			

			//Add class to set border and stick on to- from and current-label
			if (this.options.marker_frame)
				this.$cache.container.addClass('marker-frame');

			//Adjust top-position if no marker is displayed
			if (this.options.hide_min_max && this.options.hide_from_to)
				this.$cache.container.addClass("no-marker");

			//Adjust top-position of first grid if tick must be on the slider
			if (this.options.ticks_on_line)
				this.$cache.container.addClass("ticks-on-line");


			//Speciel case: Adjust top-position of line etc. if it is a range-slider with no marker and with a pin!
			if (this.options.has_pin)
				this.$cache.container.addClass("has-pin");

			//Append buttons
			function getButton( id ){ return $.type( id ) === 'string' ? $('#' +  id ) : id; }
			this.options.buttons.from = this.options.buttons.from || {};
			this.options.buttons.to		= this.options.buttons.to || {};
			for (var i=0; i<this.options.buttons_attr.length; i++ ){
				var attrName = this.options.buttons_attr[i];
				this.$cache.buttons.from[ attrName ]	= getButton( this.options.buttons.from[ attrName ] );
				this.$cache.buttons.to	[ attrName ]	= getButton( this.options.buttons.to	[ attrName ] );
			}
			
			//Append grid(s)
			this.currentGridContainer = null;
			if (this.options.grid){
				this.appendGrid();
			} else { 
				this.$cache.grid.remove();
			}

			if (this.options.disable) {
				this.$cache.cont.addClass("disabled");
				this.$cache.input.prop('disabled', true); 
			} else 
				if (this.options.read_only){
					this.$cache.cont.addClass("read-only");
					this.$cache.input.prop('disabled', true); 
				} else {
					this.$cache.cont.addClass("active");
					this.$cache.input.prop('disabled', false);
					this.bindEvents();
				}
		},


		//remove
		remove: function () {
			this.$cache.cont.remove();
			this.$cache.cont = null;

			this.$cache.line.off("keydown.irs_" + this.plugin_count);

			this.$cache.body.off("touchmove.irs_" + this.plugin_count);
			this.$cache.body.off("mousemove.irs_" + this.plugin_count);

			this.$cache.win.off("touchend.irs_" + this.plugin_count);
			this.$cache.win.off("mouseup.irs_" + this.plugin_count);

			//Unbind click on buttons
			var id, i, attrName, $btn;
			for (id in this.$cache.buttons)
				for (i=0; i<this.options.buttons_attr.length; i++ ){
					attrName = this.options.buttons_attr[i];
					$btn = this.$cache.buttons[id][attrName];
					if ($btn)
					  $btn.off( 
							"mousedown.irs_" + this.plugin_count +
							" mouseup.irs_" + this.plugin_count +
							" mouseleave.irs_" + this.plugin_count +
							" click.irs_" + this.plugin_count
						);
				}


			this.$cache.grid_labels = [];

			window.cancelAnimationFrame(this.raf_id);
		},

		//bindEvents
		bindEvents: function () {
			this.$cache.body.on("touchmove.irs_" + this.plugin_count, this.pointerMove.bind(this));
			this.$cache.body.on("mousemove.irs_" + this.plugin_count, this.pointerMove.bind(this));

			this.$cache.win.on("touchend.irs_" + this.plugin_count, this.pointerUp.bind(this));
			this.$cache.win.on("mouseup.irs_" + this.plugin_count, this.pointerUp.bind(this));

			this.$cache.line.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
			this.$cache.line.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));

			this.$cache.bar.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
			this.$cache.bar.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));

			if (this.options.type === "single") {
				this.$cache.s_single.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "single"));
				this.$cache.s_single.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "single"));
			} else {
				this.$cache.s_from.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "from"));
				this.$cache.s_to.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "to"));
				this.$cache.s_from.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "from"));
				this.$cache.s_to.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "to"));
			}

			this.$cache.line.on("keydown.irs_" + this.plugin_count, this.key.bind(this, "keyboard"));

			//Bind click on buttons
			var id, i, attrName, delta, $btn;
			for (id in this.$cache.buttons)
				for (i=0; i<this.options.buttons_attr.length; i++ ){
					attrName = this.options.buttons_attr[i];
					delta = this.options.buttons_delta[i];

					$btn = this.$cache.buttons[id][attrName];
					
					if ($btn){
						$btn
							.on("mousedown.irs_" + this.plugin_count,		this.startRepeatingClick.bind(this)				)
							.on("mouseup.irs_" + this.plugin_count,			this.endRepeatingClick.bind(this)					) 
							.on("mouseleave.irs_" + this.plugin_count,	this.endRepeatingClick.bind(this, true)		) 
							.on("click.irs_" + this.plugin_count,				this.buttonClick.bind(this, {id:id, delta:delta}) ); 

						if ( $btn.autoclickWhilePressed && (Math.abs(delta) == 1) && (!$btn.data('auto-click-when-pressed-added')) )
							$btn.data('auto-click-when-pressed-added', true);
							$btn.autoclickWhilePressed();
					}
				}
		},


		//adjustResult - adjust this.resut before onStart,..,callback is called
		adjustResult: function(){
			//Nothing here but desencing class can overwrite it
		}, 

		//onFunc
		onFunc: function(func){	
			this.adjustResult();
			if (func && typeof func === "function") 
				func.call(this, this.result); 

		},

		//onCallback
		onCallback: function(){ 
			this.lastResult = this.lastResult  || {};
			if ( this.options.callback && typeof this.options.callback === "function" && ( this.result.min != this.lastResult.min || this.result.max != this.lastResult.max || this.result.from != this.lastResult.from || this.result.to != this.lastResult.to ) ) {
				this.adjustResult();
				if (this.options.context)
					this.options.callback.call( this.options.context, this.result );
				else
					this.options.callback( this.result );
				this.lastResult = $.extend({}, this.result);
			}
		},			
			
		//onStart
		onStart: function(){ 
			this.onCallback();
			this.onFunc(this.options.onStart);
		},						

		//onChange
		onChange: function(){ 
			//If it is dragging and no callback_on_dragging => set timeout to call callback after XX ms if the slider hasn't moved
			if (this.dragging && !this.options.callback_on_dragging && this.options.callback_delay){
				if (this.delayTimeout)
					window.clearTimeout(this.delayTimeout);
				var _this = this;
				this.delayTimeout = window.setTimeout( function () {
															_this.onCallback();
														}, this.options.callback_delay);
			}


			if ( this.options.callback_on_dragging || (!this.is_repeating_click && !this.dragging) )
				this.onCallback();
			this.onFunc(this.options.onChange);
		},		 

		//onFinish
		onFinish: function(){ 
			if (this.delayTimeout)
				window.clearTimeout(this.delayTimeout);

			if (!this.is_repeating_click)
				this.onCallback();
			this.onFunc(this.options.onFinish);
		},		 

		//onUpdate
		onUpdate: function(){ 
			this.onFunc(this.options.onUpdate);
		},		 

		//buttonClick
		buttonClick: function (options){ 
			var newValue = options.id == 'from' ? this.result.from : this.result.to;
			switch (options.delta){
			  case	 0: newValue = 0; break;
				case -99: newValue = this.options.min; break;
				case  99: newValue = this.options.max; break;
				case  +1: newValue = newValue + 1; break;				
				case  -1: newValue = newValue - 1; break;				
			}
			if (options.id == 'from')
				this.setFromValue( newValue );
			else
				this.setToValue( newValue );
		},

		//startRepeatingClick
		startRepeatingClick: function () {
			this.is_repeating_click = true;
		},

		//endRepeatingClick
		endRepeatingClick: function (callback) { 
			this.is_repeating_click = false;
			if (callback)
				this.onCallback();
		},

		//textClick - click on label 
		textClick: function( e ){ 
			var value = $(e.target).data('base-slider-value');
			if (!this.options.isInterval){
				this.setValue( value );
				return;
			}

			if (this.result.from >= value)
			  this.setFromValue (value );
			else
				if (this.result.to <= value)
				  this.setToValue (value );
				else 
					if (Math.abs( this.result.from - value ) >= Math.abs( this.result.to - value ))
						this.setToValue( value );
					else
						this.setFromValue( value );
		}, 

		
		//pointerMove
		pointerMove: function (e) {
			if (!this.dragging) {
				return;
			}

			var x = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX;
			this.coords.x_pointer = x - this.coords.x_gap;

			this.calc();
			this.drawHandles(); 

		},

		//pointerUp
		pointerUp: function (e) {
			if (this.current_plugin !== this.plugin_count) {
				return;
			}

			if (this.is_active) {
				this.is_active = false;
			} else {
				return;
			}

			if ($.contains(this.$cache.cont[0], e.target) || this.dragging) {
				this.onFinish();
			}

			this.$cache.cont.find(".state_hover").removeClass("state_hover");

			this.force_redraw = true;
			this.dragging = false;
		},

		//pointerDown
		pointerDown: function (target, e) {
			e.preventDefault();
			var x = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX;
			if (e.button === 2) {
				return;
			}
			this.current_plugin = this.plugin_count;
			this.target = target;
			this.is_active = true;
			this.dragging = true;

			this.coords.x_gap = this.$cache.bs.offset().left;
			this.coords.x_pointer = x - this.coords.x_gap;

			this.calcPointer();

			switch (target) {
				case "single":
					this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_single);
					break;
				case "from":
					this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_from);
					this.$cache.s_from.addClass("state_hover");
					this.$cache.s_from.addClass("type_last");
					this.$cache.s_to.removeClass("type_last");
					break;
				case "to":
					this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_to);
					this.$cache.s_to.addClass("state_hover");
					this.$cache.s_to.addClass("type_last");
					this.$cache.s_from.removeClass("type_last");
					break;
				case "both":
					this.coords.p_gap_left = this.toFixed(this.coords.p_pointer - this.coords.p_from);
					this.coords.p_gap_right = this.toFixed(this.coords.p_to - this.coords.p_pointer);
					this.$cache.s_to.removeClass("type_last");
					this.$cache.s_from.removeClass("type_last");
					break;
			}

			this.$cache.line.trigger("focus");
		},

		//pointerClick
		pointerClick: function (target, e) {
			e.preventDefault();
			var x = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX;
			if (e.button === 2) {
				return;
			}
			this.current_plugin = this.plugin_count;
			this.target = target;
			this.is_click = true;
			this.coords.x_gap = this.$cache.bs.offset().left;
			this.coords.x_pointer = +(x - this.coords.x_gap).toFixed();

			this.force_redraw = true;
			this.calc(true);
			this.drawHandles(); 

			this.$cache.line.trigger("focus");
		},

		//key
		key: function (target, e) {
			if (this.current_plugin !== this.plugin_count || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
				return;
			}
			switch (e.which) {
				case 83: // W
				case 65: // A
				case 40: // DOWN
				case 37: // LEFT
					e.preventDefault();
					this.moveByKey(false);
					break;
				case 87: // S
				case 68: // D
				case 38: // UP
				case 39: // RIGHT
					e.preventDefault();
					this.moveByKey(true);
					break;
			}
			return true;
		},

		// Move by key beta
		// TODO: refactor than have plenty of time
		moveByKey: function (right) { 
			var p = this.coords.p_pointer;
			if (right) {
				p += this.options.p_keyboard_step;
			} else {
				p -= this.options.p_keyboard_step;
			}
			this.coords.x_pointer = this.toFixed(this.coords.w_rs / 100 * p);
			this.is_key = true;
			this.calc();

			this.force_redraw = true;
			this.drawHandles(); 
	
		},

		//setMinMax
		setMinMax: function () {
			if (!this.options) {
				return;
			}
			if (this.options.hide_min_max) {
				this.$cache.min.hide(); 
				this.$cache.max.hide(); 
				return;
			}
			this.$cache.min.html(this.decorate(this._prettify(this.options.min), this.options.min));
			this.$cache.max.html(this.decorate(this._prettify(this.options.max), this.options.max));

			this.labels.w_min = this.$cache.min.outerWidth(false);
			this.labels.w_max = this.$cache.max.outerWidth(false);
		},


		// =============================================================================================================
		// Calculations
		//setValue
		setValue: function( value ) { this.setFromValue( value ); },

		//setFromValue
		setFromValue: function( value ) { 
			value = Math.min( this.options.max, value );
			value = Math.max( this.options.min, value );
			if (this.options.isInterval)
			  value = Math.min( value, this.result.to );

			this.old_from = this.result.from;
			this.result.from = value;

			this.target = "base";
			this.is_key = true;
			this.calc();
			this.force_redraw = true;
			this.drawHandles(); 
			this.onCallback();
		},

		//setToValue
		setToValue: function( value ) {
			value = Math.min( this.options.max, value );
			value = Math.max( value, this.result.from );

			this.old_to = this.result.to;
			this.result.to = value;

			this.target = "base";
			this.is_key = true;
			this.calc();
			this.force_redraw = true;
			this.drawHandles(); 
			this.onCallback();
		},

		setPin: function( value, color ) {
			if (this.options.slider != 'range'){
			  return;	
			}
			value = Math.min( this.options.max, value );
			value = Math.max( this.options.min, value );

			this.options.pin_value = value;

			this.target = "base";
			this.is_key = true;
			this.calc();
			this.force_redraw = true;
			this.drawHandles(); 

			this.$cache.s_pin.css('color', color || 'black');				
		},

		//calc
		calc: function (update) { 
			if (!this.options) {
				return;
			}
			if (update) { 
				this.coords.w_rs = this.$cache.bs.outerWidth(false);
				if (this.options.type === "single") {
					this.coords.w_handle = this.$cache.s_single.outerWidth(false);
				} else {
					this.coords.w_handle = this.$cache.s_from.outerWidth(false);
				}
			}
			if (!this.coords.w_rs) {
				return;
			}
			this.calcPointer();
			this.coords.p_handle = this.toFixed(this.coords.w_handle / this.coords.w_rs * 100);
			var real_width = 100 - this.coords.p_handle,
			real_x = this.toFixed(this.coords.p_pointer - this.coords.p_gap);

			if (this.target === "click") {
				real_x = this.toFixed(this.coords.p_pointer - (this.coords.p_handle / 2));
				this.target = this.chooseHandle(real_x);
			}

			if (real_x < 0) {
				real_x = 0;
			} else if (real_x > real_width) {
				real_x = real_width;
			}

			switch (this.target) {
				case "base":
					var w = (this.options.max - this.options.min) / 100,
					f = (this.result.from - this.options.min) / w,
					t = (this.result.to - this.options.min) / w;

					this.coords.p_single_real = this.toFixed(f);
					this.coords.p_from_real = this.toFixed(f);
					this.coords.p_to_real = this.toFixed(t);

					this.coords.p_single_real = this.checkDiapason(this.coords.p_single_real, this.options.from_min, this.options.from_max);
					this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
					this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);

					this.coords.p_single = this.toFixed(f - (this.coords.p_handle / 100 * f));
					this.coords.p_from = this.toFixed(f - (this.coords.p_handle / 100 * f));
					this.coords.p_to = this.toFixed(t - (this.coords.p_handle / 100 * t));

					if (this.options.has_pin){ 
						var r = (this.options.pin_value - this.options.min) / w,
								p_pin_value_real = this.checkDiapason(this.toFixed(r), this.options.from_min, this.options.from_max);
						this.coords.p_pin_value = this.toFixed(p_pin_value_real / 100 * real_width);
					}

					this.target = null;
					break;

				case "single":
					if (this.options.from_fixed) {
						break;
					}

					this.coords.p_single_real = this.calcWithStep(real_x / real_width * 100);
					this.coords.p_single_real = this.checkDiapason(this.coords.p_single_real, this.options.from_min, this.options.from_max);
					this.coords.p_single = this.toFixed(this.coords.p_single_real / 100 * real_width);
					break;

				case "from":
					if (this.options.from_fixed) {
						break;
					}
					this.coords.p_from_real = this.calcWithStep(real_x / real_width * 100);
					if (this.coords.p_from_real > this.coords.p_to_real) {
						this.coords.p_from_real = this.coords.p_to_real;
					}
					this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
					this.coords.p_from_real = this.checkMinInterval(this.coords.p_from_real, this.coords.p_to_real, "from");
					this.coords.p_from_real = this.checkMaxInterval(this.coords.p_from_real, this.coords.p_to_real, "from");
					this.coords.p_from = this.toFixed(this.coords.p_from_real / 100 * real_width);

					break;

				case "to":
					if (this.options.to_fixed) {
						break;
					}

					this.coords.p_to_real = this.calcWithStep(real_x / real_width * 100);
					if (this.coords.p_to_real < this.coords.p_from_real) {
						this.coords.p_to_real = this.coords.p_from_real;
					}
					this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
					this.coords.p_to_real = this.checkMinInterval(this.coords.p_to_real, this.coords.p_from_real, "to");
					this.coords.p_to_real = this.checkMaxInterval(this.coords.p_to_real, this.coords.p_from_real, "to");
					this.coords.p_to = this.toFixed(this.coords.p_to_real / 100 * real_width);
					break;

				case "both":
					if (this.options.from_fixed || this.options.to_fixed) {
						break;
					}

					real_x = this.toFixed(real_x + (this.coords.p_handle * 0.1));

					this.coords.p_from_real = this.calcWithStep((real_x - this.coords.p_gap_left) / real_width * 100);
					this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
					this.coords.p_from_real = this.checkMinInterval(this.coords.p_from_real, this.coords.p_to_real, "from");
					this.coords.p_from = this.toFixed(this.coords.p_from_real / 100 * real_width);

					this.coords.p_to_real = this.calcWithStep((real_x + this.coords.p_gap_right) / real_width * 100);
					this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
					this.coords.p_to_real = this.checkMinInterval(this.coords.p_to_real, this.coords.p_from_real, "to");
					this.coords.p_to = this.toFixed(this.coords.p_to_real / 100 * real_width);

					break;
			}

			if (this.options.type === "single") {
				this.coords.p_bar_x = 0;
				this.coords.p_bar_w = this.coords.p_single + (this.coords.p_handle / 2);

				this.result.from_percent = this.coords.p_single_real;
				this.result.from = this.calcReal(this.coords.p_single_real);
			} else {
				this.coords.p_bar_x = this.toFixed(this.coords.p_from + (this.coords.p_handle / 2));
				this.coords.p_bar_w = this.toFixed(this.coords.p_to - this.coords.p_from);

				this.result.from_percent = this.coords.p_from_real;
				this.result.from = this.calcReal(this.coords.p_from_real);
				this.result.to_percent = this.coords.p_to_real;
				this.result.to = this.calcReal(this.coords.p_to_real);
			}

			this.calcMinMax();
			this.calcLabels();
		},

		//calcPointer
		calcPointer: function () {
			if (!this.coords.w_rs) {
				this.coords.p_pointer = 0;
				return;
			}

			if (this.coords.x_pointer < 0 || isNaN(this.coords.x_pointer)  ) {
				this.coords.x_pointer = 0;
			} else if (this.coords.x_pointer > this.coords.w_rs) {
				this.coords.x_pointer = this.coords.w_rs;
			}

			this.coords.p_pointer = this.toFixed(this.coords.x_pointer / this.coords.w_rs * 100);
		},

		//chooseHandle
		chooseHandle: function (real_x) {
			if (this.options.type === "single") {
				return "single";
			} else {
				var m_point = this.coords.p_from_real + ((this.coords.p_to_real - this.coords.p_from_real) / 2);
				if (real_x >= m_point) {
					return "to";
				} else {
					return "from";
				}
			}
		},

		//calcMinMax
		calcMinMax: function () {
			if (!this.coords.w_rs) {
				return;
			}

			this.labels.p_min = this.labels.w_min / this.coords.w_rs * 100;
			this.labels.p_max = this.labels.w_max / this.coords.w_rs * 100;
		},

		//calcLabels
		calcLabels: function () {
			if (!this.coords.w_rs || this.options.hide_from_to) {
				return;
			}

			if (this.options.type === "single") {
				this.labels.w_single = this.$cache.single.outerWidth(false);
				this.labels.p_single = this.labels.w_single / this.coords.w_rs * 100;
				this.labels.p_single_left = this.coords.p_single + (this.coords.p_handle / 2) - (this.labels.p_single / 2);
				this.labels.p_single_left = this.checkEdges(this.labels.p_single_left, this.labels.p_single);

			} else {

				this.labels.w_from = this.$cache.from.outerWidth(false);
				this.labels.p_from = this.labels.w_from / this.coords.w_rs * 100;
				this.labels.p_from_left = this.coords.p_from + (this.coords.p_handle / 2) - (this.labels.p_from / 2);
				this.labels.p_from_left = this.toFixed(this.labels.p_from_left);
				this.labels.p_from_left = this.checkEdges(this.labels.p_from_left, this.labels.p_from);

				this.labels.w_to = this.$cache.to.outerWidth(false);
				this.labels.p_to = this.labels.w_to / this.coords.w_rs * 100;
				this.labels.p_to_left = this.coords.p_to + (this.coords.p_handle / 2) - (this.labels.p_to / 2);
				this.labels.p_to_left = this.toFixed(this.labels.p_to_left);
				this.labels.p_to_left = this.checkEdges(this.labels.p_to_left, this.labels.p_to);

				this.labels.w_single = this.$cache.single.outerWidth(false);
				this.labels.p_single = this.labels.w_single / this.coords.w_rs * 100;
				this.labels.p_single_left = ((this.labels.p_from_left + this.labels.p_to_left + this.labels.p_to) / 2) - (this.labels.p_single / 2);
				this.labels.p_single_left = this.toFixed(this.labels.p_single_left);
				this.labels.p_single_left = this.checkEdges(this.labels.p_single_left, this.labels.p_single);

			}
		},

		// =============================================================================================================
		// Drawings 

		//drawHandles
		drawHandles: function () { 
			this.coords.w_rs = this.$cache.bs.outerWidth(false);

			if (!this.coords.w_rs) {
				return;
			}
			if (this.coords.w_rs !== this.coords.w_rs_old) { 
				this.target = "base";
				this.is_resize = true;
			}

			if (this.coords.w_rs !== this.coords.w_rs_old || this.force_redraw) {
				this.setMinMax();
				this.calc(true);
				this.drawLabels();
				if (this.options.grid) {
					this.calcGridMargin();
				}
				this.force_redraw = true;
				this.coords.w_rs_old = this.coords.w_rs;
			}

			if (!this.coords.w_rs) {
				return;
			}

			if (!this.dragging && !this.force_redraw && !this.is_key) {
				return;
			}

			if (this.old_from !== this.result.from || this.old_to !== this.result.to || this.force_redraw || this.is_key) {

				this.drawLabels();

				this.$cache.bar.css('left', this.coords.p_bar_x + "%"); 
				this.$cache.bar.css('width', this.coords.p_bar_w + "%"); 

				if (this.options.type === "single") {
					this.$cache.s_single.css('left', this.coords.p_single + "%");		
					this.$cache.single.css('left', this.labels.p_single_left + "%"); 

					this.$cache.input.prop("value", this.result.from);
					this.$cache.input.data("from", this.result.from);

				} else {
					this.$cache.s_from.css('left', this.coords.p_from + "%"); 
					this.$cache.s_to.css('left', this.coords.p_to + "%"); 

					if (this.options.has_pin){
						this.$cache.s_pin.css('left', this.coords.p_pin_value + "%");		
					}

					if (this.$cache.lineLeft){
						this.$cache.lineLeft.css({left: 0, width: this.coords.p_bar_x + "%"});
					}
	 
					if (this.old_from !== this.result.from || this.force_redraw) {
						this.$cache.from.css('left', this.labels.p_from_left + "%"); 
					}
					if (this.old_to !== this.result.to || this.force_redraw) {
						this.$cache.to.css('left', this.labels.p_to_left + "%"); 
					}

					this.$cache.single.css('left', this.labels.p_single_left + "%"); 
					this.$cache.input.prop("value", this.result.from + ";" + this.result.to);
					this.$cache.input.data("from", this.result.from);
					this.$cache.input.data("to", this.result.to);
				}

				if ((this.old_from !== this.result.from || this.old_to !== this.result.to) && !this.is_start) {
					this.$cache.input.trigger("change");
				}

				this.old_from = this.result.from;
				this.old_to = this.result.to;

				if (!this.is_resize && !this.is_update && !this.is_start) {
					this.onChange();
				}

				if (this.is_key || this.is_click) {
					this.onFinish();
				}

				this.is_update = false;
				this.is_resize = false;
			}

			this.is_start = false;
			this.is_key = false;
			this.is_click = false;
			this.force_redraw = false;
		},

		//drawLabels
		drawLabels: function () { 
			if (!this.options) {
				return;
			}

			var text_single,
					text_from,
					text_to;

			if (this.options.hide_from_to) {
				return;
			}

			if (this.options.type === "single") {

				text_single = this.decorate(this._prettify(this.result.from), this.result.from);
				this.$cache.single.html(text_single);

				this.calcLabels();

				if (this.labels.p_single_left < this.labels.p_min + 1) {
					this.$cache.min.css('visibility', 'hidden'); 
				} else {
					this.$cache.min.css('visibility', 'visible'); //[0].style.visibility = "visible";
				}

				if (this.labels.p_single_left + this.labels.p_single > 100 - this.labels.p_max - 1) {
					this.$cache.max.css('visibility', 'hidden'); 
				} else {
					this.$cache.max.css('visibility', 'visible'); 
				}

		 } else {

				if (this.options.decorate_both) {
					text_single = this.decorate(this._prettify(this.result.from));
					text_single += this.options.values_separator;
					text_single += this.decorate(this._prettify(this.result.to));
				} else {
					text_single = this.decorate(this._prettify(this.result.from) + this.options.values_separator + this._prettify(this.result.to), this.result.from);
				}
				text_from = this.decorate(this._prettify(this.result.from), this.result.from);
				text_to = this.decorate(this._prettify(this.result.to), this.result.to);

				this.$cache.single.html(text_single);
				this.$cache.from.html(text_from);
				this.$cache.to.html(text_to);

				this.calcLabels();

				var min = Math.min(this.labels.p_single_left, this.labels.p_from_left),
				single_left = this.labels.p_single_left + this.labels.p_single,
				to_left = this.labels.p_to_left + this.labels.p_to,
				max = Math.max(single_left, to_left);

				if (this.labels.p_from_left + this.labels.p_from >= this.labels.p_to_left) {
					this.$cache.from.css('visibility', 'hidden'); 
					this.$cache.to.css('visibility', 'hidden'); 
					this.$cache.single.css('visibility', 'visible'); 

					if (this.result.from === this.result.to) {
						this.$cache.from.css('visibility', 'visible'); 
						this.$cache.single.css('visibility', 'hidden'); 
						max = to_left;
					} else {
						this.$cache.from.css('visibility', 'hidden'); 
						this.$cache.single.css('visibility', 'visible'); 
						max = Math.max(single_left, to_left);
					}
				} else {
					this.$cache.from.css('visibility', 'visible'); 
					this.$cache.to.css('visibility', 'visible'); 
					this.$cache.single.css('visibility', 'hidden'); 
				}

				if (min < this.labels.p_min + 1) {
					this.$cache.min.css('visibility', 'hidden'); 
				} else {
					this.$cache.min.css('visibility', 'visible'); 
				}

				if (max > 100 - this.labels.p_max - 1) {
					this.$cache.max.css('visibility', 'hidden'); 
				} else {
					this.$cache.max.css('visibility', 'visible'); 
				}

			}
		}, //end of drawLabels


		// =============================================================================================================
		// Service methods

		//toggleInput
		toggleInput: function () {
			this.$cache.input.toggleClass("hidden-input");
		},

		//calcPercent
		calcPercent: function (num) {
			var w = (this.options.max - this.options.min) / 100,
			percent = (num - this.options.min) / w;

			return this.toFixed(percent);
		},

		//calcReal
		calcReal: function (percent) {
			var min = this.options.min,
			max = this.options.max,
			abs = 0;

			if (min < 0) {
				abs = Math.abs(min);
				min = min + abs;
				max = max + abs;
			}

			var number = ((max - min) / 100 * percent) + min,
			string = this.options.step.toString().split(".")[1];

			if (string) {
				number = +number.toFixed(string.length);
			} else {
				number = number / this.options.step;
				number = number * this.options.step;
				number = +number.toFixed(0);
			}

			if (abs) {
				number -= abs;
			}

			if (number < this.options.min) {
				number = this.options.min;
			} else if (number > this.options.max) {
				number = this.options.max;
			}

			if (string) {
				return +number.toFixed(string.length);
			} else {
				return this.toFixed(number);
			}
		},

		//calcWithStep
		calcWithStep: function (percent) {
			var rounded = Math.round(percent / this.coords.p_step) * this.coords.p_step;
			if (rounded > 100)		{ rounded = 100; }
			if (percent === 100)	{ rounded = 100; }
			return this.toFixed(rounded);
		},

		//checkMinInterval
		checkMinInterval: function (p_current, p_next, type) {
			var o = this.options,
			current,
			next;

			if (!o.min_interval) {
				return p_current;
			}

			current = this.calcReal(p_current);
			next = this.calcReal(p_next);

			if (type === "from") {
				if (next - current < o.min_interval) {
					current = next - o.min_interval;
				}
			} else {
				if (current - next < o.min_interval) {
					current = next + o.min_interval;
				}
			}
			return this.calcPercent(current);
		},

		//checkMaxInterval
		checkMaxInterval: function (p_current, p_next, type) {
			var o = this.options,
			current,
			next;

			if (!o.max_interval) {
				return p_current;
			}

			current = this.calcReal(p_current);
			next = this.calcReal(p_next);

			if (type === "from") {
				if (next - current > o.max_interval) {
					current = next - o.max_interval;
				}
			} else {
				if (current - next > o.max_interval) {
					current = next + o.max_interval;
				}
			}

			return this.calcPercent(current);
		},

		//checkDiapason
		checkDiapason: function (p_num, min, max) {
			var num = this.calcReal(p_num),
			o = this.options;

			if (!min || typeof min !== "number") { min = o.min; }
			if (!max || typeof max !== "number") { max = o.max; }
			if (num < min) { num = min; }
			if (num > max) { num = max; }

			return this.calcPercent(num);
		},

		//toFixed
		toFixed: function (num) {
			num = num.toFixed(5);
			return +num;
		},

		//_prettify
		_prettify: function (num) {
			return (this.options.prettify && typeof this.options.prettify === "function") ? this.options.prettify(num) : num; 
		},

		//_prettify_text
		_prettify_text: function (num) {
			return (this.options.prettify_text && typeof this.options.prettify_text === "function") ? this.options.prettify_text(num) : num; 
		},

		//checkEdges
		checkEdges: function (left, width) {
			if (left < 0) {
				left = 0;
			} else if (left > 100 - width) {
				left = 100 - width;
			}

			return this.toFixed(left);
		},

		//validate
		validate: function () {
			var o = this.options,
			r = this.result;

			if (typeof o.min === "string") o.min = +o.min;
			if (typeof o.max === "string") o.max = +o.max;
			if (typeof o.from === "string") o.from = +o.from;
			if (typeof o.to === "string") o.to = +o.to;
			if (typeof o.step === "string") o.step = +o.step;

			if (typeof o.from_min === "string") o.from_min = +o.from_min;
			if (typeof o.from_max === "string") o.from_max = +o.from_max;
			if (typeof o.to_min === "string") o.to_min = +o.to_min;
			if (typeof o.to_max === "string") o.to_max = +o.to_max;

			if (o.max <= o.min) {
				if (o.min) {
					o.max = o.min * 2;
				} else {
					o.max = o.min + 1;
				}
				o.step = 1;
			}

			if (typeof o.from !== "number" || isNaN(o.from)) { o.from = o.min; }

			if (typeof o.to !== "number" || isNaN(o.from)) { o.to = o.max; }

			if (o.from < o.min || o.from > o.max) { o.from = o.min; }

			if (o.to > o.max || o.to < o.min) { o.to = o.max; }

			if (o.type === "double" && o.from > o.to) { o.from = o.to; }

			if (typeof o.step !== "number" || isNaN(o.step) || !o.step || o.step < 0) { o.step = 1; }

			if (o.from_min && o.from < o.from_min) { o.from = o.from_min; }

			if (o.from_max && o.from > o.from_max) { o.from = o.from_max; }

			if (o.to_min && o.to < o.to_min) { o.to = o.to_min; }

			if (o.to_max && o.from > o.to_max) { o.to = o.to_max; }

			if (r) {
				if (r.min !== o.min) {
					r.min = o.min;
				}

				if (r.max !== o.max) { r.max = o.max; }

				if (r.from < r.min || r.from > r.max) { r.from = o.from; }

				if (r.to < r.min || r.to > r.max) { r.to = o.to; }
			}

			if (typeof o.min_interval !== "number" || isNaN(o.min_interval) || !o.min_interval || o.min_interval < 0) { o.min_interval = 0; }

			if (typeof o.max_interval !== "number" || isNaN(o.max_interval) || !o.max_interval || o.max_interval < 0) { o.max_interval = 0; }

			if (o.min_interval && o.min_interval > o.max - o.min) { o.min_interval = o.max - o.min; }

			if (o.max_interval && o.max_interval > o.max - o.min) { o.max_interval = o.max - o.min; }

		}, //end of validate


		//decorate
		decorate: function (num, original) {
			var decorated = "",
			o = this.options;

			if (o.prefix) {
				decorated += o.prefix;
			}

			decorated += num;

			if (o.max_postfix) {
				if (original === o.max) {
					decorated += o.max_postfix;
					if (o.postfix) {
						decorated += " ";
					}
				}
			}

			if (o.postfix) {
				decorated += o.postfix;
			}

			return decorated;
		},

		//updateFrom
		updateFrom: function () {
			this.result.from = this.options.from;
			this.result.from_percent = this.calcPercent(this.result.from);
		},

		//updateTo
		updateTo: function () {
			this.result.to = this.options.to;
			this.result.to_percent = this.calcPercent(this.result.to);
		},

		//updateResult
		updateResult: function () {
			this.result.min = this.options.min;
			this.result.max = this.options.max;
			this.updateFrom();
			this.updateTo();
		},


		// =============================================================================================================
		// Grid - use appendGridContainer to create new grids. Use addGridText(text, left[, value]) to add a grid-text

		appendGridContainer: function(){ 
			this.coords.w_rs = this.$cache.bs.outerWidth(false);
			
			if (this.currentGridContainer){
				this.totalGridContainerTop += this.currentGridContainer.height();  
				this.currentGridContainer = 
					$('<span class="grid"></span>').insertAfter( this.currentGridContainer );
				this.currentGridContainer.css('top', this.totalGridContainerTop+'px');
			}
			else {
				this.currentGridContainer = this.$cache.grid;
				this.totalGridContainerTop = this.currentGridContainer.position().top; 
			}
			this.$cache.grid = this.$cache.cont.find(".grid"); 

			return this.currentGridContainer;
		},
		

		//appendTick
		appendTick: function( left, options ){
			if (!this.currentGridContainer){
				return;
			}
			options = $.extend( {minor: false, color: ''}, options );
			var result = $('<span class="grid-pol" style="left:' + left + '%"></span>');
			
			if (options.minor)
				result.addClass('minor');  
			if (options.color)
				result.css('background-color', options.color);  
			

			result.appendTo( this.currentGridContainer );
			return result;
		
		},

		//appendText
		appendText: function( left, value, options ){ 
			if (!this.currentGridContainer){
				return;
			}
			options = $.extend( {color: ''}, options );
			var text = this._prettify_text( value );

			if (this.options.decorate_text)
			  text =	(this.options.prefix ? this.options.prefix : '') +
								text +
								(this.options.postfix ? this.options.postfix : '');
			var result = $('<span class="grid-text" style="background-color:none; left: ' + left + '%">' + text + '</span>');
			result.appendTo( this.currentGridContainer );

			//Center the label
			result.css( 'margin-left', -result.outerWidth(false)/2 + 'px' );

			if (options.clickable && !this.options.disable && !this.options.read_only){
				//value = options.click_value !== undefined ? options.click_value : parseFloat( text );
				value = options.click_value !== undefined ? options.click_value : value;
				result
					.data('base-slider-value', value)
					.on("click.irs_" + this.plugin_count, this.textClick.bind(this) )
					.addClass('clickable');
			}
			if (options.minor)
				result.addClass('minor');
			if (options.italic)
				result.addClass('italic');
			if (options.color)
				result.css('color', options.color);

	
			return result;
		
		},

		//getTextWidth
		getTextWidth: function( value, options ){
			var 
				elem = this.appendText( 0, value, options ),
				result = parseFloat( elem.outerWidth(false) );
			elem.remove();
			return result;
		},

		//appendGrid 
		appendGrid: function () { 
			if (!this.options.grid) {	return;	}
			this.appendStandardGrid();
		},

		//appendStandardGrid - simple call _appendStandardGrid. Can be overwriten in decending classes
		appendStandardGrid: function ( textOptions ) { 
			this._appendStandardGrid( textOptions );
		},

		//_appendStandardGrid
		_appendStandardGrid: function ( textOptions, tickOptions ) { 
			this.appendGridContainer();
			this.calcGridMargin();

			
			var o = this.options,					
					total = o.max - o.min,
					gridContainerWidth = this.$cache.grid.outerWidth(false),
					gridDistanceIndex = 0,
					value = o.min,
					maxTextWidth = 0,
					valueP = 0,
					valueOffset;
			o.gridDistanceStep = o.gridDistances[gridDistanceIndex]; // = number of steps between each tick
			o.stepPx = o.step*gridContainerWidth/total; 
			o.stepP = this.toFixed(o.step / (total / 100));

			textOptions = $.extend( textOptions || {}, {clickable:true} );
			tickOptions = tickOptions || {};


			//Increse grid-distance until the space between two ticks are more than 4px 
			while ( (o.stepPx*o.gridDistanceStep) <= 4){
				gridDistanceIndex++;
				if (gridDistanceIndex < o.gridDistances.length)
				  o.gridDistanceStep = o.gridDistances[gridDistanceIndex];
				else
					o.gridDistanceStep = o.gridDistanceStep*2;
			}
			o.tickDistanceNum = o.gridDistanceStep*o.step;	//The numerical distance between each ticks
			o.tickDistancePx = o.gridDistanceStep*o.stepPx;		//The pixel distance between each ticks


			var _major_ticks = o.major_ticks;
			if (!_major_ticks){
			  //Calculate automatic distances between major ticks

				//Find widest text/label
				value = o.min;
				while (value <= o.max){				
					if (value % o.tickDistanceNum === 0){
						maxTextWidth = Math.max( maxTextWidth, this.getTextWidth( value ) );
					}
					value += o.step;
				}
				maxTextWidth += 6; //Adding min space between text/labels

				//Find ticks between each major tick
				gridDistanceIndex = 0;
				_major_ticks = o.gridDistances[gridDistanceIndex];
				while (_major_ticks*o.tickDistancePx < maxTextWidth){
					gridDistanceIndex++;
					if (gridDistanceIndex < o.gridDistances.length)
					  _major_ticks = o.gridDistances[gridDistanceIndex];
					else
						_major_ticks = _major_ticks*2;
				}
			}
			
			o.majorTickDistanceNum = o.tickDistanceNum*_major_ticks;

			value = o.min;			
			while (value <= o.max){
				valueOffset = value - this.options.major_ticks_offset;
				if (valueOffset % o.tickDistanceNum === 0){
				  if (valueOffset % o.majorTickDistanceNum === 0){
				    //add major tick and text/label
						this.appendTick( valueP, tickOptions );
						this.appendText( valueP, value, textOptions );
				  }
					else
						if (!this.options.hide_minor_ticks)
							//Add minor tick
							this.appendTick( valueP, { minor:true } );
				}				
				value += o.step;
				valueP += o.stepP;
			}
		},


		//calcGridMargin
		calcGridMargin: function () { 

			this.coords.w_rs = this.$cache.bs.outerWidth(false);
			if (!this.coords.w_rs) {
				return;
			}

			if (this.options.type === "single") {
				this.coords.w_handle = this.$cache.s_single.outerWidth(false);
			} else {
				this.coords.w_handle = this.$cache.s_from.outerWidth(false);
			}
			this.coords.p_handle = this.toFixed(this.coords.w_handle  / this.coords.w_rs * 100);
			this.coords.grid_gap = this.toFixed((this.coords.p_handle / 2) - 0.1);

			this.$cache.grid.css({
				'width'	: this.toFixed(100 - this.coords.p_handle) + "%",
				'left'	: this.coords.grid_gap + "%"
			});

		},


		// =============================================================================================================
		// Public methods

		//update
		update: function (options) {
			if (!this.input) {
				return;
			}

			this.is_update = true;

			this.options.from = this.result.from;
			this.options.to = this.result.to;

			this.options = $.extend(this.options, options);
			this.validate();
			this.updateResult();

			this.toggleInput();
			this.remove();
			this.init(true);
		},

		//reset
		reset: function () {
			if (!this.input) {
				return;
			}

			this.updateResult();
			this.update();
		},

		//destroy
		destroy: function () {
			if (!this.input) {
				return;
			}

			this.toggleInput();
			this.$cache.input.prop("readonly", false);
			$.data(this.input, "baseSlider", null);

			this.remove();
			this.input = null;
			this.options = null;
		}
	}; //end of BaseSlider.prototype


	$.fn.baseSlider = function (options) {
		return this.each(function() {
			if (!$.data(this, "baseSlider")) {
				$.data(this, "baseSlider", new window.BaseSlider(this, options, plugin_count++));
			}
		});
	};


}(jQuery, this, document));
