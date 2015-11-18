/****************************************************************************
	jquery-time-slider, A extension to jquery-base-slider with selection of time and date

	(c) 2015, Niels Holt

	https://github.com/fcoo/jquery-time-slider
	https://github.com/fcoo

USING
	fcoo/jquery-base-slider - https://github.com/fcoo/jquery-base-slider


options:

	** SAME AS IN JQUERY-BASE-SLIDER PLUS **

	display:
		from:
			tzElement, utcElement, relativeElement
		to:
			tzElement, utcElement, relativeElement

	format:
		date				: string ('DMY' | 'MDY' | 'YMD')																		Default = 'DMY'
		time				: string; ('12 | '24')																							Default = '24'
		showRelative: boolean; If true the grid etc show the relative time ('Now + 2h')	Default = false
		timezone		: 'local', 'utc' or abbrivation of time zone.												Default = 'utc'. Only if showRelative == false
		showUTC			: boolean; When true a scale for utc is also shown.									Default = false. Only if showRelative == false

	text:
		hourAbbr	= 'h';
		minAbbr		= 'm';
		now				= 'now';
		to        = 'to';




****************************************************************************/

;(function ($, window, document, undefined) {
	"use strict";

	//roundMoment( m ) 
	function roundMoment( m ){ m.startOf('hour');  return m; }

	//valueToMoment
	function valueToMoment ( value ){ 
		var result = roundMoment(moment());
		result.add( value, 'hours' );
		return result;
	}

	//setValueAndMoment( value, moment )
	function setValueAndMoment( value, m ){
		var nowMoment = roundMoment(moment());
		if (value === undefined){
			roundMoment( m ); 
			value = m.diff(nowMoment, 'hours'); 
		}
		else {
			m = nowMoment;
			m.add(value, 'hours');
		}
		return { m: m, value: value };
	}

	
	var plugin_count = 1000;

	window.TimeSlider = function (input, options, plugin_count) {
		this.VERSION = "{VERSION}";

		//Setting default options
		options = $.extend({
			grid: true,
			gridDistances : [1, 2, 3, 6, 12, 24, 48],
			step_offset_moment: null
		}, options);

		this.dateTimeFormat = new window.DateTimeFormat();

		//Setting display- and text-options
		function setAndGet( obj, attrName, attrList ){
			obj[attrName] = obj[attrName] || {}; 
			for (var i=0; i<attrList.length; i++ ){
				var nextAttrName = attrList[i];
				if ( $.type( obj[attrName][nextAttrName] ) === 'string' )
				  obj[attrName][nextAttrName] = $(obj[attrName][nextAttrName]);
			}
		}
		options.display = options.display || {};
		setAndGet(options.display, 'from',			['tzElement', 'utcElement', 'relativeElement']);
		setAndGet(options.display, 'to',				['tzElement', 'utcElement', 'relativeElement']);

		options.text = $.extend({hourAbbr: 'h', minAbbr: 'm', now:'now', to:'to'}, options.text);
		options.text.nowUC =  options.text.now.charAt(0).toUpperCase() + options.text.now.slice(1);

		options.values_separator = ' ' + options.text.to + ' ';
		
		//Set min or minMoment and max or maxMoment
		var valMom = setValueAndMoment( options.min, options.minMoment );
		options.min = valMom.value; options.minMoment = valMom.m;
		valMom = setValueAndMoment( options.max, options.maxMoment );
		options.max = valMom.value; options.maxMoment = valMom.m;

		if ((options.step > 1) && options.step_offset_moment){
		  //Use options.step_offset_moment to calculate step_offset
			var value = setValueAndMoment( undefined, moment(options.step_offset_moment) ).value;
			options.step_offset = (value - options.min) % options.step;
		}  

		//Create BaseSlider
		window.BaseSlider.call(this, input, options, plugin_count );

		//Set from/fromMoment and to/toMoment
		this.setFromValue( setValueAndMoment( options.from, options.fromMoment ).value );
		if (options.isInterval)
			this.setToValue( setValueAndMoment( options.to, options.toMoment ).value );

		//Sets the format and create the grids
		this.setFormat( {}, true );
	};

	//timeSlider as jQuery prototype
	$.fn.timeSlider = function (options) {
		return this.each(function() {
			if (!$.data(this, "timeSlider")) {
				$.data(this, "timeSlider", new window.TimeSlider(this, options, plugin_count++));
			}
		});
	};


	//Extend the prototype
	window.TimeSlider.prototype = {
		//valueToTzMoment
		_valueToTzMoment: function( value, timezone ){
			return this.dateTimeFormat.tzMoment( valueToMoment(value), timezone );
		},
		
		//_valueToFormat - converts value to a moment.format-string or a relative text. If no timezome is given => return relative format
		_valueToFormat: function( value, timezone ){ 
			if (timezone)
				return this._valueToTzMoment( value, timezone ).format( this.options.display.formatStr );			  
			else
				return this.options.text.nowUC + (value >= 0 ? ' + ' : ' - ') + Math.abs(value) + this.options.text.hourAbbr;
		},

		//hhFormat - return the hour of a moment
		hhFormat	: function( m ){ return m.format( this.options.format.time == '24' ? 'HH' : 'hha' ); },


		_prettify_relative			: function( value ){ return this._valueToFormat( value );	},
		_prettify_text_relative	: function( value ){ return value;												},

		_prettify_absolute: function( value ){ return this._valueToFormat( value, this.options.format.timezone ); },
		_prettify_text_absolute: function( value ){
			var m = this._valueToTzMoment( value, this.options.format.timezone );
			return this.hhFormat( m );
		},
		
		_prettify_text_absolute_date: function( value ){ 
				return this._valueToTzMoment( value, this.options.format.timezone ).format( this.options.format.dateFormat );
			},
	
		//adjustResult
		adjustResult: function(){ 
			this.result.minMoment		= valueToMoment ( this.result.min );
			this.result.maxMoment		= valueToMoment ( this.result.max );
			this.result.fromMoment	= valueToMoment ( this.result.from );
			this.result.toMoment		= valueToMoment ( this.result.to );
		},


		//appendDateGrid
		appendDateGrid: function( textOptions, tickOptions ){
			var o = this.options,
					value,
					valueP = 0,
					valuePx = o.stepPx/o.step,
					midnights = 0,
					isFirstMidnight = true,
					firstMidnightValue = 0,
					lastMidnightValue = 0,
					dayPx, 
					values = [],
					dateFormats,
					dateFormatOk,
					textWidth;

			this._setDateTimeFormat();
			this.appendGridContainer();
			this.calcGridMargin();

			this.currentGridContainer.addClass("text-between-ticks");
			this._prettify_text = this._prettify_text_absolute_date;

			//Setting tick at midnight
			value = o.min;			
			while (value <= o.max){
				if ( ((value - this.options.major_ticks_offset) % o.tickDistanceNum === 0) && (this._valueToTzMoment( value, this.options.format.timezone ).hour() === 0) ){
					midnights++;
					this.appendTick( valueP, tickOptions );

					if (isFirstMidnight){
					  isFirstMidnight = false;
						firstMidnightValue = value;
					}
					lastMidnightValue = value;
				}
				value += 1; 
				valueP += o.oneP; 
			}

			//Find the max width (in px) of a date-label = dayPx
			dayPx = valuePx * (
								midnights === 0 ?	o.max - o.min :
								midnights == 1 ?	Math.max( firstMidnightValue - o.min, o.max - firstMidnightValue ) :
																	24
							) - 6; //6 = margin

			if (!o.format.dateFormat){
				//Find the format for the date, where all dates is smaller than dayPx
				switch (this.dateTimeFormat.options.date){
				  case 'DMY': //																															Mon, 24. Dec 2014,		Mon, 24. Dec 14,		24. Dec 2014,   24. Dec 14,   24/12/2014,   24/12/14,   24/12			24	
											dateFormats = [/*'dddd, DD. MMMM YYYY', 'ddd, DD. MMMM YYYY', */'ddd, DD. MMM YYYY',	'ddd, DD. MMM YY',	'DD. MMM YYYY', 'DD. MMM YY', 'DD/MM/YYYY', 'DD/MM/YY', 'DD/MM', 'DD']; 
											break;
				  case 'MDY': //																															Mon Dec 24, 2014,			Mon Dec 24, 14,			Dec 24, 2014,		Dec 24, 14,		12/24/2014,		12/24/14,		12/24		 24
											dateFormats = [/*'dddd, MMMM DD, YYYY', 'ddd, MMMM DD, YYYY', */'ddd, MMM DD, YYYY',	'ddd, MMM DD, YY',	'MMM DD, YYYY', 'MMM DD, YY', 'MM/DD/YYYY', 'MM/DD/YY', 'MM/DD', 'DD']; 
											break;
				  case 'YMD': //																														 Mon 2014 Dec 2014,			Mon 14 Dec 24,		2014 Dec 24,		14 Dec 24,		2014/12/24,		14/12/24		12/24			24
											dateFormats = [/*'dddd, YYYY MMMM DD',  'ddd, YYYY MMMM DD', */'ddd, YYYY MMM DD',		'ddd, YY MMM DD',	'YYYY MMM DD',	'YY MMM DD',	'YYYY/MM/DD',	'YY/MM/DD',	'MM/DD',	'DD']; 
											break;
				}

				//Create temp list of all values needed
				value = o.min;
				while (value <= o.max){
					values.push( value );
					value += 24;
				}

				//Checking if all dates dispalyed in dayFormat are samller thae the max width for a day = dayPx. Setting this._prettify_text will force getTextWidth to use the text directly
				for (var i=0; i<dateFormats.length; i++ ){
					o.format.dateFormat = dateFormats[i];
					dateFormatOk = true;
					for (var j=0; j<values.length; j++ ){
						if (this.getTextWidth( values[j], textOptions ) > dayPx){
							dateFormatOk = false;
							break;
						}
					}
					if (dateFormatOk)
					  break;
				}	
				if (!dateFormatOk)
					o.format.dateFormat = '';  
			}
			
			if (o.format.dateFormat){
				//Append the label/text
				if (midnights === 0){
					//Special case: No midnights => the date are placed centered
					this.appendText( o.oneP * ((o.max-o.min)/2) , o.min, textOptions );
				}
				else {
					//first day - check if there are space to put a date-label
					textWidth = this.getTextWidth( o.min, textOptions );
					if ( valuePx*(firstMidnightValue - o.min) >= textWidth ){
						//Try to place the date-text under 12 o'clock (noon) but always keep inside the left edge
						var minTextValue = o.min + textWidth/2/valuePx;
						this.appendText( o.oneP * ( Math.max( minTextValue, firstMidnightValue-12 ) - o.min ), o.min, textOptions );
					}
				
					//last day - check if there are space to put a date-label
					textWidth = this.getTextWidth( o.max, textOptions );
					if ( valuePx*(o.max - lastMidnightValue) >= textWidth ){
						//Try to place the date-text under 12 o'clock (noon) but always keep inside the right edge
						var maxTextValue = o.max - textWidth/2/valuePx;
						this.appendText( o.oneP * ( Math.min( maxTextValue, lastMidnightValue+12 ) - o.min ), o.max, textOptions );
					}

					//Days between first and last day				
					if (midnights > 1){
						value = firstMidnightValue + 12;
						while (value <= lastMidnightValue){
							this.appendText( o.oneP*(value-o.min) , value, textOptions );
							value += 24;
						}
					}
				}
			}
		},

		//appendStandardGrid
		appendStandardGrid: function(){
			//First remove all grid-container except the first one
			this.$cache.grid = this.$cache.cont.find(".grid").first(); 
			this.$cache.grid.siblings('.grid').remove();
			this.$cache.grid.empty();
			this.currentGridContainer = null;

			//Create all grid
			if (this.options.format.showRelative){
				//Relative time: Set the prettify-functions and create the grid needed
				this._prettify = this._prettify_relative;
			  this._prettify_text = this._prettify_text_relative;
				this.options.major_ticks_offset = 0;
				this._appendStandardGrid();
			}
			else {
				//Absolute time: Set the prettify-functions
				var now = moment();
				//Create the hour-grid and the date-grid for selected timezone
			  this._prettify = this._prettify_absolute;
			  this._prettify_text = this._prettify_text_absolute;
				this.options.major_ticks_offset = -1*this.dateTimeFormat.tzMoment( now, this.options.format.timezone ).hours(); 
				this._appendStandardGrid();
				this.appendDateGrid();

				if ((this.options.format.timezone != 'utc') && this.options.format.showUTC){
					//Create the hour-grid and the date-grid for utc
					this.options.major_ticks_offset = -1*this.dateTimeFormat.tzMoment( now, 'utc' ).hours(); 
					var saveTimezone = this.options.format.timezone;
					this.options.format.timezone = 'utc';
					var textOptions = {italic:true, minor:true}, tickOptions = {color:'#555555'};
				  this._prettify = this._prettify_absolute;
				  this._prettify_text = this._prettify_text_absolute;
					this._appendStandardGrid( textOptions, tickOptions );
					this.appendDateGrid( textOptions, tickOptions );
					this.options.format.timezone = saveTimezone;
				}
			}
		},

		//_setDateTimeFormat
		_setDateTimeFormat: function(){
			this.dateTimeFormat.setFormat({
				date			: this.options.format.date,
				//TODO dateId			: 2,
				time			: this.options.format.time,
				timezoneId: this.options.format.timezone,
			});
		},


		//setFormat
		setFormat: function( format ){
			this.options.format = $.extend( {date: 'DMY', time: '24', showRelative: false, timezone: 'utc', showUTC: false}, this.options.format, format  );

			//Update this.dateTimeFormat
			this._setDateTimeFormat();

			this.options.display.formatStr = 
				(this.dateTimeFormat.options.date != 'DMY' ? 'MMM-DD' : 'DD-MMM') + //Dec-24 / 24-Dec
				' ' +
				this.dateTimeFormat.timeFormat;

			this.options.format.dateFormat = '';
			this.update();
			this.updateDisplay();
		},
		
		//updateDisplay - updates the elements with text versions of from-value and to-value as timezone-date, utc-date and relative time
		updateDisplay: function(){
			var i, attr, value;
			function setText( $elem, text ){ 
				if ($elem) 
					$elem.each( function(){ $(this).text( text ); } );
			}
			for (i=0; i<2; i++){
				value = i ? this.result.to : this.result.from;
				attr	= i ? this.options.display.to : this.options.display.from;
				setText( attr.tzElement				,	this._valueToFormat( value, this.options.format.timezone	) );
				setText( attr.utcElement			, this._valueToFormat( value, 'utc'													) );
				setText( attr.relativeElement	, this._valueToFormat( value																) );

			}
		},

		preCallback: function(){ this.updateDisplay(); }
	};
	window.TimeSlider.prototype = $.extend( {}, window.BaseSlider.prototype, window.TimeSlider.prototype );
}(jQuery, this, document));
