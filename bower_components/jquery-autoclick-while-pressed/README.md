jquery-autoclick-while-pressed
==============================
jquery-autoclick-while-pressed is a jQuery plugin that "autoclicks" elements (e.g. buttons) at a specified interval, as long as the user holds the mouse button pressed over them.

Usage
-----
In your HTML file, after the place where you include jQuery, include the _autoclick-while-pressed.min.js_ file:

```html
<script src="path/to/autoclick-while-pressed.min.js"></script>
```

Then, in your JavaScript code, you can use it like this:

```js
$("#my-button").autoclickWhilePressed();
```

or

```js
$("#my-button").autoclickWhilePressed(options);
```

where _options_ is an object which may have the following properties:

- _intervalLength_ (default: 50) - miliseconds to wait between "autoclicks".
- _initialDelay_ (default: 300) - miliseconds to wait before enabling the "autoclicking" behavior, after the user started to hold the mouse button.
- _eventToTrigger_ (default: "click") - name of the jQuery event to trigger on every "autoclick". The default is "click", which means that autoclicks behave just like clicks. You can change this to a custom event name such as "autoclick" to handle autoclicks and user clicks in different ways.

For a demonstration, see the _demo_ directory.

For developers
--------------
The compressed JS file _autoclick-while-pressed.min.js_ is created using [UglifyJS](https://github.com/mishoo/UglifyJS2/):

```sh
uglifyjs autoclick-while-pressed.js -m -c -o autoclick-while-pressed.min.js
```

License
-------
   Copyright 2013 Silviu Bogan

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
