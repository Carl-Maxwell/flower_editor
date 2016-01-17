window.Syntax = function(syntax) {
  $.extend(this, {
    nodes: syntax,
    findNode: function(name) {
      var node = this.nodes.find(function(node) {
        return node.name == name;
      } );

      node[1] = node[1] || node[0];

      return node;
    }
  } );
};
