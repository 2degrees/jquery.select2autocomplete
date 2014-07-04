jQuery plugin to convert select elements into an autocomplete widget

Usage
=====

Either include the file after jQuery and jQuery UI:

``` html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery.ui.js"></script>
<script src="/path/to/jquery.select2autocomplete.js"></script>
```

or use it as an AMD module:

``` javascript
require(['jquery', 'jquery.select2autocomplete'], function ($) {
  $(function () {
    $(...).select2autocomplete();
  });
});
```

*NB* This relies on jQuery UI being available under the name 'jquery.ui'.
