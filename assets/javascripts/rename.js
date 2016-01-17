

$(document).on('click', '.rename', function() {
  var input = $(this).closest('form').find('.rename_input');

  var name = prompt('<h1>Rename article</h1>\n\n<p>What would you like to name the article:</p>');

  if (name) {
    input.val(name);

    $(this).focus().text(name).blur().change();
  }
} );
