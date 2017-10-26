/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-slide-cropper',

  included: function(app) {
    this._super.included(app);

    app.import('vendor/jquery-ui/jquery-ui.interactions.js');
  }
};
