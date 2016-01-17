
// got this code from http://stackoverflow.com/a/21772950

// TODO 'actuate' isn't very clear. Consider 'goto', 'follow', 'click', etc

jQuery.fn.extend( {
  actuateLink: function() {
    var allowDefaultAction = true;

    var link = this[0];

    if (link.click) {
      link.click();
      return;
    } else if (document.createEvent) {
      var e = document.createEvent('MouseEvents');
      e.initEvent(
        'click',    // event type
        true,      // can bubble?
        true      // cancelable?
      );
      allowDefaultAction = link.dispatchEvent(e);
    }

    if (allowDefaultAction) {
      var f = document.createElement('form');
      f.action = link.href;
      document.body.appendChild(f);
      f.submit();
    }
  }
} );
