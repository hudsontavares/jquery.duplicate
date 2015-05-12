# jquery.duplicate
A plugin that allows you define reproducable fields following a pattern that you define once.

This plugin has been tested with jQuery 1.11. I believe it can run on older and newer versions without problems.
In order to work properly, you must add the jQuery library and the component code on your HTML page, as shown below:

<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<script type="text/javascript" src="jquery.duplicate.js"></script>

(The best place to put your scripts is before the closing body tag (</body>))

The basic usage

Considering the following markup:

...
<ul id="my-duplicable">
  <li class="clonable">
    This line has been duplicated {current_index} time(s).
  </li>
</ul>
...

You can init it easily, calling:
...
$('#my-duplicable').duplicate();
...

It's important to say you always bind the duplicate funcionality to the main holder.
Parameters can be set by passing an object to the duplicate() call.
