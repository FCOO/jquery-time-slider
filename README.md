# jquery-time-slider

## Description
A extension to jquery-base-slider with selection of time and date

A plugin to create sliders with selection of time.
There are four different types:

There are four different types:

1. Simple time selection: <br>options = `{type: "single", format: { ..., showRelative:false } }`
2. Relative time selection (eq. `Now + 5 hours`): <br>options = `{type: "single", format: { ..., showRelative:true } }`
3. Time period:<br>options = `{type: "double", format: { ..., showRelative:false } }`
4. Relative time period (eq. `Now - 3 hours to Now + 10 hours`): <br>options = `{type: "double", format: { ..., showRelative:true } }`

## Installation
### bower
`bower install https://github.com/FCOO/jquery-time-slider.git --save`

## Demo
http://FCOO.github.io/jquery-time-slider/demo/

## Usage
    $('#timeSliderId').timeSlider( options )

where `options` are described below

## options

The `options` are the same as in [jquery-base-slider](https://github.com/FCOO/jquery-base-slider) with the following extensions

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


## Methods
	.setFormat( format ); //Update the slider with the new format

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-time-slider/LICENSE).

Copyright (c) 2015 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk

