# jquery-base-slider

A plugin to create a slider.


## Fork
jquery-base-slider is forked from the great work by [Denis Ineshin ](https://github.com/IonDen) on [Ion.Range Slider](https://github.com/IonDen/ion.rangeSlider)
jquery-base-slider is based on version **2.0.6**

Please see the <a href="readme.ORG.md">original README.md</a> for how to use the ion.range.slider

In jquery-base-slider some of the original options have been removed and some new one added. Se the Settings section for a complete list

## New features
Compared with the original slider there are the following new features
1. The css is created using SASS
2. Four types of sliders (`default`, `small`, `round` and `range`)
2. The slider is resizeable using only `rem` as size unit
3. Automatic placement of minor ticks, major ticks and text/label
3. The slider will *not* recalculate grid when the container changes size
3. Possible to add more than one grid
4. Adding buttons to move from- and/or to-slider to previous, next, first or last value 
5. Click on text will move the slider
6. All settings is set using `options` No settings using `data-..` attribute on the `input`-element
7. New options: `pin_value`, = a value where a small pin is placed. NB: Only when `options.slider == 'range'`. 



## Installation
### bower
`bower install https://github.com/NielsHolt/jquery-base-slider.git --save`


## Settings

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
            <td>type</td>
            <td>"single"</td>
            <td>string</td>
            <td>Choose single or double, could be <code>single</code> - for one handle, or <code>double</code> for two handles</td>
        </tr>
        <tr>
            <td>slider</td>
            <td>"default"</td>
            <td>string</td>
            <td>Choose slider type, could be <code>default</code>, <code>small</code>, <code>round</code>, or <code>range</code>					
		</td>
        </tr>
   
        <tr>
            <td>min</td>
            <td>10</td>
            <td>number</td>
            <td>Set slider minimum value</td>
        </tr>
        <tr>
            <td>max</td>
            <td>100</td>
            <td>number</td>
            <td>Set slider maximum value</td>
        </tr>
        <tr>
            <td>from</td>
            <td>min</td>
            <td>number</td>
            <td>Set start position for left handle (or for single handle)</td>
        </tr>
        <tr>
            <td>to</td>
            <td>max</td>
            <td>number</td>
            <td>Set start position for right handle</td>
        </tr>
        <tr>
            <td>pin_value</td>
            <td>null</td>
            <td>number</td>
            <td>The value for the pin. Only when <code>options.slider = 'range'</code><br>Use <code>setPin( value [, color] )</code> to change the value dynamical</td>
        </tr>

        <tr>
            <td>step</td>
            <td>1</td>
            <td>number</td>
            <td>Set sliders step. Always > 0. Could be fractional.</td>
        </tr>

        <tr>
            <td>min_interval</td>
            <td>-</td>
            <td>number</td>
            <td>Set minimum diapason between sliders. Only in "double" type</td>
        </tr>
        <tr>
            <td>max_interval</td>
            <td>-</td>
            <td>number</td>
            <td>Set maximum diapason between sliders. Only in "double" type</td>
        </tr>

        <tr>
            <td>from_fixed</td>
            <td>false</td>
            <td>boolean</td>
            <td>Fix position of left (or single) handle.</td>
        </tr>
        <tr>
            <td>from_min</td>
            <td>min</td>
            <td>number</td>
            <td>Set minimum limit for left handle.</td>
        </tr>
        <tr>
            <td>from_max</td>
            <td>max</td>
            <td>number</td>
            <td>Set the maximum limit for left handle</td>
        </tr>

        <tr>
            <td>to_fixed</td>
            <td>false</td>
            <td>boolean</td>
            <td>Fix position of right handle.</td>
        </tr>
        <tr>
            <td>to_min</td>
            <td>min</td>
            <td>number</td>
            <td>Set the minimum limit for right handle</td>
        </tr>
        <tr>
            <td>to_max</td>
            <td>max</td>
            <td>number</td>
            <td>Set the maximum limit for right handle</td>
        </tr>
        <tr>
            <td>prettify</td>
            <td>null</td>
            <td>function</td>
            <td>Set up your prettify function. Can be anything. For example, you can set up unix time as slider values and than transform them to cool looking dates.</td>
        </tr>
        <tr>
            <td>prettify_text</td>
            <td>null</td>
            <td>function</td>
            <td>As <code>prettify</code> but for the text/labels in the grid.</td>
        </tr>

        <tr>
            <td>keyboard_step</td>
            <td>5</td>
            <td>number</td>
            <td>Movement step, than controling from keyboard. In percents.</td>
        </tr>
        <tr>
            <td>callback_on_dragging</td>
            <td>true</td>
            <td>boolean</td>
            <td>If false the callback-function is only called when dragging the sliding is finish.</td>
        </tr>
        <tr>
            <td>callback_delay</td>
            <td>500</td>
            <td>number</td>
            <td>If <code>callback_on_dragging</code> is false the <code>callback</code> is called when the slider has been on the same tick for <code>callback_delay</code> milliseconds. Set to zero to avoid any callback before mouseup-event</td>
        </tr>
        <tr>
            <td>grid</td>
            <td>false</td>
            <td>boolean</td>
            <td>Enables grid of values.</td>
        </tr>
        <tr>
            <td>grid_num</td>
            <td>4</td>
            <td>number</td>
            <td>Number of grid units.</td>
        </tr>
		<tr>
	         <td>impact_line</td>
            <td>false</td>
            <td>boolean</td>
            <td>The line on a double slider is coloured as<br>green-[slider]-yellow-[slider]-red</td>
        </tr>
	 	<tr>
            <td>impact_line_reverse</td>
            <td>false</td>
            <td>boolean</td>
            <td>The line on a double slider is colored as<br>red-[slider]-yellow-[slider]-green</td>
        </tr>
	 	<tr>
            <td>hide_bar_color</td>
            <td>false</td>
            <td>boolean</td>
            <td>The bar gets same color as the line</td>
        </tr>
        
		<tr>
            <td>ticks_on_line</td>
            <td>false</td>
            <td>boolean</td>
            <td>Place the ticks in the (first) grid on the line with the sliders.</td>
        </tr>
		<tr>
            <td>hide_minor_ticks</td>
            <td>false</td>
            <td>boolean</td>
            <td>Hide minor ticks.</td>
        </tr>

        <tr>
            <td>hide_min_max</td>
            <td>true</td>
            <td>boolean</td>
            <td>Hides min and max labels</td>
        </tr>
        <tr>
            <td>hide_from_to</td>
            <td>false</td>
            <td>boolean</td>
            <td>Hide from and to lables</td>
        </tr>
        <tr>
            <td>marker_frame</td>
            <td>false</td>
            <td>boolean</td>
            <td>Frame the from- and to-marker</td>
        </tr>
        <tr>
            <td>prefix</td>
            <td>-</td>
            <td>string</td>
            <td>Set prefix for values. Will be set up right before the number: $100</td>
        </tr>
        <tr>
            <td>postfix</td>
            <td>-</td>
            <td>string</td>
            <td>Set postfix for values. Will be set up right after the number: 100k</td>
        </tr>
        <tr>
            <td>max_postfix</td>
            <td>-</td>
            <td>string</td>
            <td>Special postfix, used only for maximum value. Will be showed after handle will reach maximum right position. For example 0 - 100+</td>
        </tr>
        <tr>
            <td>decorate_both</td>
            <td>true</td>
            <td>boolean</td>
            <td>Used for "double" type and only if prefix or postfix was set up. Determine how to decorate close values. For example: $10k - $100k or $10 - 100k</td>
        </tr>
        <tr>
            <td>decorate_text</td>
            <td>false</td>
            <td>boolean</td>
            <td>The text/labels in the grid also gets <code>prefix</code> and/or <code>postfix</code></td>
        </tr>
        <tr>
            <td>disable</td>
            <td>false</td>
            <td>boolean</td>
            <td>Locks slider and makes it inactive.</td>
        </tr>

        <tr>
            <td>callback</td>
            <td>null</td>
            <td>function</td>
            <td>Is called when the <code>from</code> or <code>to</code> value are changed.</td>
        </tr>
        <tr>
            <td>onStart</td>
            <td>null</td>
            <td>function</td>
            <td>Callback. Is called on slider start.</td>
        </tr>
        <tr>
            <td>onChange</td>
            <td>null</td>
            <td>function</td>
            <td>Callback. IS called on each values change.</td>
        </tr>
        <tr>
            <td>onFinish</td>
            <td>null</td>
            <td>function</td>
            <td>Callback. Is called than user releases handle.</td>
        </tr>
        <tr>
            <td>onUpdate</td>
            <td>null</td>
            <td>function</td>
            <td>Callback. Is called than slider is modified by external methods <code>update</code> or <code>reset</code>.</td>
        </tr>
        <tr>
            <td>buttons</td>
            <td>null</td>
            <td>JSON</td>
            <td>JSON-record with id or buttons for first, previous, (now,) next, and last value<br><code>{from: {buttonList}, to: {buttonList}}<br>{buttonList}=<br>{<br>  firstBtn: element or string,<br>previousBtn: element or string,<br>nowBtn: element or string,<br>nextBtn: element or string,<br>lastBtn: element or string<br>}</code>
		</td>
        </tr>
    </tbody>
</table>




## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/NielsHolt/jquery-base-slider/LICENSE).

Copyright (c) 2015 [Niels Holt](https://github.com/NielsHolt)

## Contact information

Niels Holt <niels@steenbuchholt.dk>


## Credits and acknowledgements

Based on [Ion.Range Slider](https://github.com/IonDen/ion.rangeSlider) version **2.0.6** by [Denis Ineshin ](https://github.com/IonDen)

## Known bugs

## Troubleshooting

## Changelog



