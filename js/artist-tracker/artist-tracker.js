// Title: Prototypes
// ----------------------------------------------------------------------------
/*
  Method: unique
  
  Prototype of Array, returns a new array with no duplicate values
*/
Array.prototype.unique = function() {
  var a = [],
      l = this.length;
  for (var i=0; i<l; i++) {
    for (var j=i+1; j<l; j++) {
      // If this[i] is found later in the array
      if (this[i] === this[j])
        j = ++i;
    }
    a.push(this[i]);
  }
  return a;
};

/*
  Class: Tracker

  Properties (Configuration):
    iSkipTillSuggest            - Number of consecutive skips until the suggest interrupter pops up
    iSkipAllTillSuggest         - Number of consecutive skip all's until the suggest interrupter pops up
  
  Properties (Instantiated Objects):
    oTrackedMenu                - Performer selection menu
    oTrackedList                - Performers added list
    oImportiTunes               - iTunes import
    oPerformerTypeAhead         - PerformerTypeAhead
    oSuggesterTypeAhead         - PerformerTypeAhead
    oSuggestPanel               - Suggest interrupter
    
  Properties (State):
    aFavorites                  - Spids that are being fed to the recommendation handler
    aUnfavorites                - Spids that are being fed to the recommendation handler
    aSkipped                    - Spids that are being fed to the recommendation handler
    iSkipCount                  - Number of consecutive skips
    iSkipAllCount               - Number of consecutive skip-all's
    bSuggested                  - Boolean of has suggest interrupter been shown
*/
ArtistTracker = function () {
  $(this.setup.bind(this));
};

/*
  Method: setup
*/
ArtistTracker.prototype.setup = function () {
  // Settings (Editable)
  this.iSkipTillSuggest     = 5;  // how many times can the user "skip" till suggestion box
  this.iSkipAllTillSuggest  = 3;  // how many times can the user "skip all" till suggestion box

  // Instantiate Tracker Objects
  this.oTrackingMenu        = new ArtistTracker.TrackingMenu();
  this.oTrackedList         = new ArtistTracker.TrackedList();
  this.oImportiTunes        = new ArtistTracker.ImportiTunes();
  
  // Instantiate Helper Objects
  this.oPerformerTypeAhead  = new PerformerTypeAhead({ id: 'performer', singular: true, hide_description: 1, truncate: 40 });
  this.oSuggesterTypeAhead  = new PerformerTypeAhead({ id: 'suggester', singular: true, hide_description: 1, truncate: 40 });
  this.oSuggestPanel        = new Panel('panel-suggest').options({ width: 546 });
  
  // Data State
  this.aFavorites     = [];     // items favorited
  this.aUnfravorites  = [];     // items unfavorites
  this.aSkipped       = [];     // items skipped or removed from favorites
                      
  // User State       
  this.iSkipCount     = 0;      // count of pushing the skip button
  this.iSkipAllCount  = 0;      // count of pushing the skip all button
  this.bSuggested     = false;  // bool if the suggestions box has been shown
  
  // --- Subscriptions to TrackedList
  this.oTrackedList.eventOnRemove.subscribe(function (spid) {
    this.remove(spid);
  }.bind(this));
  
  // --- Subscriptions to TrackingMenu
  this.oTrackingMenu.eventOnAdd.subscribe(function (oItem, jqItem) {
    // reset counter and set item to busy
    this.resetSkipCounters();
    this.oTrackingMenu.busy(jqItem);
    
    // save item
    this.favorite(oItem.spid, function () {
      // add to tracked list
      this.oTrackedList.add(oItem);
      
      // fetch a replacement
      this.fetch(function (oResponse) {
        this.oTrackingMenu.set(oResponse.performers.shift(), jqItem);
      }.bind(this));
    }.bind(this));
  }.bind(this));
  
  this.oTrackingMenu.eventOnSkip.subscribe(function (oItem, jqItem) {
    if (this.rememberSkip()) return;
    
    // set item to busy and unfavorite item
    this.oTrackingMenu.busy(jqItem);
    this.unfavorite(oItem.spid, function () {
      // fetch a replacement
      this.fetch(function (oResponse) {
        this.oTrackingMenu.set(oResponse.performers.shift(), jqItem);
      }.bind(this));
    }.bind(this));
  }.bind(this));
  
  this.oTrackingMenu.eventOnSkipAll.subscribe(function () {
    if (this.rememberSkipAll()) return;

    // disable menu and unfavorite everything, then repopulate with new stuff
    this.oTrackingMenu.disable();
    this.unfavorite(this.oTrackingMenu.spids(), function () {
      this.populate();
    }.bind(this));
  }.bind(this));
  
  // --- Subscriptions to Import iTunes
  this.oImportiTunes.eventOnUploaderStart.subscribe(function () {
    this.oImportiTunes.bSuccess = true;
  }.bind(this));

  this.oImportiTunes.eventOnUploaderCancel.subscribe(function () {
    this.oImportiTunes.set();
  }.bind(this));

  this.oImportiTunes.eventOnUploaderError.subscribe(function (message) {
    this.oImportiTunes.setManual();
  }.bind(this));
  
  this.oImportiTunes.eventOnUploaderDone.subscribe(function (oResponse) {
    this.oImportiTunes.set(oResponse.known.length);
    if (!oResponse.known.length) return;
    
    // save results, and show them in the tracked list
    var aFavoritesToAdd = [];
    $(oResponse.known).each(function (_, oItem) {
      aFavoritesToAdd.push(oItem.spid);
      this.oTrackedList.add(oItem);
    }.bind(this));

    this.favorite(aFavoritesToAdd);
  }.bind(this));
  
  // --- Subscriptions to Performer TypeAhead
  this.oPerformerTypeAhead.eventItemSelected.subscribe(function (oItem) {
    TrackPageview.trackEvent($('body').data('ga-category'), 'Artist Search', 'Performer Selected', null);
    
    this.oTrackedList.add(oItem);                         // add to tracked list
    this.oPerformerTypeAhead.reset();                     // reset typeahead
    
    // disable menu and favorite the performer, then repopulate with new stuff
    this.oTrackingMenu.disable();
    this.favorite(oItem.spid, function () {
      this.populate();
    }.bind(this));
  }.bind(this));
  
  // --- Subscriptions to Suggester TypeAhead
  this.oSuggesterTypeAhead.eventItemSelected.subscribe(function (oItem) {
    TrackPageview.trackEvent($('body').data('ga-category'), 'Suggest Performer Interrupter', 'Performer Selected', null);
    
    this.oTrackedList.add(oItem);                         // add to tracked list
    this.oSuggesterTypeAhead.reset();                     // reset typeahead
    this.oSuggestPanel.close();                           // close suggest panel
    
    // save favorite, show 12 new performers
    this.oTrackingMenu.disable();
    this.favorite(oItem.spid, function () {
      // move all the favorites to skipped, set the new performer as the favorite
      this.aSkipped   = this.aSkipped.concat(this.aFavorites);
      this.aFavorites = [oItem.spid];

      // repopulate with new stuff, based on the new favorite
      this.populate();
    }.bind(this));
  }.bind(this));

  // --- Subscriptions to Suggester Panel
  this.oSuggestPanel.eventShow.subscribe(function () {
    TrackPageview.trackEvent($('body').data('ga-category'), 'Suggest Performer Interrupter', 'Open', null);
  });
  
  this.oSuggestPanel.eventClose.subscribe(function () {
    TrackPageview.trackEvent($('body').data('ga-category'), 'Suggest Performer Interrupter', 'Close', null);
  });

  // capture initial favorites / unfavorites and populate 12 performers
  this.init();
};

/*
  Method: init (cbFunction)
  
  Fetches Favorites and Unfavorites
*/
ArtistTracker.prototype.init = function (cbFunction) {
  this.oTrackingMenu.disable();
  $.get(
    "/json/tools/performers/recommend/game/setup",
    function (oResponse) {
      this.aFavorites   = oResponse.favorites_spids || [];
      this.aUnfavorites = oResponse.unfavorite_spids || []; 

      // render recommended_performer to the menu
      this.oTrackingMenu.load(oResponse.recommended_performers);
      this.oTrackingMenu.ready();
      
      if (cbFunction instanceof Function) cbFunction(oResponse);
    }.bind(this)
  );
  
  return this;
}

/*
  Method: populate

  Grabs 12 new performers and inserts them into the TrackedMenu
*/
ArtistTracker.prototype.populate = function () {
  this.fetch(function (oResponse) {
    
    // render performers to the menu
    this.oTrackingMenu.load(oResponse.performers);
    this.oTrackingMenu.ready();
  }.bind(this), 12);
};

/*
  Method: fetch (cbFunction, iCount)

  Fetches new performers; 1 by default, or iCount
*/
ArtistTracker.prototype.fetch = function (cbFunction, iCount) {
  $.post(
    "/json/tools/performers/recommend/game/recommend",
    {
      added_spids:      this.aFavorites,
      rejected_spids:   this.aUnfavorites.concat(this.aSkipped).unique(),
      current_spids:    this.oTrackingMenu.spids(),
      count:            iCount || 1
    },
    function (oResponse) {
      if (cbFunction instanceof Function) cbFunction(oResponse);
    }.bind(this)
  );
  
  return this;
};

/*
  Method: favorite (spid, cbFunction)

  Adds performer spid(s) to favorites
*/
ArtistTracker.prototype.favorite = function (spid, cbFunction) {
  // transform into an array if it's only a single value
  if (!(spid instanceof Array)) spid = [spid];
  
  this.aFavorites = this.aFavorites.concat(spid);
  $.post(
    "/json/tools/users/favorites/performers/multi-add",
    {
      add:      spid,
      positive: true
    },
    function (oResponse) {
      if (cbFunction instanceof Function) cbFunction(oResponse);
    }.bind(this)
  );
  
  return this;
};

/*
  Method: unfavorite (spid, cbFunction)
  
  Adds performer spid(s) to unfavorites
*/
ArtistTracker.prototype.unfavorite = function (spid, cbFunction) {  
  // transform into an array if it's only a single value
  if (!(spid instanceof Array)) spid = [spid];
  
  this.aSkipped = this.aSkipped.concat(spid);
  
  $.post(
    "/json/tools/users/favorites/performers/multi-add",
    {
      add:      spid,
      positive: false
    },
    function (oResponse) {
      if (cbFunction instanceof Function) cbFunction(oResponse);
    }.bind(this)
  );
  
  return this;
};


/*
  Method: remove (cbFunction)

  Removes spid from favorites
*/
ArtistTracker.prototype.remove = function (spid, cbFunction) {
  // transform into an array if it's only a single value
  if (!(spid instanceof Array)) spid = [spid];
  
  $.post(
    "/tools/users/favorites/performers/multi-remove",
    {
      remove: spid
    },
    function (oResponse) {
      this.aRemoved = [];
      if (cbFunction instanceof Function) cbFunction(oResponse);
    }
  );
};

/*
  Method: rememberSkip
  
  Determines and controls if enough skips have happened to show Suggest interrupter
*/
ArtistTracker.prototype.rememberSkip = function () {
  this.iSkipCount++;

  if (this.iSkipCount >= this.iSkipTillSuggest && !this.bSuggested) {
    this.bSuggested = true;
    this.oSuggestPanel.show();
    $('#modalContainer a.modalCloseImg').toggle();
    
    return true;
  }

  return false;
};


/*
  Method: rememberSkipAll
  
  Determines and controls if enough skip-all's have happened to show Suggest interrupter
*/
ArtistTracker.prototype.rememberSkipAll = function () {
  this.iSkipAllCount++;
  
  if (this.iSkipAllCount >= this.iSkipAllTillSuggest && !this.bSuggested) {
    this.bSuggested = true;
    this.oSuggestPanel.show();
    $('#modalContainer a.modalCloseImg').toggle();
    
    return true;
  }
  
  return false;
};

/*
  Method: resetSkipCounters
  
  Resets the skip counters
*/
ArtistTracker.prototype.resetSkipCounters = function () {
  this.iSkipCount     = 0;
  this.iSkipAllCount  = 0;

  return this;
};



/*
  Class: Tracker.ImportiTunes

  Properties (Configuration):
    msAppletTimeout           - Milliseconds till java applet attempt times out and fails
  
  Properties (UIEvent):
    eventOnUploaderStart      - Fired when java upload starts
    eventOnUploaderCancel     - Fired when java upload is canceled
    eventOnUploaderError      - Fired when java upload has an error
    eventOnUploaderDone       - Fired when java upload is complete
  
  Properties (Instantiated Objects):
    oiTunesPanel              - Panel for the manual upload

  Properties (Template):
    jqStatus                  - jQuery object of status box
    srcStatus                 - HTML of Handlebars template
    tmplStatus                - Compiled Handlebars template

  Properties (State):
    bSuccess                  - True / False of upload success
*/
ArtistTracker.ImportiTunes = function () {
  // Config
  this.msAppletTimeout  = 10000; // (10 sec timeout, if the applet fails)
  
  // State
  this.bSuccess         = false;
  
  // Handlebars Container, Template, and Compile
  this.jqStatus     = $('#itunes-import-container');
  this.srcStatus    = $('#tmpl-import').html();
  this.tmplStatus   = Handlebars.compile(this.srcStatus);
  this.oiTunesPanel = new Panel('panel-import-itunes').options({ width: 516 });

  // Java Uploader
  this.eventOnUploaderStart   = new UIEvent();
  this.eventOnUploaderCancel  = new UIEvent();
  this.eventOnUploaderError   = new UIEvent();
  this.eventOnUploaderDone    = new UIEvent();
  this.java() ? this.listenAppletEvents() : false;

  // Listen: Import Button
  $(".itunes-import").live('click', function () {
    this.java() ? this.applet() : this.manual();
  }.bind(this));
  
  $(".itunes-import-manual").live('click', function () {
    this.manual();
  }.bind(this));
  
  // Listen: Manual Import Close
  this.oiTunesPanel.eventClose.subscribe(function () {
    TrackPageview.trackEvent($('body').data('ga-category'), 'iTunes Manual Import', 'Close', null);
  }.bind(this));

  // set status - no parameters = default / import button
  this.set();

  return this;
}

/*
  Method: set (count)

  Will show the import button, unless count is passed in too, in which case this will show the number of imports
*/
ArtistTracker.ImportiTunes.prototype.set = function (count) {
  // if the count is 0 .. ie. set(0)
  if (count == 0) {
    this.jqStatus.html(this.tmplStatus({ manual: 1 }));
    return this;
  }
  
  // if count has a positive value
  if (count) {
    this.jqStatus.html(this.tmplStatus({ count: count }));
  } else {
    this.jqStatus.html(this.tmplStatus({ button: 1 }));
  }

  return this;
};

/*
  Method: java
  
  Detects java. returns true or false
*/
ArtistTracker.ImportiTunes.prototype.java = function () {
  return navigator.javaEnabled();
};

/*
  Method: applet
  
  Injects the java applet into the thingum
*/
ArtistTracker.ImportiTunes.prototype.applet = function () {
  var stsess = Cookies.getCookie('stsess'),
      sAppletMarkup;
      
  this.jqStatus.html(this.tmplStatus({ throbber: 1 }));
  
  sAppletMarkup = '<object width="1" height="1" ';

  if (isIE) {
    sAppletMarkup += 'classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93">';
  } else {
    sAppletMarkup += 'type="application/x-java-applet">';
  }
  
  sAppletMarkup += '<param name="code" value="com.uploader.itunes.ITunesUploader" />' +
    '<param name="archive" value="/java/ITunesUploader7.jar" />' +
    '<param name="mayscript" value="true" />' +
    '<param name="stsess" value="' + stsess + '" />' +
    '<param name="action" value="/json/tools/my/import/itunes" />' +
    '</object>';

  var jqAppletMarkup = $(sAppletMarkup);

  $('body').append(jqAppletMarkup);

  // Failure Timeout
  setTimeout(function () {
    if (this.bSuccess) return;
    this.eventOnUploaderError.fire();
  }.bind(this), this.msAppletTimeout);

  return this;
};

/*
  Method: manual

  Hooks up the manual uploader goodness mm
*/
ArtistTracker.ImportiTunes.prototype.manual = function () {
  // on asynch upload complete
  var oAsynchUploader = new AsynchUpload('form#import-itunes-form')
  
  // On: Upload Press
  oAsynchUploader.eventSubmit.subscribe(function () {
    this.oiTunesPanel.close();
    this.jqStatus.html(this.tmplStatus({ throbber: 1 }));
  }.bind(this));
  
  // On: Complete
  oAsynchUploader.eventComplete.subscribe(function (oResponse) {
    this.eventOnUploaderDone.fire(oResponse);
      
    TrackPageview.trackEvent($('body').data('ga-category'), 'iTunes Manual Import', 'Close Completion', null);
  }.bind(this));
   
  // show panel, now that we're ready for it
  this.oiTunesPanel.show();
  
  return this;
};

/*
  Method: setManual
  
  Sets the import menu to manual mode
*/
ArtistTracker.ImportiTunes.prototype.setManual = function () {
  this.jqStatus.html(this.tmplStatus({ manual: 1 }));
}

/*
  Method: listenAppletEvents
  
  Attaches all the java applet javascript callbacks to the window object and hooks in UIEvents for each one
*/
ArtistTracker.ImportiTunes.prototype.listenAppletEvents = function () {
  window.handle_uploader_start = function () {
    this.eventOnUploaderStart.fire();
  }.bind(this);
  
  window.handle_uploader_cancel = function () {
    this.bSuccess = true;
    this.eventOnUploaderCancel.fire();
  }.bind(this);
  
  window.handle_uploader_error = function (message) {
    TrackPageview.trackEvent($('body').data('ga-category'), 'iTunes Automatic Import', 'Upload Error', null);
    
    this.eventOnUploaderError.fire(message);
  }.bind(this);
  
  window.handle_uploader_done = function (oResponse) {
    TrackPageview.trackEvent($('body').data('ga-category'), 'iTunes Automatic Import', 'Completion', null);
    
    this.bSuccess = true;

    var oResponse = JSON.parse(oResponse);
    this.eventOnUploaderDone.fire(oResponse);
  }.bind(this);
  
  return this;
};



/*
  Class: Tracker.TrackingMenu
  
  Properties (UIEvent):
    eventOnAdd      - Fired when user clicks Add
    eventOnSkip     - Fired when user clicks Skip
    eventOnSkipAll  - Fired when user clicks SkipAll

  Properties (Template):
    jqContainer     - jQuery Object of Menu container
    jqTracker       - jQuery Object of the Menu
    srcTracker      - HTML of Handlebars template
    tmplTracker     - Compiled Handlebars template
*/
ArtistTracker.TrackingMenu = function () {
  // Expose UIEvents
  this.eventOnAdd     = new UIEvent();
  this.eventOnSkip    = new UIEvent();
  this.eventOnSkipAll = new UIEvent();
  
  // Handlebars Container, Template, and Compile
  this.jqContainer  = $('#tracking-menu-container')
  this.jqTracker    = $('#tracking-menu-container .tracking-menu');
  this.srcTracker   = $('#tmpl-handlebars-tracking-menu').html();
  this.tmplTracker  = Handlebars.compile(this.srcTracker);
  
  // Event Skip All
  $('#skip-all .bn').live('click', function () { this.eventOnSkipAll.fire(); }.bind(this));
  
  // Event Skip / Add Item
  this.jqTracker.find('.bn.tracker-add, .bn.tracker-skip').live('click', function (e) {
    var jqElement = $(e.currentTarget),
        jqItem    = jqElement.parents('li'),
        spid      = jqItem.data('spid'),
        name      = jqItem.data('name');
        
    if (jqElement.hasClass('tracker-add')) {
      this.eventOnAdd.fire({
        'spid': spid,
        'name': name
      }, jqItem);
    }
    
    if (jqElement.hasClass('tracker-skip')) {
      this.eventOnSkip.fire({
        'spid': spid,
        'name': name
      }, jqItem);
    }
  }.bind(this));
};

/*
  Method: load (arr)
  
  Clears the menu, and loads a new set of items from array
*/
ArtistTracker.TrackingMenu.prototype.load = function (arr) {
  if (!arr) {
    throw new Error("TrackingMenu.load() requires an array.");
    return false;
  }
  
  this.jqTracker.empty();
  this.jqTracker
    .html(this.tmplTracker({ tracker: arr }))
    .css('opacity', '0')
    .animate({'opacity': '1'}, 500)
    .children('li:nth-child(4n)')
    .addClass('row-last');

  return this;
}

/*
  Method: set (oItem, jqItem)
  
  Takes the oPerformer data and throws it into the hb template, then replaces jqItem with jqNewItem
*/
ArtistTracker.TrackingMenu.prototype.set = function (oItem, jqItem) {
  if (!jqItem.length) return;
  
  var jqNewItem = $(this.tmplTracker({ tracker: [oItem] }));

  if (jqItem.hasClass('row-last')) { jqNewItem.addClass('row-last'); }

  jqItem.replaceWith(jqNewItem);
  jqNewItem
    .find('.item-image img, .caption, .actions')
    .css('opacity', '0')
    .animate({'opacity': '1'}, 500);
  
  return this;
};

/*
  Method: disable

  Remove all items from menu
*/
ArtistTracker.TrackingMenu.prototype.disable = function () {
  this.jqContainer.append($('<div />').addClass('whiteout'));
  this.jqContainer.append($('<div />').addClass('throbber-overlaid'));
  
  return this;
};

/*
  Method: busy (jqItem)
  
  Show throbber on whole menu, or single jqItem if provided
*/
ArtistTracker.TrackingMenu.prototype.busy = function (jqItem) {
  // busy: single item
  if (jqItem && jqItem.length) {
    jqItem
      .find('.item-image')
      .addClass('throbber');
    
    jqItem
      .find('.item-image img, .caption, .actions')
      .css('visibility', 'hidden');
  }
  
  return this;
}

/*
  Method: ready

  hide throbber
*/
ArtistTracker.TrackingMenu.prototype.ready = function () {
  this.jqContainer.find('.whiteout, .throbber-overlaid').remove();
  
  return this;
}

/*
  Method: spids

  Returns an array of all actively displayed spids
*/
ArtistTracker.TrackingMenu.prototype.spids = function () {
  var aSpids = [];

  this.jqTracker.find('li').each(function (_, elItem) {
    aSpids.push($(elItem).data('spid'));
  });
  
  return aSpids;
};

/*
  Method: duplicate
  
  Return true/false if spid is already on display
*/
ArtistTracker.TrackingMenu.prototype.duplicate = function (spid) {
  return this.jqTracker.find('li[data-spid='+spid+']').length;
}



/*
  Class: Tracker.TrackedList
  
  Properties (UIEvent):
    eventOnAdd        - Fires when an item is added
    eventOnClear      - Fires when the list is cleared
    eventOnRemove     - Fires when an item is removed
    eventOnUpdate     - Fires when an item is added, removed, or the list is cleared

  Properties (Template):
    jqContainer       - Query selector of the Container of the TrackedList
    jqTrackedList     - Query selector of the TrackedList
    srcTrackedList    - HTML of the Handlebars template
    tmplTrackedList   - Compiled Handlebars template
    
  Properties (Misc jQuery Selectors):
    jqStatus          - jQuery selector of the status indicator
    jqStatusCount     - jQuery selector of the status count
    jqStatusText      - jQuery selector of the status text

  Properties (State):
    iPerformerCount   - Number of performers presently in the list
*/
ArtistTracker.TrackedList = function () {
  
  // Exposed UIEvents
  this.eventOnAdd     = new UIEvent(); // passes back spid
  this.eventOnClear   = new UIEvent(); // passes back nothing
  this.eventOnRemove  = new UIEvent(); // passes back spid
  this.eventOnUpdate  = new UIEvent(); // passes back count
  
  // Handlebars Container, Template, and Compile
  this.jqContainer      = $('#tracked-list .tracked-list-container-container');
  this.jqTrackedList    = $('#tracked-list .tracked-list-container');
  this.srcTrackedList   = $('#tmpl-handlebars-tracked-list').html();
  this.tmplTrackedList  = Handlebars.compile(this.srcTrackedList);
  
  // Status
  this.jqStatus         = $('#tracked-list');
  this.jqStatusCount    = this.jqStatus.find('.status-count');
  this.jqStatusText     = this.jqStatus.find('.status-text');
  this.iPerformerCount  = 0;

  // Click Remove
  this.jqTrackedList.find('.remove').live('click', function (e) {
    var jqElement = $(e.currentTarget),
        jqItem    = jqElement.parents('li'),
        spid      = jqItem.data('spid');

    this.remove(spid);
  }.bind(this));
  
  // NiceScroll Effect
  this.jqContainer.niceScroll(this.jqTrackedList, {cursorborder:""});

  //Nicescroll adds a tabindex attribute to jqContainer....get rid of it
  this.jqContainer.removeAttr('tabindex');
  
  // Update Status
  this.update();

  return this;
};

/*
  Method: add (oPerformer)
  
  Accepts an object with { name: ####, spid: #### } and adds it to the tracked list
*/
ArtistTracker.TrackedList.prototype.add = function (oPerformer) {
  if (this.duplicate(oPerformer.spid)) return this;
  
  // special insert effect
  var jqInsertable = $(this.tmplTrackedList(oPerformer));
      jqInsertable.hide();

  this.jqTrackedList.prepend(jqInsertable);

  jqInsertable
    .css('margin-top', (jqInsertable.outerHeight() * -1) + 'px')  // scoot up
    .show()                                                       // show it
    .animate({                                                    // slide it down
      'margin-top': 0
    }, 250,
    function () {
      $(this)
        .find('.bg-green')
        .delay(500)
        .fadeOut();
    });

  this.iPerformerCount++;
  this.update();

  // fire event
  this.eventOnAdd.fire(oPerformer.spid);
  
  return this;
};

/*
  Method: update
  
  Clears entire list
*/
ArtistTracker.TrackedList.prototype.clear = function () {
  this.jqTrackedList.empty();
  this.iPerformerCount = 0;
  this.update();
  
  // fire event
  this.eventOnClear.fire();
  
  return this;
};

/*
  Method: update

  Updates the status counter
*/
ArtistTracker.TrackedList.prototype.update = function () {  
  // controls the status message, based on count
  if (this.iPerformerCount > 0) {
    this.jqStatusCount.html(this.iPerformerCount) 
    this.jqStatusText.html('Performers Added');
  } else {
    this.jqStatusCount.empty();
    this.jqStatusText.html('No Performers Added');
  }
  
  this.jqContainer.getNiceScroll().resize();
  
  // fire event
  this.eventOnUpdate.fire(this.iPerformerCount);
  
  return this;
};

/*
  Method: remove (spid)

  Removes item from list by spid
*/
ArtistTracker.TrackedList.prototype.remove = function (spid) {
  var jqItem = this.jqTrackedList.children('[data-spid='+spid+']');
  this.iPerformerCount -= jqItem.length;
  jqItem.remove();
  this.update();

  // fire event
  this.eventOnRemove.fire(spid);
  
  return this;
};

/*
  Method: duplicate (spid)
  
  Returns true/false if spid exists
*/
ArtistTracker.TrackedList.prototype.duplicate = function (spid) {
  var aItems = this.jqTrackedList.find('li');
  for (var i = 0; i < aItems.length; i++) {
    var jqItem  = $(aItems[i]);        
    if (jqItem.data('spid') == spid) return true;
  }
  
  return false;
};

// Instantiate
oTracker = new ArtistTracker();