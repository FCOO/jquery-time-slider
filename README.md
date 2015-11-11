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

where `options` are descript below

## options

The `options` are the same as in [jquery-base-slider](https://github.com/FCOO/jquery-base-slider) with the following extensions 

	{
	  minMoment :...,
	  maxMoment :..., 
	  fromMoment:...,
	  toMoment  :...,
	  step_offset_moment: ..,
	  display: {
		from: {...},
		to  : {...}
      },	
	  format: {...},
	  text  : {...}
	}
   

<table>
<thead>
<tr>
  <th>Option</th>
    <th>Defaults</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
<tr>
<tr>
<td>minMoment, maxMoment, fromMoment, toMoment</td>
<td></td>
<td>moment-object</td>
<td>Same as min, max, from, to in <code>jquery-base-slider</code> but as moment-object
</tr>
<td>step_offset_moment</td>
<td>null</td>
<td>moment-object</td>
<td>Moment-object used when <code>options.step</code>>1 to calculate <code>options.step_offset</code> so that <code>options.step_offset_moment</code> is selectable</td>
</tr>
<tr>
<td>display.from<br>display.to</td>
<td>null</td>
<td>JSON-object</td>
<td>Contains tree entries <code>tzElement, utcElement, relativeElement</code> and contains a element or a jquery search-string to the elements that would be updated with the selected moment as a string in the different 'modes': selected timezone, utc and relative</td>
</tr>
<tr>
<td>format.date</td>
<td>'DMY'</td>
<td>string</td>
<td>Date format. 'DMY' | 'MDY' | 'YMD'</td>
</tr>
<tr>
<td>format.time</td>
<td>'24'</td>
<td>string</td>
<td>Time format. '12' | '24'</td>
</tr>
<tr>
<td>format.timezone</td>
<td>'local'</td>
<td>string</td>
<td>'local', 'utc' or abbreviation of time zone. Only if <code>showRelative: false</code></td>
</tr>
<tr>
<td>format.showUTC</td>
<td>false</td>
<td>boolean</td>
<td>When true a scale for utc is also shown.Only if <code>showRelative: false</code></td>
</tr>
<tr>
<td>format.text</td>
<td><code>{hourAbbr:'h', minAbbr:'m',<br>now:'now', to:'to'}</code></td>
<td></td>
<td>Text used to format the date</td>
</tr>
<tr>
<td>format.showRelative</td>
<td>false</td>
<td>boolean</td>
<td>If true the grid shows relative time and date instaed of absolute</td>
</tr>
</tbody>
</table>


## Methods
	.setFormat( format ); //Update the slider with the new format

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-time-slider/LICENSE).

Copyright (c) 2015 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk


## Credits and acknowledgements


## Known bugs

## Troubleshooting

## Changelog



