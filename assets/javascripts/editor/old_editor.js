
// Grabbed the basis of this code from Markitup by Jay Salvat (http://markitup.jaysalvat.com/)
//   specifically https://github.com/markitup/1.x/blob/master/markitup/jquery.markitup.js

// the code in this file is MIT licensed

// contributors:
//   Carl Maxwell (http://carlmaxwell.ninja/)

// (someday I'll get around to releasing the flower editor separately from mythos.ninja,
//   I just haven't gotten around to it yet)

(function(flower) {
  // this only covers ASCII

  var printableCharactersPattern = '[^\\x00-\\x20\\x7f-\\xFF]';
  var printableCharacters = new RegExp(printableCharactersPattern);

  flower.init = function(outer_textarea) {
    var flower_inst = {};

    (function(flower_inst) {
      var textarea = outer_textarea[0];
      var caretPosition = 0;
      var selection = "";

      var word = function(doNotSet) {
        //expand selection backwards
        for (
          var x = caretPosition;
          x > 0 && textarea.value[x-1].match(printableCharacters) !== undefined;
          x--
        ) {}

        // expand selection forwards
        for (
          var i = caretPosition + selection.length;
          textarea.value[i].match(printableCharacters) !== undefined &&
            i < textarea.value.length;
          i++
        ) {}

        if (doNotSet) {
          return textarea.value.substr(x, i - x);
        } else {
          set(x, i - x);

          return get();
        }
      };

      var paragraph = function(doNotSet) {
        //expand selection backwards
        for (
          var x = caretPosition;
          x > 0 && textarea.value[x-1] != '\n';
          x--
        ) {}

        // expand selection forwards
        for (
          var i = caretPosition + selection.length;
          textarea.value[i] != '\n' && i < textarea.value.length;
          i++
        ) {}

        if (doNotSet) {
          return textarea.value.substr(x - 1, i - x + 1);
        } else {
          set(x - 1, i - x);

          return get();
        }
      };

      var updateSelection = function() {
        scrollPosition = textarea.scrollTop;
        if (document.selection) {
          selection = document.selection.createRange().text;
          if (browser.msie) {
            // ie
            var range = document.selection.createRange();
            var rangeCopy = range.duplicate();

            rangeCopy.moveToElementText(textarea);

            caretPosition = -1;
            while(rangeCopy.inRange(range)) {
              rangeCopy.moveStart('character');
              caretPosition++;
            }
          } else {
            // opera
            caretPosition = textarea.selectionStart;
          }
        } else {
          // gecko & webkit
          caretPosition = textarea.selectionStart;

          selection = textarea.value.substring(caretPosition, textarea.selectionEnd);
        }
      };

      var get = function(scale) {
        textarea.focus();
        updateSelection();

        if (scale) {
          return scale(selection);
        }

        return selection;
      };

      var set = function(start, len) {
        if (textarea.createTextRange) {

          // quick fix to make it work on Opera 9.5
          if (browser.opera && browser.version >= 9.5 && len == 0) {
            return false;
          }

          range = textarea.createTextRange();
          range.collapse(true);
          range.moveStart('character', start);
          range.moveEnd('character', len);
          range.select();
        } else if (textarea.setSelectionRange ) {
          textarea.setSelectionRange(start, start + len);
        }
        //textarea.scrollTop = scrollPosition;
        textarea.focus();
      };

      //
      // Public Methods
      //

      flower_inst.insert = function(block) {
        if (document.selection) {
          var newSelection = document.selection.createRange();
          newSelection.text = block;
        } else {
          textarea.value =
            textarea.value.substring(0, caretPosition) +
            block +
            textarea.value.substring(caretPosition + selection.length, textarea.value.length);
        }
      };

      flower_inst.wrap = function(node, closeNode, name) {
        closeNode = typeof(closeNode) != 'undefined' ? closeNode : node;

        updateSelection();

        selectLength = word(true).length;

        if (selectLength) {
          if (this.inWrappings(name)) {
            word();
            this.insert(unwrap(word(true), node, closeNode));

            set(caretPosition, selectLength - (node.length + closeNode.length));

            return;
          } else {
            word();
            this.insert(node + get(word) + closeNode);
          }
        } else {
          this.insert(node + closeNode);
        }

        set(caretPosition + node.length, selectLength);
      };

      flower_inst.contain = function(marker) {
        // expand selection to include whole paragraph(s)

        var text = get(paragraph);

        this.insert( text.replace(/\n/g, '\n' + marker) );
      };

      //
      //
      //

      flower_inst.inWrappings = function(name) {
        return this.wrappings().indexOf(name) != -1;
      };

      flower_inst.wrappings = function() {
        // returns a list of nodes effecting the selection
        updateSelection();

        var w = word(true);
        var p = paragraph(true);

        wraps = [];

        for (var name in flower.nodes) {
          node = flower.nodes[name];

          if (isWrapped(node.action == 'wrap' ? w : p, node.markup, node.closingMarkup)) {
            wraps.push(name);
            w = unwrap(w, node.markup, node.closingMarkup);
          }
        }

        return wraps;
      };

      flower_inst.isWrapped = isWrapped;
      flower_inst.paragraph = paragraph;
      flower_inst.word      = word;
    } )(flower_inst);

    return flower_inst;
  };

  //
  // 'private' methods
  //

  var isWrapped = function(str, node, closeNode) {
    closeNode = typeof closeNode != 'undefined' ? closeNode : node;

    node      = node     .split("").map( function(a) { return "\\" + a; } ).join("");
    closeNode = closeNode.split("").map( function(a) { return "\\" + a; } ).join("");

    var leftRegex = /^\*\*[^\s]/;
    var rightRegex = /[^\s]\*\*$/;

    return str.search(leftRegex) != -1 && str.search(rightRegex) != -1;
  };

  var unwrap = function(str, node, closeNode) {
    closeNode = typeof closeNode != 'undefined' ? closeNode : node;

    if (isWrapped(str, node))
      return str.substr(node.length, str.length - node.length*2);
    else
      return str;
  };

  //
  //
  //

  flower.nodes = {};

  flower.registerNode = function(name, action, markup, closingMarkup) {
    if (['insert', 'wrap', 'contain'].indexOf(action) == -1) {
      console.warn("action \"" + action + "\" does not exist in the Flower editor!");
    }

    flower.nodes[name] = {
      action: action,
      markup: markup,
      closingMarkup: closingMarkup
    };
  };

  flower.trigger = function(textarea, name) {
    flower_instance = flower.init(textarea);

    var command = flower.nodes[name];

    flower_instance[command.action](command.markup, command.closingMarkup, name);
  };

  flower.getInst = function(textarea) {
    return flower.init(textarea);
  };

  //
  // Interfaces for adding nodes
  //

  flower.keyInterfaces = {};

  flower.addKey = function(key, name) {
    this.keyInterfaces[ key.toLowerCase() ] = name.toLowerCase();
  };

  flower.findKeysForCommand = function(name) {
    var keys = [];

    for (var key in flower.keyInterfaces) {
      if (flower.keyInterfaces[key] == name)
        keys.push(key);
    }

    return keys;
  };

  //
  // Trigger nodes from interface elements
  //

  $(document).on('click', 'form .toolbar [flower-command]', function(evt) {
      flower.trigger(
        $(this).closest('label').find('textarea'),
        $(this).attr('flower-command')
      );
  } );

  $(document).on('keydown', 'form textarea', function(evt) {
    var code = evt.which;

    //if (!( (code >= 48 && code <= 90) || (code >= 96 && code <= 123) || (code >= 186 && code <= 222) )) return;

    var key = '' +
      (evt.altKey   ? 'alt+'   : '') +
      (evt.ctrlKey  ? 'ctrl+'  : '') +
      (evt.metaKey  ? 'meta+'  : '') +
      (evt.shiftKey ? 'shift+' : '') +
      fromWhichToString(evt.keyCode)
    ;

    key = key.toLowerCase();

    if (key != 'ctrl+enter') {
      evt.stopPropagation();
    }

    if (key in flower.keyInterfaces) {
      flower.trigger(flower.keyInterfaces[key]);
    }
  } );

});//(window.flower = {});

//
// Add titles onto the toolbar
//

var initializeFlower = function() {
  $('[flower-command]').each(function() {
    var title = ' ' + $(this).attr('flower-command').replace('-', ' ');

    // Add a note about any keyboard shortcuts

    var keys = flower.findKeysForCommand($(this).attr('flower-command')).join(', ');

    title += keys.length ? (' (' + keys + ')') : '';

    // Capitalize the title

    title = title.replace(/\b([\w])/g, function(l) { return l.toUpperCase(); });

    $(this).attr('title', title.substring(1));
  } );
};

// $(document).ready( initializeFlower );
// $(document).on( "page:load", initializeFlower);

//
// Register all the nodes & interfaces (should pull this out into it's own file)
//



// Key interfaces

// flower.addKey('ctrl+B',       'bold');
// flower.addKey('ctrl+I',       'italic');
// flower.addKey('ctrl+S',       'strikethrough');
// flower.addKey('alt+shift+5',  'strikethrough');
// flower.addKey('ctrl+shift+7', 'numbered-list');
// flower.addKey('ctrl+shift+8', 'list');
// flower.addKey('ctrl+K',       'link');
// flower.addKey('ctrl+U',       'underline');
//
// flower.addKey('ctrl+shift+L', 'left-align');
// flower.addKey('ctrl+shift+E', 'center');
// flower.addKey('ctrl+shift+R', 'right-align');
// flower.addKey('ctrl+shift+J', 'justify');
//
// flower.addKey('ctrl+shift+.', 'quote');
