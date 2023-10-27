/****************************************************************************
    jquery-time-slider, A extension to jquery-base-slider with selection of time and date

    (c) 2015, Niels Holt

    https://github.com/fcoo/jquery-time-slider
    https://github.com/fcoo

USING
    fcoo/jquery-base-slider - https://github.com/fcoo/jquery-base-slider


options:

    ** SAME AS IN JQUERY-BASE-SLIDER PLUS **

    noDateLabels    : BOOLEAN; If true no labels with the date are shown;
    dateAtMidnight  : BOOLEAN; If true the time-LABEL for midnight is replaced with a short date-label. Normally used together noDateLabels: true

    minMoment,
    maxMoment,
    fromMoment
    toMoment        : MOMENT; Same as min, max, from, to in jquery-base-slider but as moment-object

    format:
        date        : STRING;   Date format. "DMY" or "MDY" or "YMD" If none is given the format is set by [moment-simple-format](https://github.com/FCOO/moment-simple-format)
        showYear    : BOOLEAN;  If true the date-time info in handler includes the year
        time        : STRING;   Time format. "12" or "24"
        timezone    : STRING;   "local"` or `"utc"` or abbreviation of time zone. Only if showRelative: false
        text        : {hourAbbr:"h", minAbbr:"m", now:"now", to:"to"}; Text used to format the date

        showRelative: BOOLEAN; If true the grid etc show the relative time ('Now + 2h') Default = false

        showUTC                  : BOOLEAN; When true a scale for utc is also shown, but only if the time-zone isn't utc or forceUTC is set. Default = false. Only if showRelative == false
        forceUTC                 : BOOLEAN; If true and showUTC: true the utc-scale is included
        noGridColorsOnUTC        : BOOLEAN; If true the UTC-grid will not get any grid colors
        noExtendedGridColorsOnUTC: BOOLEAN; If true the UTC-grid will not get any extended grid colors
        noLabelColorsOnUTC       : BOOLEAN; If true the UTC-grid will not get any labels with colors
        UTCGridClassName         : STRING; Class-name(s) for the grids use for UTC time-lime

        showExtraRelative                  : BOOLEAN; If true and showRelative = false => A relative scale is included
        noGridColorsOnExtraRelative        : BOOLEAN; If true the extra relative-grid will not get any grid colors
        noExtendedGridColorsOnExtraRelative: BOOLEAN; If true the extra relative-grid will not get any extended grid colors
        noLabelColorsOnExtraRelative       : BOOLEAN; If true the extra relative-grid will not get any labels with colors
        extraRelativeGridClassName         : STRING; Class-name(s) for the grids use for the extra relative grid


    showRelative        : as format.showRelative
    showUTC             : as format.showUTC
    forceUTC            : as format.forceUTC
    noGridColorsOnUTC           : as format.noGridColorsOnUTC
    noExtendedGridColorsOnUTC   : as format.noExtendedGridColorsOnUTC
    noLabelColorsOnUTC          : as format.noLabelColorsOnUTC
    UTCGridClassName            : as format.UTCGridClassName

    showExtraRelative                   : as format.showExtraRelative
    noGridColorsOnExtraRelative         : as format.noGridColorsOnExtraRelative
    noExtendedGridColorsOnExtraRelative : as format.noExtendedGridColorsOnExtraRelative
    noLabelColorsOnExtraRelative        : as format.noLabelColorsOnExtraRelative
    extraRelativeGridClassName          : as format.extraRelativeGridClassName


    NB: Using moment-simple-format to set and get text and format for date and time

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";

    //roundMoment( m )
    function roundMoment( m ){ return m.startOf('hour');}

    //__jbs_getNowMoment = function to get current now as moment. Can be overwritten for under test
    window.__jbs_getNowMoment = function(){
        return roundMoment(moment());
    };


    //valueToMoment
    function valueToMoment ( value ){
        var result = window.__jbs_getNowMoment();
        result.add( value, 'hours' );
        return result;
    }

    //setValueAndMoment( value, moment )
    function setValueAndMoment( value, m ){
        var nowMoment = window.__jbs_getNowMoment();
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
        this.VERSION = "7.7.0";

        //Setting default options
        this.options = $.extend( true, {}, defaultOptions, options );

        this.useMomentDateFormat = !(options.format && options.format.date);

        this._updateOptionsFormat();

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

        //getNow: return "now". Moved to method to allow test of "now" changing
        _getNow: function(){ return moment(); },



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

        _prettifyRelative     : function( value ){ return this._valueToFormat( value ); },
        _prettifyLabelRelative: function( value ){ return value; },


        //_prettifyLabelRelative_full used for labels on extra relative grid
        _prettifyLabelRelative_full: function( value ){
            return value ? moment().add( value, 'hours' ).relativeFormat({ relativeFormat:{now:false, days:true, minutes:false} }) : this.options.format.text.nowUC;
        },



        _prettifyAbsolute: function( value ){
            return this._valueToFormat( value, this.options.format.timezone );
        },

        _prettifyLabelAbsolute: function( value ){
                var o      = this.options,
                    m      = this._valueToTzMoment( value, this.options.format.timezone ),
                    result = m.hourFormat();

            //If options.dateAtMidnight is set and it is midnight => return short date format
            if ( ((result == '00') || (result == '12am')) && o.dateAtMidnight){
                result = m.format( o.format.dateFormat_small );

            }

            return result;
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

            if (o.noDateLabels) return;

            this.preAppendGrid( {labelBetweenTicks: true} );

            this._prettifyLabel = this._prettifyLabelAbsoluteDate;

            //Setting tick at midnight
            value = o.min;
            while (value <= o.max){
                //Allow midnights tags on every hour regardless if there are a tag
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

            //Find the max width (in Px) of a date-label = dayPx
            dayPx = valuePx * (
                                  midnights === 0 ? o.range :
                                  midnights == 1  ? Math.max( firstMidnightValue - o.min, o.max - firstMidnightValue ) :
                                                    20  //Setting a full day to 20 hours to allow date-string on days up to 20 hours at the ends
                                ) - this.options.minDistance; // = margin

            if (!o.format.dateFormat){
                //Find the format for the date, where all dates is smaller than dayPx
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

                //Checking if all dates displayed in dayFormat are samller than the max width for a day = dayPx. Setting this._prettifyLabel will force getTextWidth to use the text directly
                for (var i=0; i<dateFormats.length; i++ ){
                    o.format.dateFormat = dateFormats[i];
                    dateFormatOk = (this.getTextWidth( values, textOptions ) <= dayPx);

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
                    if ( valuePx*(firstMidnightValue - o.min) >= textWidth ){
                        //Try to place the date-text under 12 o'clock (noon) but always keep inside the left edge
                        var minTextValue = o.min + textWidth/2/valuePx;
                        this.appendLabel( o.percentProValue * ( Math.max( minTextValue, firstMidnightValue-12 ) - o.min ), o.min, textOptions );
                    }

                    //last day - check if there are space to put a date-label
                    textWidth = this.getTextWidth( o.max, textOptions );
                    if ( valuePx*(o.max - lastMidnightValue) >= textWidth ){
                        //Try to place the date-text under 12 o'clock (noon) but always keep inside the right edge
                        var maxTextValue = o.max - textWidth/2/valuePx;
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
            var _this = this,
                opt = this.options,

                //text and tick options for secondary grids (relative and utc for absolute scale
                textOptions = {italic:true, minor:true},
                tickOptions = {color:'#555555'};


            //*****************************************************
            function appendSpecialGrid( gridOpt ){
                var noGridColors       = opt.format[gridOpt.noGridColorId]        || opt[gridOpt.noGridColorId],
                    noLabelColors      = opt.format[gridOpt.noLabelColorsId]      || opt[gridOpt.noLabelColorsId],
                    gridClassName      = opt.format[gridOpt.gridClassNameId]      || opt[gridOpt.gridClassNameId] || '',
                    noExtendGridColors = opt.format[gridOpt.noExtendGridColorsId] || opt[gridOpt.noExtendGridColorsId],

                    saveOptions   = $.extend(true, {}, _this.options);

                    opt.size.majorTickLength = 3; //Normal = 9
                    opt.size.minorTickLength = 2; //Normal = 6
                    opt.showMinorTicks       = false;

                //If noGridColors is set => remove grid-colors
                if (noGridColors)
                    opt.gridColors = null;
                else
                    if (noExtendGridColors)
                        opt.extendGridColors = false;

                //If noLabelColors is set => remove label-colors
                if (noLabelColors)
                    opt.labelColors = null;

                if (gridOpt.newLabels)
                    opt.maxLabelWidth = null;   //Force recalculating label-space

                _this._appendStandardGrid(textOptions, tickOptions);

                _this.$currentGrid.addClass(gridClassName);

                //Restore options
                opt = _this.options = saveOptions;
            }
            //*****************************************************

            //First remove all grid-container except the first one
            this.cache.$grid = this.cache.$container.find(".grid").first();
            this.cache.$grid.siblings('.grid').remove();
            this.cache.$grid.empty();
            this.$currentGridContainer = null;

            //Create all grid
            if (opt.format.showRelative || opt.showRelative){
                //Relative time: Set the prettify-functions and create the grid needed
                this._prettify = this._prettifyRelative;
                this._prettifyLabel = this._prettifyLabelRelative;
                opt.majorTicksOffset = 0;
                this._appendStandardGrid();
            }
            else {
                //Absolute time: Set the prettify-functions
                var now = this._getNow();
                //Create the hour-grid and the date-grid for selected timezone
                this._prettify = this._prettifyAbsolute;
                this._prettifyLabel = this._prettifyLabelAbsolute;
                opt.majorTicksOffset = -1*now.tzMoment( opt.format.timezone ).hours();
                this._appendStandardGrid();
                this.appendDateGrid();

                //If opt.showExtraRelative => add extra grid with relative labels and no ticks
                if (opt.showExtraRelative){
                    this._prettify = this._prettifyRelative;
                    this._prettifyLabel = this._prettifyLabelRelative_full;

                    var saveMajorTicksOffset = opt.majorTicksOffset;
                    opt.majorTicksOffset = 0;

                    appendSpecialGrid({
                        noGridColorId       : 'noGridColorsOnExtraRelative',
                        noLabelColorsId     : 'noLabelColorsOnExtraRelative',
                        gridClassNameId     : 'extraRelativeGridClassName',
                        noExtendGridColorsId: 'noExtendedGridColorsOnExtraRelative',
                        newLabels           : true
                    });

                    opt.majorTicksOffset = saveMajorTicksOffset;
                }


                if (
                    ( (opt.format.timezone != 'utc') || opt.format.forceUTC || opt.forceUTC) &&
                    (opt.format.showUTC || opt.showUTC)
                    ){
                    //Create the hour-grid and the date-grid for utc
                    opt.majorTicksOffset = -1*now.tzMoment( 'utc' ).hours();
                    var saveTimezone = opt.format.timezone;
                    opt.format.timezone = 'utc';
                    this._prettify = this._prettifyAbsolute;
                    this._prettifyLabel = this._prettifyLabelAbsolute;

                    appendSpecialGrid({
                        noGridColorId       : 'noGridColorsOnUTC',
                        noLabelColorsId     : 'noLabelColorsOnUTC',
                        gridClassNameId     : 'UTCGridClassName',
                        noExtendGridColorsId: 'noExtendedGridColorsOnUTC',
                        newLabels           : false
                    });

                    this.appendDateGrid( textOptions, tickOptions );
                    this.$currentGrid.addClass(opt.format.UTCGridClassName || opt.UTCGridClassName || '');

                    opt.format.timezone = saveTimezone;
                }
            }
        },

        /**************************************************************
        _updateOptionsFormat
        ***************************************************************/
        _updateOptionsFormat: function( format = {} ){
            $.extend( true, this.options.format, format );

            var forceFormat = this.useMomentDateFormat ? null : this.options.format.date;

            //Merge current moment.simpleFormat.options into this.options.format
            $.extend( true, this.options.format, moment.sfGetOptions() );

            if (forceFormat)
                this.options.format.date = forceFormat;

            //Create the format for the label over the 'dragger'
            var dateFormat = '';

            switch (this.options.format.date + (this.options.format.showYear ? '_Y' : '')){
                case 'DMY'  : dateFormat = 'DD. MMM';       break;
                case 'DMY_Y': dateFormat = 'DD. MMM YYYY';  break;
                case 'MDY'  : dateFormat = 'MMM DD';        break;
                case 'MDY_Y': dateFormat = 'MMM DD YYYY';   break;
                case 'YMD'  : dateFormat = 'MMM DD';        break;
                case 'YMD_Y': dateFormat = 'YYYY MMM DD';   break;
            }

            this.options.format.dateHourFormat = dateFormat + ' ' + moment.sfGetTimeFormat();

            //Set dateformat = '' to make appendDateGrid find new format
            this.options.format.dateFormat = '';

            //Find small date format used on hour grid
            this.options.format.dateFormat_small = this.options.format.date == 'DMY' ? 'DD-MM' : 'MM-DD';

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
            this.options.maxLabelWidth = 0;

            this._updateOptionsFormat( format );
            this.update();
        },
    };
    window.TimeSlider.prototype = $.extend( {}, window.BaseSlider.prototype, window.TimeSlider.prototype );

}(jQuery, this, document));
