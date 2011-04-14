/*
* jQuery UI select2autocomplete
*
* Copyright (c) 2011, 2degrees Limited <egoddard@tech.2degreesnetwork.com>.
* All Rights Reserved.
*
* This file is part of jquery.select2autocomplete
* <https://github.com/2degrees/jquery.select2autocomplete>, which is subject to
* the provisions of the BSD at 
* <http://dev.2degreesnetwork.com/p/2degrees-license.html>. A copy of the
* license should accompany this distribution. THIS SOFTWARE IS PROVIDED "AS IS"
* AND ANY AND ALL EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED, INCLUDING, BUT
* NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST
* INFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE.
*
* Depends:
* jquery.ui.core.js
* jquery.ui.widget.js
*/

(function($, undefined) {

$.widget('ui.select2autocomplete', {
	options: {
		max_suggestions: 10
	},
	_create: function () {
		var has_initial_selection = false,
		    self = this;
            
		this.labels_by_value = {};
		this.id = this.element.attr('id') || this._make_random_id(); 
		this.current_selection = $('<span />').addClass('s2ac-current-selection');
        this.input = $('<input />').addClass('s2ac-input').attr("autocomplete", "off");
		this.suggestions = $('<ol />').addClass('s2ac-suggestions');
		
		this.element.hide()
		            .after(this.input, this.suggestions, this.current_selection);
		
		// Iterate over the options in the select and convert them into an a
		// sorted list of lower-case labels and an object of values keyed off
		// the label (real case!):
        this.element.children('option').each(function (index, option) {
            var $option = $(option),
                label = $option.text(),
                value = $option.val();
            
            if (!label) {
                // we can't have blank labels (or indeed undefined labels:
                $.error('Cannot continue with setting up autocomplete - missing option label for value "' + value + '"');                           
            }
            self.labels_by_value[value] = label;
            
            // See whether we need to set the currently chosen option:
            if (!has_initial_selection && $option.attr('selected')) {
                self.current_selection.text(label);
                has_initial_selection = true;
            }
		});
			
		// bind all events:
        self.input.bind('keyup.select2autocomplete', function (event) {
			var results = [],
                current_value = self.input.val(),
				keyCode = $.ui.keyCode,
				active_option,
				hits;

			switch (event.keyCode) {
                case keyCode.UP:
                    self.set_selection(-1);
					event.preventDefault();
                    return;
                case keyCode.DOWN:
                    self.set_selection(1);
					event.preventDefault();
                    return;
                case keyCode.ESCAPE:
                    self.hide_suggestions();
                    return;
                case keyCode.ENTER:
				case keyCode.NUMPAD_ENTER:
				    
					// If there is a currently active suggestion, select it:
					$active_option = self.suggestions.children('.s2ac-active');
					
					if ($active_option.length) {
					    // Ensure that we don't get any accidental form submission:
						event.preventDefault();
						$active_option.trigger('mousedown');
					}
                    return;
            }
            
            self.suggestions.children().remove().end().show();
            
            if (!current_value || /^\W+$/.test(current_value)) {
                // don't bother to search as the value is just whitespace:
				self.hide_suggestions();
                return;
            }
			
			hits = self.search(current_value);
			
			if (!hits.length) {
				// if there are no hits, hide the suggestions:
				self.hide_suggestions();
                return;
			}
            
            $.each(hits, function (index, result) {
                var $result = $('<li />', {'class': 's2ac-result', 'data-value': result[0], text: result[1]});
                $result.bind('mousedown.select2autocomplete', function (event) {
					setTimeout(function () {
						clearTimeout(self.closing);
						}, 13);
					
					var value_to_select = $result.attr('data-value'),
					    label = $result.text();
					
					// Unselect the currently selected option:
					self.element.children(':selected').removeAttr('selected');
					
					// Select the new item:
					self.element.children('[value=' + value_to_select + ']').attr('selected', 'selected');
					
					// Update the currently selected label:
					self.current_selection.text(label);
					
					// Hide the suggestions:
					self.hide_suggestions();
					
					self.input.val('');
					
				});
                results.push($result);
            });
            
            self.suggestions.append.apply(self.suggestions, results);
		}).bind('blur.select2autocomplete', function (event) {
			self.closing = setTimeout(function () {
                self.hide_suggestions();
            }, 150);
		});
	},
	_destroy: function() {
		this.element.show();
		this.suggestions.remove();
		this.input.remove();
		this.current_selection.remove();
	},
	search: function(label) {
        // Search for ``value`` in the ``labels_by_value`` and return the first
        // ``max_hits`` (value, label) pairs which correspond to the match
        
        var max_hits = this.options.max_suggestions,
            lower_label = label.toLowerCase(), 
            found_values = [];
        
        $.each(this.labels_by_value, function (value, consider_label) {
            
            if (consider_label.toLowerCase().indexOf(lower_label) !== -1) {
                found_values.push([value, consider_label]);
                if (found_values.length >= max_hits) {
                    return false; // break
                }
            } 
        });
        
        return found_values;
	},
	hide_suggestions: function () {
        this.suggestions.hide().html('');
    },
	set_selection: function (shift) {
        var $children = this.suggestions.children(), 
            shift = $.type(shift) === 'number' ? shift : 1,
            choice_count = $children.length,
            current_index,
			is_selection_moved = false,
            new_index = -1;
        
        $children.each(function(index, child) {
            var $child = $(child);
			
            if ($child.hasClass('s2ac-active')) {
                is_selection_moved = true;
                new_index = (index + shift) % choice_count;
                
                if (new_index < 0) { // negative indexing isn't supported
                    new_index += choice_count;
                }
                
                $child.removeClass('s2ac-active');
                return false; // break
            }
        });
        
        new_index = (new_index >= 0) ? new_index : 0
        $children.eq(new_index).addClass('s2ac-active');
    },
	_debug: function () {
		window.console && console.debug.apply(console, arguments);
	},
	_make_random_id: function () {
        // make a random ID for when no ID is set on the original select:
        return Math.random().toString(16).slice(2, 10);
    }
});


})(jQuery);