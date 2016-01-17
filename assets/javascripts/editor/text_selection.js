(function(T) {
  function Selection(node) {
    this.node  = node;
    this.start = undefined;
    this.len   = undefined;
    this._update();
    this.syntax = flower.commonmark;
  }

  T.Selection = Selection;

  $.extend(Selection.prototype, {
    //
    // 'selectors'
    //

    get: function(start, len) {
      start = typeof start !== "undefined" ? start : this.start;
      len   = typeof len   !== "undefined" ? len   : this.len  ;

      return this.node.value.substr(start, len);
    },
    expandUntil: function(delimiter) {
      var start = this.start;
      var len   = this.len;

      // expand selection backwards
      while (start > 0 && !this.node.value[start-1].match(delimiter)) {
        start -= 1;
        len   += 1;
      }

      // expand selection forwards
      len += this.node.value.substr(start + len).search(delimiter);

      return {start: start, len: len};
    },
    word: function(doNotSet) {
      var sel = this.expandUntil(/\s/);

      if (doNotSet) {
        return this.get(sel.start, sel.len);
      } else {
        this.set(sel.start, sel.len);

        return this.get();
      }
    },
    paragraph: function(doNotSet) {
      var sel = this.expandUntil(/\n/);

      // sel.start = Math.max(0, sel.start-1);

      if (doNotSet) {
        return this.get(sel.start, sel.len);
      } else {
        this.set(sel.start, sel.len);

        return this.get();
      }
    },
    change: function(start, len) {
      return this.set(this.start + start, this.len + len);
    },
    set: function(start, len) {
      this.start = start;
      this.len   = len;

      if (this.node.createTextRange) {
        // quick fix to make it work on Opera 9.5
        if (browser.opera && browser.version >= 9.5 && len == 0) {
          return false;
        }

        range = this.node.createTextRange();
        range.collapse(true);
        range.moveStart('character', start);
        range.moveEnd('character', len);
        range.select();
      } else if (this.node.setSelectionRange ) {
        this.node.setSelectionRange(start, start + len);
      }
      //this.node.scrollTop = scrollPosition;
      this.node.focus();
    },
    toString: function() {
      return this.get();
    },
    _update: function() {
        //scrollPosition = this.node.scrollTop;
        if (document.selection) {
          this.len = document.selection.createRange().text.length;
          if (browser.msie) {
            // ie
            var range = document.selection.createRange();
            var rangeCopy = range.duplicate();

            rangeCopy.moveToElementText(this.node);

            this.start = -1;
            while(rangeCopy.inRange(range)) {
              rangeCopy.moveStart('character');
              this.start++;
            }
          } else {
            // opera
            this.start = this.node.selectionStart;
          }
        } else {
          // gecko & webkit
          this.start = this.node.selectionStart;
          this.len   = this.node.selectionEnd - this.start;
        }
    },

    //
    //
    //

    _split: function() {
      // selections have many texts, (split at endlines)

      this.texts = this.get().split("\n").map(function(paragraph) {
        return new T.Text(paragraph, this.syntax);
      }, this );
    },

    //
    //  things that modify the text
    //

    insert: function(block) {
      if (document.selection) {
        var newSelection = document.selection.createRange();
        newSelection.text = block;
      } else {
        var endPoint = this.start + this.len;

        this.node.value =
          this.node.value.substr(0, this.start) +
          block +
          this.node.value.substr(endPoint, this.node.value.length - endPoint);
      }
    },

    wrap: function(node) {
      this.word();

      this._split();

      if (this.texts.length == 1) {
        var text = this.texts[0];

        if (!this.len) {
          this.insert(node[0] + node[1]);
          this.change(node[0].length, 0);
        } else {
          if (text.inWrappings(node.name)) {
            this.insert(text.unwrap(node[0], node[1]));
            this.change(0, -(node[0].length + node[1].length));
          } else {
            this.insert(text.wrap(node[0], node[1]));
            this.change(node[0].length, 0);
          }
        }
      } else {
        var doThing = this.texts.every(function(text) {
          return text.isEmpty() || text.inWrappings(node.name);
        } );

        var lenChange = 0;

        this.texts.forEach(function(text) {
          if (text.isEmpty()) {
            // pass, do nothing
          } else if (doThing) {
            text.unwrap(node[0], node[1]);
            lenChange -= (node[0].length + node[1].length);
          } else {
            if (!text.inWrappings(node.name)) {
              text.wrap(node[0], node[1]);
              lenChange += node[0].length + node[1].length;
            }
          }
        }, this );

        this.insert(this.texts.join("\n"));

        this.change(0, lenChange);
      }
    },
    contain: function(node) {
      var marker = node[0];

      this.paragraph();
      this._split();

      if (this.texts.length == 1) {
        var text = this.texts[0];

        if (!text.isContained(marker)) {
          this.insert( text.contain(marker) );
          this.change(marker.length, 0);
        } else {
          this.insert( text.uncontain(marker) );
          this.change(0, -marker.length);
        }
      } else {
        var doThing = this.texts.every(function(text) {
          return text.isEmpty() || text.isContained(marker);
        } );

        var lenChange = 0;

        this.texts.forEach(function(text) {
          if (text.isEmpty()) {
            // pass
          } else if (doThing){
            text.uncontain(marker);
            lenChange -= marker.length;
          } else {
            if (!text.isContained(marker)) {
              text.contain(marker);
              lenChange += marker.length;
            }
          }
        } );

        this.insert(this.texts.join("\n"));
        this.change(0, lenChange);
      }
    },
  } );
})(window.T);
