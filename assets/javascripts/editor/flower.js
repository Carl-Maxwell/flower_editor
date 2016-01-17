(function(flower) {
  $.extend(flower, {
    textarea: function() {
      return $('form textarea')[0];
    },

    //
    //
    //

    wrap: function(node) {
      (new T.Selection(this.textarea())).wrap(node);
    },
    contain: function(node) {
      (new T.Selection(this.textarea())).contain(node);
    },

    //
    // Interfaces for adding nodes
    //

    keyInterfaces: {},
    addKey: function(key, name) {
      this.keyInterfaces[ key.toLowerCase() ] = name.toLowerCase();
    },
    findKeysForCommand: function(name) {
      var keys = [];

      for (var key in flower.keyInterfaces) {
        if (flower.keyInterfaces[key] == name)
          keys.push(key);
      }

      return keys;
    },

    //
    //
    //

    trigger: function(name) {
      var node = flower.commonmark.findNode(name);
      this[node.action](node);
    },
  } );

  //
  //
  //

  //
  // Trigger nodes from interface elements
  //

  $(document).on('click', 'form .toolbar [flower-command]', function(evt) {
      flower.trigger(
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

} )(window.flower = {});

// Key interfaces

flower.addKey('ctrl+B',       'bold'         );
flower.addKey('ctrl+I',       'italic'       );
flower.addKey('ctrl+S',       'strikethrough');
flower.addKey('alt+shift+5',  'strikethrough');
flower.addKey('ctrl+shift+7', 'numbered-list');
flower.addKey('ctrl+shift+8', 'list'         );
flower.addKey('ctrl+K',       'link'         );
flower.addKey('ctrl+U',       'underline'    );

flower.addKey('ctrl+shift+L', 'left-align'   );
flower.addKey('ctrl+shift+E', 'center'       );
flower.addKey('ctrl+shift+R', 'right-align'  );
flower.addKey('ctrl+shift+J', 'justify'      );

flower.addKey('ctrl+shift+.', 'quote'        );

//
// Add titles onto the toolbar
//

var initializeFlower = function() {
  $('[flower-command]').each(function() {
    var title = $(this).attr('flower-command').replace('-', ' ');

    // Add a note about any keyboard shortcuts

    var keys = flower.findKeysForCommand(
      $(this).attr('flower-command')
    ).join(', ');

    title += keys.length ? (' (' + keys + ')') : '';

    // Capitalize the title

    title = title.replace(
      /\b([\w])/g,
      function(l) {
        return l.toUpperCase();
      }
    );

    $(this).attr('title', title);
  } );
};

$(document).ready( initializeFlower );
$(document).on( "page:load", initializeFlower);
