AdminPanel = function () {
  $(this.setup.bind(this));
}

AdminPanel.prototype.setup = function () {
  $('#admin-nav button').click(this.delegateNavClick.bind(this));
  $('.image-item').live('click', this.delegateImageItemClick.bind(this));

  // Image Box
  $('.img-box').live('click', this.imageBox.bind(this));
  $('#imgBox-close').click(function(){$('#imgBox').hide();});
  
  // UI Helpers
  this.uiHelpers();
}

AdminPanel.prototype.uiHelpers = function () {
  $('body').delegate('.image-title', 'change', function (evt) {
    var jqThis        = $(evt.target),
        jqParent      = jqThis.parent('.image-item'),
        jqFilename    = jqParent.find('.image-filename'),
        jqPermalink   = jqParent.find('.image-permalink'),
        jqImage       = jqParent.find('.image-image'),
        strImage      = jqImage.attr('src'),
        strExtension  = strImage.split('.').pop(),
        strText       = jqThis.val(),
        strNImage     = strText
                        .replaceAll('.', '')
                        .replaceAll(',', '')
                        .replaceAll('!', '')
                        .replaceAll(':', '')
                        .replaceAll("'", '')
                        .replaceAll(' ', '-') // final -
                        .toLowerCase();       // lower the case

    jqFilename.val(strNImage ? strNImage + '.' + strExtension : '');
    jqPermalink.val(strNImage ? strNImage + '.html' : '');
  });
}

AdminPanel.prototype.delegateNavClick = function (objEvent) {
  $('#admin-body').html("<div style='text-align:center;'><em>Fetching..</em></div>");

  var sID = $(objEvent.currentTarget).attr('id'),
      oActions = {
        'filter-all':             { fn: this.filter.bind(this), filter: 'all' },
        'filter-prepared':        { fn: this.filter.bind(this), filter: 'prepared' },
        'filter-enabled':         { fn: this.filter.bind(this), filter: 'enabled' },
        'filter-disabled':        { fn: this.filter.bind(this), filter: 'disabled' },
        'filter-queued':          { fn: this.filter.bind(this), filter: 'queued' },
        'filter-priority-queued': { fn: this.filter.bind(this), filter: 'priority-queued' },
        'filter-search':          { fn: this.filter.bind(this), filter: 'search', param: $('#search-images').val() }
      };

      oActions[sID].fn(oActions[sID]);
}

AdminPanel.prototype.delegateImageItemClick = function (objEvent) {
  var jqTarget  = $(objEvent.target), 
      jqParent  = jqTarget.parents('.image-item'),
      iIndex    = jqParent.attr('data-index');
      
  if(jqTarget.hasClass('image-save')) {
    this.saveImage(jqParent, iIndex);
  }
  
  if(jqTarget.hasClass('image-queue')) {
    this.queueImage(jqParent, iIndex);
  }
  
  if(jqTarget.hasClass('image-unqueue')) {
    this.unqueueImage(jqParent, iIndex);
  }
  
  if(jqTarget.hasClass('image-priority')) {
    this.priorityImage(jqParent, iIndex);
  }
  
  if(jqTarget.hasClass('image-disable')) {
    this.disableImage(jqParent, iIndex);
  }
  
  if(jqTarget.hasClass('image-enable')) {
    this.enableImage(jqParent, iIndex);
  }
  
  if(jqTarget.hasClass('image-delete') || jqTarget.parent('.image-delete').length) {
    this.deleteImage(jqParent, iIndex);
  }
  
  console.log(jqTarget);
}

AdminPanel.prototype.saveImage = function (jqParent, iIndex) {
  var sTitle      = jqParent.children('.image-title').val(),
      sDesc       = jqParent.children('.image-description').val(),
      sTags       = jqParent.children('.image-tags').val(),
      sFilename   = jqParent.children('.image-filename').val(),
      sPermalink  = jqParent.children('.image-permalink').val();
      
  var oSubmit = {
    'action':                 'update-image-data',
    'image-id':               iIndex,
    'image-title':            sTitle,
    'image-description':      sDesc,
    'image-permalink':        sPermalink,
    'image-tags':             sTags,
    'image-virtual-filename': sFilename,
  };

  $.ajax({
    type:     'POST',
    url:      '/g/admin',
    data:     oSubmit,
    success:  function() { console.log(jqParent, iIndex); this.rebuildImage(jqParent, iIndex); }.bind(this)
  });
}

AdminPanel.prototype.deleteImage = function (jqParent, iIndex) {
  var sName = jqParent.find('.img-box').attr('title');
  if(!confirm("Delete "+sName+"?")) return;
  
  var oSubmit = {
    'action':     'delete-image',
    'image-id':   iIndex
  };
  
  $.ajax({
    type:     'POST',
    url:      '/g/admin',
    data:     oSubmit,
    success:  function() { this.rebuildImage(jqParent, iIndex); }.bind(this)
  });
}

AdminPanel.prototype.enableImage = function (jqParent, iIndex) {
  var oSubmit = {
    'action':     'enable-image',
    'image-id':   iIndex
  };
  
  $.ajax({
    type:     'POST',
    url:      '/g/admin',
    data:     oSubmit,
    success:  function() { this.rebuildImage(jqParent, iIndex); }.bind(this)
  });
}

AdminPanel.prototype.queueImage = function (jqParent, iIndex) {
  var oSubmit = {
    'action':     'queue-image',
    'image-id':   iIndex
  };
  
  $.ajax({
    type:     'POST',
    url:      '/g/admin',
    data:     oSubmit,
    success:  function() { this.rebuildImage(jqParent, iIndex); }.bind(this)
  });
}

AdminPanel.prototype.unqueueImage = function (jqParent, iIndex) {
  var oSubmit = {
    'action':     'unqueue-image',
    'image-id':   iIndex
  };
  
  $.ajax({
    type:     'POST',
    url:      '/g/admin',
    data:     oSubmit,
    success:  function() { this.rebuildImage(jqParent, iIndex); }.bind(this)
  });
}

AdminPanel.prototype.priorityImage = function (jqParent, iIndex) {
  var oSubmit = {
    'action':     'priority-image',
    'image-id':   iIndex
  }
  
  $.ajax({
    type:     'POST',
    url:      '/g/admin',
    data:     oSubmit,
    success:  function() { this.rebuildImage(jqParent, iIndex); }.bind(this)
  });
}

AdminPanel.prototype.disableImage = function (jqParent, iIndex) {
  var oSubmit = {
    'action':     'disable-image',
    'image-id':   iIndex
  };
  
  $.ajax({
    type:     'POST',
    url:      '/g/admin',
    data:     oSubmit,
    success:  function() { this.rebuildImage(jqParent, iIndex); }.bind(this)
  });
}

AdminPanel.prototype.buildImages = function (objResponse) {
  var hResponse;
  if(objResponse.response == false) {
    hResponse = "<div style='text-align:center;'><strong>- No Results -</strong></div>";
  } else {
    hResponse = $('#tmpl-image-item').tmpl(objResponse)
  }

  $('#admin-body').html(hResponse);
}

AdminPanel.prototype.rebuildImage = function (jqParent, iIndex) {
  $.ajax({
    url:        '/json/admin/index',
    dataType:   'json',
    type:       'post',
    data:       { 'filter': 'single', 'index': iIndex },
    success:    function (objResponse) {
      hResponse = $('#tmpl-image-item').tmpl(objResponse);
      jqParent.replaceWith(hResponse);
    },
    failure:    function (err) {console.log(err);}
  });
}

AdminPanel.prototype.filter = function (oFilter) { 
  $.ajax({
    url:        '/json/admin/index',
    dataType:   'json',
    type:       'post',
    data:       oFilter,
    success:    this.buildImages,
    failure:    function(err) {console.log(err);}
  });
}

AdminPanel.prototype.imageBox = function (objEvent) {
  objEvent.preventDefault();
  var sImageSrc = $(objEvent.target).attr('src');
  
  $('#imgBox #imgBox-container img').attr('src', sImageSrc);
  $('#imgBox').show();
}

$(oAdminPanel = new AdminPanel);
