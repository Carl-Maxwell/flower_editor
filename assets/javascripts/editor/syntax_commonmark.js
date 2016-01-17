window.flower.commonmark = new Syntax( [
  { name: 'bold'         , action: 'wrap'   , 0: '**'           },
  { name: 'italic'       , action: 'wrap'   , 0: '*'            },
  { name: 'strikethrough', action: 'wrap'   , 0: '~~'           },

  { name: 'link'         , action: 'wrap'   , 0: '[['  , 1: ']]'},

  { name: 'numbered-list', action: 'contain', 0: '1. '          },
  { name: 'list'         , action: 'contain', 0: '* '           },

  // { name: 'image'        , action: 'wrap'   , 0: ''             },

  { name: 'center'       , action: 'contain', 0: '->'  , 1: '<-'},

  { name: 'quote'        , action: 'contain', 0: '> '           },
  { name: 'code'         , action: 'contain', 0: '    '         }
] );
