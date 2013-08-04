!function ($) {
  // private: skin state stuff
  var active_campaign = {},                                     // campaign specific settings
      skin_config     = {},                                     // skin specific settings
      ord             = parseInt(Math.random() * 10000, 10),    // random nr. used by ads

  // private: store dom elements and html bits
      jqInnerContainer,     // store inner-container (where all the siteskin elements get prepended to)
      jqHead,               // store head
      jqBody,               // store body
      hGeneratedSkin = '',  // store html for deploy()

  // private: flowplayer
      fpConfig,             // object of flowplayer config
      fpInstance,           // flowplayer instantiation

  // private: debugging
      bDebugging,           // debug mode active?

  // private: uievents
      evExpand    = new Eventful.UIEvent(), // these events are for the sliders
      evContract  = new Eventful.UIEvent(); // and can only be fired from within the SiteSkin object

  // constructor
  var SiteSkin = function (oConfig) {
    // store inner-container, and return if there isn't one
    jqInnerContainer = $('#inner-container');
    if (!jqInnerContainer.length) return;

    // store head and body
    jqHead = $('head');
    jqBody = $('body');

    // setup: uievents
    this.onExpand   = new Eventful.UIEvent();
    this.onContract = new Eventful.UIEvent();

    var oQuery = $.parseQuery();
        oQuery.uri = window.location.pathname;
        oQuery.consume = true;
  
    // step 1: see if this page has a skin
    $.ajax({
      url:    '/json/siteskin',   // handler that hooks into campaign.pm
      data:   oQuery,             // pass along params like force_campaign
      cache:  false,              // do not cache, evar
      success: function (response) {
        // if there is no siteskin, our work here is done
        if (!response.active_campaign) return;

        // store skin details
        active_campaign = response.active_campaign;
        skin_config     = response.skin_config;

        // step 2: load templates for skin mechanism
        var templates = $('<div />').load('/siteskin', function () {
          // step 3: inject hb templates, and load skin-specific js (css gets loaded on deploy)
          jqBody.append(templates);
          jqHead.append('<link rel="stylesheet" type="text/css" href="'+skin_config.css+'" />');
          $.getScript(skin_config.js);

          // status
          Eventful.SiteSkin.status();
        });
      }
    });
  };

  SiteSkin.prototype = {
    constructor: SiteSkin,

    // expose skin configuration
    getSkinConfig: function () {
      return skin_config;
    },

    // expose takeover status
    getActiveCampaign: function () {
      return active_campaign;
    },

    /*
      Left Panel
    */
    addLeft: function (oConfig) {
      oConfig               = oConfig || {};
      oConfig.ord           = ord;
      oConfig.campaign_key  = skin_config.campaign_key;

      var tmplSiteskinLeft  = $('#tmpl_siteskin_left'),
          hbSiteskinLeft    = Handlebars.compile(tmplSiteskinLeft.html());
      // store in string as html
      hGeneratedSkin += hbSiteskinLeft(oConfig);

      return this;
    },

    /*
      Right Panel
    */
    addRight: function (oConfig) {
      oConfig               = oConfig || {};
      oConfig.ord           = ord;
      oConfig.campaign_key  = skin_config.campaign_key;

      var tmplSiteskinRight  = $('#tmpl_siteskin_right'),
          hbSiteskinRight    = Handlebars.compile(tmplSiteskinRight.html());

      // store in string as html
      hGeneratedSkin += hbSiteskinRight(oConfig);

      return this;
    },

    /*
      Pencil
    */
    addPencil: function (oConfig) {
      oConfig               = oConfig || {};
      oConfig.ord           = ord;
      oConfig.campaign_key  = skin_config.campaign_key;

      var tmplSiteskinPencil  = $('#tmpl_siteskin_pencil'),
          hbSiteskinPencil    = Handlebars.compile(tmplSiteskinPencil.html());

      // store in string as html
      hGeneratedSkin += hbSiteskinPencil(oConfig);

      return this;
    },

    /*
      Pencil Big (adaptive background color)
    */
    addPencilBig: function (oConfig) {
      oConfig = oConfig || {};
      oConfig.ord           = ord;
      oConfig.campaign_key  = skin_config.campaign_key;

      var tmplSiteskinPencilBig  = $('#tmpl_siteskin_pencil_big'),
          hbSiteskinPencilBig    = Handlebars.compile(tmplSiteskinPencilBig.html());

      // store in string as html
      hGeneratedSkin += hbSiteskinPencilBig(oConfig);

      return this;
    },

    /*
      Slider
    */
    addSlider: function (oConfig) {
      oConfig               = oConfig || {};
      oConfig.ord           = ord;
      oConfig.campaign_key  = skin_config.campaign_key;

      var tmplSiteskinSlider  = $('#tmpl_siteskin_slider'),
          hbSiteskinSlider    = Handlebars.compile(tmplSiteskinSlider.html());

      if (oConfig.flowplayer)
        fpConfig = oConfig.flowplayer;

      // store in string as html
      hGeneratedSkin += hbSiteskinSlider(oConfig);

      return this;
    },

    /*
      Slider Big (adaptive background color)
    */
    addSliderBig: function (oConfig) {
      oConfig               = oConfig || {};
      oConfig.ord           = ord;
      oConfig.campaign_key  = skin_config.campaign_key;

      var tmplSiteskinSliderBig  = $('#tmpl_siteskin_slider_big'),
          hbSiteskinSliderBig    = Handlebars.compile(tmplSiteskinSliderBig.html());
      
      if (oConfig.flowplayer)
        fpConfig = oConfig.flowplayer;

      // store in string as html
      hGeneratedSkin += hbSiteskinSliderBig(oConfig);

      return this;
    },

    /*
      Header
    */
    addHeader: function (oConfig) {
      oConfig               = oConfig || {};
      oConfig.ord           = ord;

      var tmplSiteskinHeader  = $('#tmpl_siteskin_header'),
          hbSiteskinHeader    = Handlebars.compile(tmplSiteskinHeader.html());

      // store in string as html
      hGeneratedSkin += hbSiteskinHeader(oConfig);

      return this;
    },

    /*
      Deploy
    */
    deploy: function () {
      // insert siteskin html into dom
      jqInnerContainer.prepend(hGeneratedSkin);
      hGeneratedSkin = '';

      // handle functionality of siteskin components
      this._handleLockingSides();
      this._handleExpandingSlider();
      this._handleExpandingSliderBig();
      this._handlePencilBig();

      // attach siteskin-active class to body, inject css
      jqBody.addClass('siteskin-active');

      return this;
    },

    /*
      Expand Slider Control
    */
    doExpand: function () {
      evExpand.fire();
    },

    /*
      Contract Slider Control
    */
    doContract: function () {
      evContract.fire();
    },

    /*
      _ Handles Big Pencil
    */
    _handlePencilBig: function () {
      var jqPencil = $('#siteskin-pencil-big-container');

      // return if there is no pencil big
      if (!jqPencil.length) return;

      var sColor = $('#content').css('background-color');
      jqPencil.css('background-color', sColor);
    },

    /*
      _ Handles Expanding Slider if it Exists
    */
    _handleExpandingSlider: function () {
      var jqPencil      = $('#siteskin-pencil'),
          jqSlider      = $('#siteskin-slider'),
          jqVideo       = $('#siteskin-video-container'),
          iSliderHeight = 300,
          _self         = this;

      // return if there is no slider doesn't exist
      if (!jqSlider.length) return;

      // close button for slider
      jqSlider.find('.close-box').live('click', _self.doContract);

      // hides pencil, expands slider
      function expand () {
        _self.onExpand.fire();

        jqPencil.hide();
        jqSlider.show().stop().animate({ height: iSliderHeight }, 'fast');

        _self._buildFlowplayer();
        $('#siteskin-video-bar').show();
      }

      // contracts slider, shows pencil
      function contract () {
        _self.onContract.fire();

        jqSlider.stop().animate({ height: 32 }, 'fast', function () {
          jqVideo.empty(); // destroy video
          jqSlider.hide(); // hide slider
          jqPencil.show(); // show pencil
        });
      }

      // attach expand() and contract() to uievents
      evContract.subscribe(contract);
      evExpand.subscribe(expand);

      // the slider starts out opened
      if (jqSlider.hasClass('slider-fixed')) {
        this._buildFlowplayer();
        return;
      }
      
      // the slider starts closed, and then expands, unless it's lazy,
      // in which case it doesn't open by itself
      if (!jqSlider.hasClass('slider-lazy')) this.doExpand.later(5000);
    },

    /*
      _ Handles Expanding Slider Big if it Exists
    */
    _handleExpandingSliderBig: function () {
      var jqPencil      = $('#siteskin-pencil-big-container'),
          jqSlider      = $('#siteskin-slider-big-container'),
          jqVideo       = $('#siteskin-video-container'),
          iSliderHeight = $('#siteskin-slider-big').height() + 20,
          _self         = this;

      // return if there is no slider doesn't exist
      if (!jqSlider.length) return;

      // sample color, and dynamically inject it into slider element
      var sColor = $('#content').css('background-color');
      jqSlider.css('background-color', sColor);

      // close button for slider
      jqSlider.find('.close-box').live('click', _self.doContract);

      // hides pencil, expands slider
      function expand () {
        _self.onExpand.fire();

        jqPencil.hide();
        jqSlider.show().stop().animate({ height: iSliderHeight }, 'fast');

        _self._buildFlowplayer();
        $('#siteskin-video-bar').show();
      }

      // contracts slider, shows pencil
      function contract () {
        _self.onContract.fire();

        jqSlider.stop().animate({ height: 32 }, 'fast', function () {
          jqVideo.empty(); // destroy video
          jqSlider.hide(); // hide slider
          jqPencil.show(); // show pencil
        });
      }

      // attach expand() and contract() to uievents
      evContract.subscribe(contract.bind(this));
      evExpand.subscribe(expand.bind(this));

      // the slider starts out opened
      if (jqSlider.hasClass('slider-fixed')) {
        this._buildFlowplayer();
        return;
      }
      
      // the slider starts closed, and then expands, unless it's lazy,
      // in which case it doesn't open by itself
      if (!jqSlider.hasClass('slider-lazy')) this.doExpand.later(5000);
    },

    /*
      _ Handles Locking Sides if they are set to Lock
    */
    _handleLockingSides: function () {
      // not supported by ie, because of performance issues
      if ($.browser.msie && $.browser.version < 8) return this;

      var jqLockingSides = $('.siteskin-component.side-locking');
      
      // return if component doesn't exist
      if (!jqLockingSides.length) return this;

      var jqWindow          = $(window),
          jqContent         = $('#content'),
          jqMidContainer    = $('#mid-container'),
          sBackgroundImg    = jqMidContainer.css('background-image'),
          sBackgroundColor  = jqMidContainer.css('background-color'),
          iPadding          = parseInt(jqMidContainer.css('margin-top'), 10),
          iSidePanelHeight  = jqLockingSides.height();

      jqWindow.bind("scroll resize", function () {

        var iScrollTop = jqWindow.scrollTop(),
            iMaxPos    = jqContent.offset().top,
            iHeight    = parseInt(jqContent.css('padding-top'), 10) + parseInt(jqContent.css('padding-bottom'), 10) + jqContent.height(),
            iMaxScroll = iMaxPos + iHeight - iSidePanelHeight - 120; // the -120, because the background is too tall

        // if css hasn't loaded yet, try to fetch image
        if (sBackgroundImg == 'none') {
          sBackgroundImg    = jqMidContainer.css('background-image');
          sBackgroundColor  = jqMidContainer.css('background-color');

          // no need to lock anything, if we don't have a background
          if (sBackgroundImg == 'none') return;
        }

        // lock em down
        if (iScrollTop > iMaxScroll) {
          jqMidContainer.css("background", sBackgroundColor + " " + sBackgroundImg + " no-repeat center " + iMaxScroll + "px");
          jqLockingSides.css('top', iMaxScroll - 300);
        } else {
          jqMidContainer.css("background", sBackgroundColor + " " + sBackgroundImg + " no-repeat center top fixed");
          jqLockingSides.css('top', iScrollTop - 300);
        }
        
        jqMidContainer.redraw(iPadding);
      });

      return this;
    },

    /*
      _ Sets up Eventful.Flowplayer Config Object through abstraction of simple common controls for site skin
    */
    _setupFlowplayer: function () {
      var _self = this;

      return {
        url:        fpConfig.url,
        gaAction:   Eventful.SiteSkin.getActiveCampaign().name + ' SiteSkin Video',
        autoPlay:   fpConfig.autoplay || false,
        autoLoop:   fpConfig.loop || false,
        elementID:  'siteskin-video-container',
        onload:     function () {
          var _fp = fpInstance.oFlowPlayer;

          // set volume to mute
          _fp.setVolume(0);

          // show overlay if it exists
          if (fpConfig.overlay) {
            var jqVideoBar = $('#siteskin-video-bar');
            
            jqVideoBar.live('click', function () {
              jqVideoBar.hide();
              _fp.setVolume(50);
              _fp.play();
            });
          } else {
            _fp.setVolume(50);
            if (fpConfig.autoplay) _fp.play();
          }
        }
      } 
    },

    /*
      _ Instantiates Flowplayer
    */
    _buildFlowplayer: function () {
      if (!fpConfig) return;
      fpInstance = new Eventful.Flowplayer(this._setupFlowplayer());
    },

    /*
      Debug Tool
    */
    debug: function () {
      var tmplSiteskinDebug = $('#tmpl_siteskin_debug');
        if (!tmplSiteskinDebug.length) return this;

      var hbSiteskinDebug = Handlebars.compile(tmplSiteskinDebug.html());

      if (bDebugging) {
        bDebugging = false;
        $('.siteskin-component.debug').removeClass('debug');
        $('.siteskin-component .siteskin-debug-info').remove();
        return this;
      }

      bDebugging = true;

      $('.siteskin-component').each(function (_, el) {
        jqEl    = $(el),
        w       = jqEl.outerWidth(),
        h       = jqEl.outerHeight(),
        name    = jqEl.attr('id').split('siteskin-')[1],
        oDebug  = { 'name': name, 'w': w, 'h': h }

        jqEl.addClass('debug')
        jqEl.append(hbSiteskinDebug(oDebug));
      });
    },

    /*
      Takeover Status Panel
    */
    status: function () {
      var tmplSiteskinTakeoverStatus = $('#tmpl_siteskin_takeover_status');
        if (!tmplSiteskinTakeoverStatus.length) return this;

      var hbSiteskinTakeoverStatus = Handlebars.compile(tmplSiteskinTakeoverStatus.html());

      $('#siteskin-toggle-debug').live('click', Eventful.SiteSkin.debug);

      // create shorthand for css and js
      skin_config.css_short = skin_config.css.split('/').pop();
      skin_config.js_short = skin_config.js.split('/').pop();

      jqBody.prepend(hbSiteskinTakeoverStatus({
        skin_config: skin_config,
        active_campaign: active_campaign
      }));
    }
  };

  $(window).load(function () {
    setTimeout(function () {
      Eventful.SiteSkin = new SiteSkin();
    }, 500);
  });

  // instantiate
  Eventful.SiteSkin = new SiteSkin();
}(window.jQuery);

// DEPENDENCY: jQuery Plugin - redraw()
jQuery.fn.redraw = function (padding) {
  if (parseInt(this.css('margin-top'), 10) == padding) {
    padding++;
  }
  
  return this.css('margin-top', padding + "px");
};

// DEPENDENCY: Handlebars Helper - safeHtml
Handlebars.registerHelper('safeHtml', function(text) {
  return new Handlebars.SafeString(text + "");
});
