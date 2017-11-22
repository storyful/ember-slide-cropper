import Component from '@ember/component';
import layout from '../templates/components/slide-cropper';

const NS = 'slide-cropper';

export default Component.extend({

  layout,

  NS,

  classNames: [NS],

  zoom: 100,
  minZoom: 100,
  maxZoom: 300,
  preview: true,
  controls: true,

  actions: {
    onLoad(){
      this.sendAction('onLoad', ...arguments);
    },
    onUpdate(){
      this.sendAction('onUpdate', ...arguments);
    },
  }

});
