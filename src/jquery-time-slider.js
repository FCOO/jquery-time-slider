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
        value:
            tzElement, utcElement, relativeElement  //jQuery-object or String (=search)
        from:
            tzElement, utcElement, relativeElement  //jQuery-object or String (=search)
        to:
            tzElement, utcElement, relativeElement  //jQuery-object or String (=search)

    format:
        showRelative: boolean; If true the grid etc show the relative time ('Now + 2h') Default = false
        showUTC     : boolean; When true a scale for utc is also shown.                 Default = false. Only if showRelative == false

    NB: Using moment-simple-format to set and get text and format for date and time

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";

    //roundMoment( m )
    function roundMoment( m ){ return m.startOf('hour');}


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


    var pluginCount = 1000,
        defaultOptions = {
            grid              : true,
            gridDistances     : [1, 2, 3, 6, 12, 24, 48],

            step : 1, // 1 hour
            keyboardShiftStepFactor: 6,  //Step 6 hour with shift or ctrl
            keyboardPageStepFactor : 24, //Step 24 h with PgUp og PgDn

            stepOffsetMoment: null,
            format: {
                showRelative: false,
                showUTC     : false
            }
        };

    window.TimeSlider = function (input, options, pluginCount) {
        var _this = this;

        this.VERSION = "{VERSION}";

        //Setting default options
        this.options = $.extend( true, {}, defaultOptions, options );
        this._updateOptionsFormat();

        this.options.display = this.options.display || {};
        //Convert options.display.[value | from | to] from selector-string to $-elements (if needed)
        $.each( ['value', 'from', 'to'], function( index, id ){
            _this.options.display[id] = _this.options.display[id] || {};
            $.each( ['tzElement', 'utcElement', 'relativeElement'], function( index, attrId ){
                var selector = _this.options.display[id][attrId];
                if ($.type(selector) == 'string')
                    _this.options.display[id][attrId] = $(selector);
            });
        });

        //Set min/minMoment, max/maxMoment, from/fromMoment, to/toMoment, and value/valueMoment
        var valMom = setValueAndMoment( this.options.min, this.options.minMoment );
        this.options.min = valMom.value; this.options.minMoment = valMom.m;

        valMom = setValueAndMoment( this.options.max, this.options.maxMoment );
        this.options.max = valMom.value; this.options.maxMoment = valMom.m;

        valMom = setValueAndMoment( this.options.from, this.options.fromMoment || this.options.minMoment );
        this.options.from = valMom.value; this.options.fromMoment = valMom.m;

        valMom = setValueAndMoment( this.options.to, this.options.toMoment || this.options.maxMoment );
        this.options.to = valMom.value; this.options.toMoment = valMom.m;

        valMom = setValueAndMoment( this.options.value, this.options.valueMoment || this.options.fromMoment);
        this.options.value = valMom.value; this.options.valueMoment = valMom.m;

        if ((this.options.step > 1) && this.options.stepOffsetMoment){
          //Use options.stepOffsetMoment to calculate stepOffset
            var value = setValueAndMoment( undefined, moment( this.options.stepOffsetMoment ) ).value;
            this.options.stepOffset = (value - this.options.min) % this.options.step;
        }

        //Update display-element onChanging if
        if (!this.options.onChangeOnDragging)
            this.preOnChanging =  $.proxy( this.updateDisplay, this );


        //Create BaseSlider - dont create grid here
        var optionsGrid = this.options.grid;
        this.options.grid = false;
        window.BaseSlider.call(this, input, this.options, pluginCount );

        if (this.options.isSingle)
            this.setValue( setValueAndMoment( this.options.value, this.options.valueMoment ).value );
        else {
            //Set from/fromMoment and to/toMoment
            this.setFromValue( setValueAndMoment( this.options.from, this.options.fromMoment ).value );
            this.setToValue  ( setValueAndMoment( this.options.to,   this.options.toMoment   ).value );
        }

        //Sets the format and create the grids
        this.options.grid = optionsGrid;
        this.setFormat();
    };

    //timeSlider as jQuery prototype
    $.fn.timeSlider = function (options) {
        return this.each(function() {
            if (!$.data(this, "timeSlider")) {
                $.data(this, "timeSlider", new window.TimeSlider(this, options, pluginCount++));
            }
        });
    };


    //Extend the prototype
    window.TimeSlider.prototype = {
        /**************************************************************
        valueToTzMoment
        ***************************************************************/
        _valueToTzMoment: function( value, timezone ){
            return valueToMoment(value).tzMoment( timezone );
        },

        /**************************************************************
        _valueToFormat
        converts value to a moment.format-string or a relative text. If no timezome is given => return relative format
        ***************************************************************/
        _valueToFormat: function( value, timezone ){
            if (timezone)
                return this._valueToTzMoment( value, timezone ).format( this.options.format.dateHourFormat );
            else
                return this.options.format.text.nowUC + (value >= 0 ? ' + ' : ' - ') + Math.abs(value) + this.options.format.text.hourAbbr;
        },

        _prettifyRelative      : function( value ){ return this._valueToFormat( value ); },
        _prettifyLabelRelative: function( value ){ return value;                        },

        _prettifyAbsolute: function( value ){ return this._valueToFormat( value, this.options.format.timezone ); },
        _prettifyLabelAbsolute: function( value ){
            return this._valueToTzMoment( value, this.options.format.timezone ).hourFormat();
        },

        _prettifyLabelAbsoluteDate: function( value ){
                return this._valueToTzMoment( value, this.options.format.timezone ).format( this.options.format.dateFormat );
            },

        /**************************************************************
        adjustResult
        ***************************************************************/
        adjustResult: function(){
            this.result.minMoment   = valueToMoment ( this.result.min );
            this.result.maxMoment   = valueToMoment ( this.result.max );
            this.result.fromMoment  = valueToMoment ( this.result.from );
            this.result.toMoment    = valueToMoment ( this.result.to );
            this.result.valueMoment = valueToMoment ( this.result.value );
        },


        /**************************************************************
        appendDateGrid
        ***************************************************************/
        appendDateGrid: function( textOptions, tickOptions ){
            var o = this.options,
                value,
                valueP = 0,
                valueRem = o.stepRem/o.step,
                midnights = 0,
                isFirstMidnight = true,
                firstMidnightValue = 0,
                lastMidnightValue = 0,
                dayRem,
                values = [],
                dateFormats,
                dateFormatOk,
                textWidth;

            this.preAppendGrid();

            this.$currentGridContainer.addClass("label-between-ticks");
            this._prettifyLabel = this._prettifyLabelAbsoluteDate;

            //Setting tick at midnight
            value = o.min;
            while (value <= o.max){
                //Old version: Force midnights tag to be on minor-tick => error on shift to/from DST (Daylight Saving Time)
                //if ( ((value - this.options.majorTicksOffset) % o.tickDistanceNum === 0) && (this._valueToTzMoment( value, this.options.format.timezone ).hour() === 0) ){

                //New version: Allow midnights tags on every hour regardless if there are a tag
                if (this._valueToTzMoment( value, this.options.format.timezone ).hour() === 0){

                    midnights++;
                    this.appendTick( valueP, tickOptions );

                    if (isFirstMidnight){
                      isFirstMidnight = false;
                        firstMidnightValue = value;
                    }
                    lastMidnightValue = value;
                }
                value += 1;
                valueP += o.percentProValue;
            }

            //Find the max width (in rem) of a date-label = dayRem
            dayRem = valueRem * (
                                  midnights === 0 ? o.range :
                                  midnights == 1  ? Math.max( firstMidnightValue - o.min, o.max - firstMidnightValue ) :
                                                    20  //Setting a full day to 20 hours to allow date-string on days up to 20 hours at the ends
                                ) - this.options.minDistanceRem; // = margin

            if (!o.format.dateFormat){
                //Find the format for the date, where all dates is smaller than dayRem
                dateFormats = moment.sfDateFormatList( function( code ){
                                //Include all formats except full weekday or full month
                                return (code.charAt(0) != 'F') && (code.charAt(1) != 'F');
                              });

                //Create temp list of all values needed
                value = o.min;
                while (value <= o.max){
                    values.push( value );
                    value += 24;
                }

                //Checking if all dates displayed in dayFormat are samller than the max width for a day = dayRem. Setting this._prettifyLabel will force getTextWidth to use the text directly
                for (var i=0; i<dateFormats.length; i++ ){
                    o.format.dateFormat = dateFormats[i];
                    dateFormatOk = (this.getTextWidth( values, textOptions ) <= dayRem);

                    if (dateFormatOk)
                      break;
                }
                if (!dateFormatOk)
                    o.format.dateFormat = '';
            }

            if (o.format.dateFormat){
                //No text-colors or click on day-text
                var textColorRec   = o.textColorRec,
                    labelClickable = o.labelClickable,
                    labelColorRec  = o.labelColorRec;

                o.textColorRec   = {};
                o.labelClickable = false;
                o.labelColorRec  = {};

                //Append the label/text
                if (midnights === 0){
                    //Special case: No midnights => the date are placed centered
                    this.appendLabel( o.percentProValue * o.range / 2 , o.min, textOptions );
                }
                else {
                    //first day - check if there are space to put a date-label
                    textWidth = this.getTextWidth( o.min, textOptions );
                    if ( valueRem*(firstMidnightValue - o.min) >= textWidth ){
                        //Try to place the date-text under 12 o'clock (noon) but always keep inside the left edge
                        var minTextValue = o.min + textWidth/2/valueRem;
                        this.appendLabel( o.percentProValue * ( Math.max( minTextValue, firstMidnightValue-12 ) - o.min ), o.min, textOptions );
                    }

                    //last day - check if there are space to put a date-label
                    textWidth = this.getTextWidth( o.max, textOptions );
                    if ( valueRem*(o.max - lastMidnightValue) >= textWidth ){
                        //Try to place the date-text under 12 o'clock (noon) but always keep inside the right edge
                        var maxTextValue = o.max - textWidth/2/valueRem;
                        this.appendLabel( o.percentProValue * ( Math.min( maxTextValue, lastMidnightValue+12 ) - o.min ), o.max, textOptions );
                    }

                    //Days between first and last day
                    if (midnights > 1){
                        value = firstMidnightValue + 12;
                        while (value <= lastMidnightValue){
                            this.appendLabel( o.percentProValue*(value-o.min) , value, textOptions );
                            value += 24;
                        }
                    }
                }
                o.textColorRec   = textColorRec;
                o.labelClickable = labelClickable;
                o.labelColorRec  = labelColorRec;
            }

            this.postAppendGrid();
        },

        /**************************************************************
        appendStandardGrid
        ***************************************************************/
        appendStandardGrid: function(){
            //First remove all grid-container except the first one
            this.cache.$grid = this.cache.$container.find(".grid").first();
            this.cache.$grid.siblings('.grid').remove();
            this.cache.$grid.empty();
            this.$currentGridContainer = null;

            //Create all grid
            if (this.options.format.showRelative){
                //Relative time: Set the prettify-functions and create the grid needed
                this._prettify = this._prettifyRelative;
                this._prettifyLabel = this._prettifyLabelRelative;
                this.options.majorTicksOffset = 0;
                this._appendStandardGrid();
            }
            else {
                //Absolute time: Set the prettify-functions
                var now = moment();
                //Create the hour-grid and the date-grid for selected timezone
                this._prettify = this._prettifyAbsolute;
                this._prettifyLabel = this._prettifyLabelAbsolute;
                this.options.majorTicksOffset = -1*now.tzMoment( this.options.format.timezone ).hours();
                this._appendStandardGrid();
                this.appendDateGrid();

                if ((this.options.format.timezone != 'utc') && this.options.format.showUTC){
                    //Create the hour-grid and the date-grid for utc
                    this.options.majorTicksOffset = -1*now.tzMoment( 'utc' ).hours();
                    var saveTimezone = this.options.format.timezone;
                    this.options.format.timezone = 'utc';
                    var textOptions = {italic:true, minor:true},
                        tickOptions = {color:'#555555'};
                    this._prettify = this._prettifyAbsolute;
                    this._prettifyLabel = this._prettifyLabelAbsolute;
                    this._appendStandardGrid( textOptions, tickOptions );
                    this.appendDateGrid( textOptions, tickOptions );
                    this.options.format.timezone = saveTimezone;
                }
            }
        },

        /**************************************************************
        _updateOptionsFormat
        ***************************************************************/
        _updateOptionsFormat: function( format ){
            $.extend( true, this.options.format, format || {}  );

            //Merge current moment.simpleFormat.options into this.options.format
            $.extend( true, this.options.format, moment.sfGetOptions() );

            //Create the format for the label over the 'dragger'
            this.options.format.dateHourFormat =
                (this.options.format.date == 'DMY' ? 'DD-MMM' : 'MMM-DD') + //Dec-24 / 24-Dec
                ' ' + moment.sfGetTimeFormat();

            //Set dateformat = '' to make appendDateGrid find new format
            this.options.format.dateFormat = '';

            //Set special versions of moment.simpleFormat.text
            var now =  this.options.format.text.now;
            this.options.format.text.nowUC =  now.charAt(0).toUpperCase() + now.slice(1);

            //Set jquery-base-slider options valuesSeparator to use moment.simpleFormat.text.to
            this.options.valuesSeparator = ' ' + this.options.format.text.to + ' ';
        },



        /**************************************************************
        setFormat
        ***************************************************************/
        setFormat: function( format ){
            //Reset label-width in case time-format is changed (12h <-> 24h)
            this.options.maxLabelWidthRem = 0;

            this._updateOptionsFormat( format );
            this.update();
            this.updateDisplay();
        },

        /**************************************************************
        updateDisplay
        Updates the elements with text versions of from-value and to-value as timezone-date, utc-date and relative time
        ***************************************************************/
        updateDisplay: function(){
            var _this = this;
            $.each( ['value', 'from', 'to'], function(index, id){
                var value = _this.result[id],
                    valueList = [
                        _this._valueToFormat( value, _this.options.format.timezone ),
                        _this._valueToFormat( value, 'utc' ),
                        _this._valueToFormat( value )
                    ];
                $.each( ['tzElement', 'utcElement', 'relativeElement'], function( index, attrId ){
                    var $elem = _this.options.display[id][attrId],
                        text = valueList[index];
                    if ($elem)
                        $elem.each( function(){ $(this).text( text ); } );
                });
            });
        },

        preOnChange: function(){ this.updateDisplay(); }

    };
    window.TimeSlider.prototype = $.extend( {}, window.BaseSlider.prototype, window.TimeSlider.prototype );

}(jQuery, this, document));
