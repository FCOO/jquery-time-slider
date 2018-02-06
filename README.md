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

	{
	  minMoment :...,
	  maxMoment :..., 
	  fromMoment:...,
	  toMoment  :...,
	  valueMoment  :...,
	  display: {
		value: {...},
		from: {...},
		to  : {...}
      },	
	  format: {...},
	  text  : {...}
	}
   

| Option | Defaults | Type | Description |
| :--: | :--: | :--: | :-- |
| `minMoment`<br>`maxMoment`<br>`fromMoment`<br>`toMoment` | | `moment-object` | Same as min, max, from, to in `jquery-base-slider` but as moment-object |
| `display.value`<br>`display.from`<br>`display.to` | `null` | `JSON-object` | Contains tree entries `tzElement, utcElement, relativeElement` and contains a element or a jquery search-string to the elements that would be updated with the selected moment as a string in the different 'modes': selected timezone, utc and relative  | 
| `format.date` | `"DMY"` | `string` | Date format. `"DMY"` or `"MDY"` or `"YMD"` |
| `format.time` | `"24"` | `string` | Time format. `"12"` or `"24"` |
| `format.timezone` | `"local"` | `string` | `"local"` or `"utc"` or abbreviation of time zone. Only if `showRelative: false` |
| `format.showUTC` | `false` | `boolean` | When true a scale for utc is also shown.Only if `showRelative: false` |
| `format.text` | `{hourAbbr:"h",`<br>`minAbbr:'m'`<br>`now:'now',`<br>`to:'to'}` | Text used to format the date |
| `format.showRelative` | `false` | `boolean` | If `true` the grid shows relative time and date instead of absolute |


## Methods
	.setFormat( format ); //Update the slider with the new format

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-time-slider/LICENSE).

Copyright (c) 2015 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk

