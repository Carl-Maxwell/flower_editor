


// note that text editor-specific keyboard shortcuts are not in this file

(function() {
  var commands = {};
  var defineKeyboardCommand = function(key, func) {
    commands[ key.toLowerCase() ] = func;
  };
  var defineKeyboardCommands = function(arr) {
    for (var key in arr) {
      if (Array.isArray(arr[key]) && typeof arr[key][1] == 'undefined') {
        arr[key][1] = function() {
          this.actuateLink();
        };
      }

      defineKeyboardCommand(key, arr[key]);
    }
  };

  $(document).on('keydown', function(evt) {
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

    if (key in commands) {
      if (Array.isArray(commands[key])) {
        commands[key][1].apply( $(commands[key][0]) );
      } else {
        commands[key]();
      }
    }
  } );

  // define keyboard shortcuts

  defineKeyboardCommands( {
    //
    // generic shortcuts
    //

    "ctrl+enter": function() {
      $(':focus').closest('form').find('input[type="submit"]').click();
    },

    //
    // reddit-style shortcuts
    //

    R: ['.layout-sidebar .edit'],
    E: ['.layout-sidebar .edit'],

    //
    // gmail-style shortcuts
    //

    C: ['.layout-sidebar .new'],

    //
    // wikipedia-style shortcuts
    //

    "alt+shift+E": ['.layout-sidebar .edit'],
    "alt+shift+C": ['.layout-sidebar .view'],
    "alt+shift+H": ['.layout-sidebar .history'],
    "alt+shift+U": ['.layout-sidebar .upload-file'],
    "alt+shift+J": ['.layout-sidebar .what-links-here'],
    "alt+shift+K": ['.layout-sidebar .related-changes'],
    "alt+shift+X": ['.layout-sidebar .random-article'],
    "alt+shift+Q": ['.layout-sidebar .special-pages'],
    "alt+shift+R": ['.layout-sidebar .recent-changes'],
    "alt+shift+M": ['.layout-paper form .rename'],
    "alt+shift+D": ['.layout-paper form .delete'],

    "alt+shift+Z": function() {
      // TODO should navigate to homepage
    },

    "alt+shift+F": function() {
      $('.searchbox').focus();
    },
  } );

} )();
