(function(T) {
  function Text(str, syntax) {
    this.str    = str;
    this.syntax = syntax;

  }

  T.Text = Text;

  $.extend(Text.prototype, {
    toString: function() {
      return this.str;
    },
    isEmpty: function() {
      return this.str === "";
    },

    //
    // Words
    //

    isWrapped: function(open, close) {
      close = close || open;

      return this.str.startsWith(open) && this.str.endsWith(close);
    },
    wrap: function(open, close) {
      close = close || open;

      this.str = open + this.str + close;

      return this.str;
    },
    unwrap: function(open, close) {
      close = close || open;

      if (this.isWrapped(open, close)) {
        this.str = this.str.substr(
          open.length,
          this.str.length - (open.length + close.length)
        );
      }

      return this.str;
    },
    wrappings: function() {
      var output = [];
      var dup = new Text("" + this.str, this.syntax);

      this.syntax.nodes.forEach(function(node) {
        if (node.action == 'wrap' && dup.isWrapped(node[0], node[1])) {
          output.push(node.name);
          dup.unwrap(node[0], node[1]);
        }
      } );

      return output;
    },
    inWrappings: function(nodeName) {
      return this.wrappings().indexOf(nodeName) != -1;
    },

    //
    // Paragraphs
    //

    contain: function(marker) {
      this.str = marker + this.str;

      return this.str;
    },
    uncontain: function(marker) {
      this.str = this.str.substr(marker.length);

      return this.str;
    },
    isContained: function(marker) {
      return this.str.startsWith(marker);
    },
    containings: function() {
      var results = [];

      this.syntax.nodes.some(function(node) {
        if (node.action == 'contain' && this.isContained(node[0])) {
          results.push(node.name);
          return true; // there can be only one
        }
      }, this );

      return results;
    }
  } );
})(window.T = {});
