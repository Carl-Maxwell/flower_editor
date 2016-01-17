// Do not have a testing framework setup for this yet
//  these are just notes

var input, output, press = function() {};

//

input  = "> heading\n> heading\nbody";
// select:     ^------------------^
press("ctrl+b");
output = "> he**ading**\n> **heading**\n**bo**dy";

// deal with openning whitespace on intermediate paragraphs
input  = "paragraph 1\n \t paragraph 2 \t \n paragraph 3";
//select:      ^-----------------------------^
press("ctrl+b");
output = "**paragraph**\n \t **paragraph 2** \t \n **paragraph** 3";

//
// deal with apostrophies appropriately
//

input  = "'tis a land w'out mercy, ma'am, or my name isn't Jeffrey's sage!";
//select:   ^---------^
press("ctrl+b");
output = "**'tis a land w'out** mercy, ma'am, or my name isn't Jeffrey's sage!";

input  = "'tis a land w'out mercy, ma'am, or my name isn't Jeffrey's sage!'";
//select:                ^---------^
press("ctrl+b");
output = "'tis a land **w'out mercy, ma'am,** or my name isn't Jeffrey's sage!";

input  = "'tis a land w'out mercy, ma'am, or my name isn't Jeffrey's sage!";
//select:                              ^---------------^
press("ctrl+b");
output = "'tis a land w'out mercy, **ma'am, or my name isn't** Jeffrey's sage!";

input  = "'tis a land w'out mercy, ma'am, or my name isn't Jeffrey's sage!";
//select:                                             ^--------------^
press("ctrl+b");
output = "'tis a land w'out mercy, **ma'am, or my name **isn't Jeffrey's sage!**";

//
//
//

input  = "> rawr boop";
//select: ^---------^
press("ctrl+b");
output = "> **rawr boop**";

// Handles arbitrary sequences of commands

input  = "rawr";
//select: ^--^
press("ctrl+b");
press("ctrl+s");
press("ctrl+i");
press("ctrl+b");
press("ctrl+s");
press("ctrl+i");
output = "rawr";

// Deals with oddly sorted nodes

input  = "*~~**rawr**~~*";
//select: ^------------^
press("ctrl+b");
output = "*~~rawr~~*";

input  = "***~~rawr~~***";
//select: ^------------^
press("ctrl+b");
output = "*~~rawr~~*";

input  = "**~~*rawr*~~**";
//select: ^------------^
press("ctrl+b");
output = "~~*rawr*~~";

//
//
//

input  = "**rawr** **rawr**";
//select:   ^-----------^
press("ctrl+b");
input  = "rawr rawr";
//select: ^-------^


//
// deals with adjacency issues
//

input  = "**rawr** rawr";
//select:          ^--^
press("ctrl+b");
output = "**rawr** **rawr**";
//select:            ^--^

//
// applies node universally before removing it
//

input  = "rawr rawr **rawr** rawr rawr";
//select:        ^-------------^
press("ctrl+b");
output = "rawr **rawr rawr rawr** rawr";
press("ctrl+b");
output = "rawr rawr rawr rawr rawr";

input  = "rawr **rawr** rawr **rawr** rawr";
//select:        ^---------------^
press("ctrl+b");
output = "rawr **rawr rawr rawr** rawr";
//select:        ^------------^

//
// removes subsets from supersets
//

input  = "**rawr rawr rawr rawr rawr**";
//select:        ^------------^
press("ctrl+b");
output = "**rawr** rawr rawr rawr **rawr**";
//select:          ^------------^
