/*
  @author: Mathieu Sylvain / http://hibe.com
  @url: http://hibe.com
  @usage: jTag(); // applied tags to be used for all implementations
          $('div.jTags').jTag(options);
          The targeted elements are ul/li structures containing a list of tags
  @license: Copyrights Shopmedia 2009
  @version: 0.1

 See the default settings at the bottom for more reference on how to customize this plugin
 via the options.

*/

(function($){
$.fn.jTag = function(options) {

	// Extends the default options with the users parameters
	var opts = $.extend({}, $.fn.jTag.defaults, options);

	// Initialize the plugin
	function init($this){
		// iterate and reformat each matched element
		return $this.each(function() {
			var $this = $(this);

			$this.tagList = $(opts.tagListSelector, $this);
			$this.inputPlaceholder = $(opts.inputSelector, $this)

			// Create, Append and the bind the events for the "Add/Remove Tags" button
			$this.inputEditButton = opts.inputEditButtonTemplate()
			$this.inputPlaceholder.append($this.inputEditButton);
			$(opts.editButtonSelector, $this.inputEditButton).click(function(e){
				e.preventDefault();
				$this.inputEditButton.hide();
				redraw_tags_in_edit_mode($this);
				inputForm.show();
			})

			$this.isEmpty = opts.ifEmptyTemplate();
			$this.inputEditButton.prepend($this.isEmpty);
	
			// Create, Append and the bind the events for the input form
			var inputForm = opts.inputFormTemplate()
			$this.append(inputForm);
			inputForm.hide();
			$(opts.closeButtonSelector, inputForm).click(function(e){
				e.preventDefault();
				$this.inputEditButton.show();
				redraw_tags_in_view_mode($this);
				inputForm.hide();
			})
	
			// Create, Append and the bind the events for the add button which is inside the input form
			$(".jTagAdd", $this).click(function(e){
				e.preventDefault();
				var label = $(opts.inputFieldSelector, $this).val();
				tryAddTags($this.tagList, $(opts.tagListSelector, $this), label);
				$(opts.inputFieldSelector, $this).val("");
			})

			// Redraw the initial tags using the "view mode" template
			$("a", $this).addClass("jTagLabel");
			redraw_tags_in_view_mode($this);
	
			// Intercept the "Enter" keypress to add keywords
			$(opts.inputFieldSelector, $this).keypress(function(e){ inputField_onKeypress(e, $this) })
		})
	}

	// The even bound on the input field keypress
	function inputField_onKeypress(e, $this) {
		if (e.which == 13) {
			e.preventDefault();
			var label = $(opts.inputFieldSelector, $this).val();
			tryAddTags($this.tagList, $(opts.tagListSelector, $this), label);
			$(opts.inputFieldSelector, $this).val("");
		}
	}

	// Redraws all tags in "Edit" mode using the Template provided in the options
	function redraw_tags_in_edit_mode($this){
		$("li", $this).each(function(e){
			var tagElem = $(this);
			var label = $(".jTagLabel", $(tagElem)).attr("alt");
			var newTagElem = opts.tagEditTemplate(label);
			$(tagElem).replaceWith(newTagElem);
			bind_remove_onClick(newTagElem, label);
			$(opts.inputFieldSelector, $this).val("");
		})
	}

	// Redraws all tags in "View" mode using the Template provided in the options
	function redraw_tags_in_view_mode($this){
		tags = $("li", $this);
		tags.each(function(){
			var tagElem = $(this);
			var label = ($(".jTagLabel", $(tagElem)).attr("alt")+"").toLowerCase();
			newTagElem = opts.tagViewTemplate(label);
			$(tagElem).replaceWith(newTagElem);
		});
		if (tags.length > 0) { $this.isEmpty.hide() }
		else { $this.isEmpty.show() };
	}

	// Start trying to add a set of tags, but only do it if there is a success
	function tryAddTags($this, elem, labelStr){
		var labelStr = $.trim(labelStr.toLowerCase());
		if (labelStr != "") {
			var labelsArray = labelStr.split(",");
			// Remove empty strings
			var cleanArray = []
			for (item in labelsArray) {
				if (labelsArray[item]+""!="") cleanArray.push(labelsArray[item]);
			}
			labelsArray = cleanArray;
		}

		opts.onAddTags(labelsArray, function(data){
			if (data.result == "success") {
				doAddTags($this, elem, data.tags);
			} else {
				opts.onAddTagsFailed(data, label);
			}
		})
	}

	// Actually add the list of new tags in the <ul>/<li> list
	function doAddTags($this, tagListElem, labelsArray){
		var label;
		var duplicateLabel;
		for (labelIndex in labelsArray) {
			label = $.trim(labelsArray[labelIndex]);
			duplicateLabel = $(" .jTagLabel[alt=" + label+ "]", $($this.tagList));
			if (duplicateLabel.length > 0) {
				duplicateLabel.fadeOut(50).fadeIn(350).fadeOut(50).fadeIn(350).fadeOut(50).fadeIn(350);
			} else {
				newTagElem = opts.tagEditTemplate(label);
				$(tagListElem).append(newTagElem.hide().fadeIn(300));
				bind_remove_onClick(newTagElem, label);
			}
		}
	}

	// Tries to remove a tag, via the 
	function tryRemoveTag(elem, label){
		opts.onRemoveTag(label, function(data){
			if (data.result == "success") {
				doRemoveTag(elem, label);
			} else {
				opts.onRemoveTagFailed(data, label);
			}
		})
	}
	// Method call actually called to remove the tags from the <ul>/<li> tag
	function doRemoveTag(elem, label){
		$(elem).fadeOut(300, function(){
			$(elem).remove();
		});
	}

	// Bind the delete action on a newly created tag in "edit mode"
	function bind_remove_onClick(newTagElem, label) {
		$(".jTagRemove", newTagElem).click(function(e){
			e.preventDefault();
			tryRemoveTag(newTagElem, label);
		})
	}
	
	init(this);
};

// Default settings for jTag
$.fn.jTag.defaults = {
	tagListSelector: "ul",
	tagSelector: "li",
	tagRemoveSelector: ".jTagRemove",
	editButtonSelector: ".jTagEdit",
	closeButtonSelector: ".jTagClose",
	inputSelector: ".jTagInput",
	inputFieldSelector: ".jTagInputField",
	ifEmptyTemplate: function(tag){
		return $("<div><p>No tags have been added!</p></div>");
	},
	tagViewTemplate: function(tag){
		return $("<li><a class='jTagLabel' href='#" + tag + "' alt='" + tag + "'>" + tag + "</a></li>");
	},
	tagEditTemplate: function(tag){
		return $("<li><a class='jTagLabel' alt='" + tag + "'>" + tag + "</a> <a href='#' class='jTagRemove'>[x]</a></li>");
	},
	inputFormTemplate: function(tag){
		return $("<div>Use commas to separate tags:<br/><input class='jTagInputField' /><button class='jTagAdd'>Add</button><a href='#' class='jTagClose'>Close</button></a>");
	},
	inputEditButtonTemplate: function(tag){
		return $("<div><button class='jTagEdit'>Add/Remove tags</button></div>");
	},
	onRemoveTag: function(tag, callback) { 	callback({"result": "success"}) },
	onRemoveTagFailed: function(data) {},
	onAddTags: function(tags, callback) { callback({"result": "success", "tags": tags}) },
	onAddTagsFailed: function(data) {}
};
})(jQuery);

