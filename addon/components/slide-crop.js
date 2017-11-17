import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { run } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/slide-crop';

const NS = 'slide-crop';

export default Component.extend({

  layout,

  NS,

  classNames: [NS],

  // default attributes

  zoom: 100,
  minZoom: 100,
  maxZoom: 300,

  // internal

  loading: false,

  top: 0,
  left: 0,
  width: null,
  height: null,

  actions: {
    crop(){
      this.sendAction('onCrop', this.getCropObject());
    }
  },

  didInsertElement(){
    this.initDraggable();
    this.initImage();
  },

  initDraggable(){
    let self = this;
    let $preview = this.$('[data-slide-crop-preview]');

    $preview.draggable({
      helper: function(){
        return '<span></span>';
      },
      drag: function( event, ui ) {
        self.set('top', self.getPosition(ui.position.top, self.get('topLimit')));
        self.set('left', self.getPosition(ui.position.left, self.get('leftLimit')));
      }
    });
  },

  initImage(){
    let $preview = this.$('[data-slide-crop-preview]');

    this.set('loading', true);
    this.reset();

    $preview.on('load', this.onImageLoad.bind(this));
  },

  onImageLoad(){
    this.set('loading', false);
    this.updateImageSize();
    this.updateZoom();
    this.sendAction('onLoad', this.getCropObject());
  },

  reset(){
    this.set('width', null);
    this.set('height', null);
    this.set('top', 0);
    this.set('left', 0);
  },

  updateImageSize(){
    let $preview    = this.$('[data-slide-crop-preview]');

    let crop       = { width: this.get('cropWidth'), height: this.get('cropHeight') };
    let original   = { width: $preview.width(), height: $preview.height() };
    let sizes      = {};
    let newSize    = {};

    // console.debug('crop: Image loaded', original);

    original.ratio = original.width / original.height;
    crop.ratio     = crop.width / crop.height;

    let isSameRatio = original.ratio > crop.ratio;

    sizes.landscape = {
      height: crop.height,
      width:  original.width * (crop.height / original.height)
    };

    sizes.portrait = {
      width:  crop.width,
      height: original.height * (crop.width / original.width)
    };

    newSize = (isSameRatio) ? sizes.landscape : sizes.portrait;

    this.set('imageWidth', original.width);
    this.set('imageHeight', original.height);

    this.set('_width', newSize.width);
    this.set('_height', newSize.height);

    this.set('width', newSize.width);
    this.set('height', newSize.height);
  },

  updateZoom(){
    let style = {};
    let $preview = this.$('[data-slide-crop-preview]');
    let zoom  = this.get('zoom') / 100;

    // calculate new size
    style.width   = this.get('_width') * zoom;
    style.height  = this.get('_height') * zoom;

    // calculate center
    style.x = Math.abs(this.get('left')) + this.get('cropWidth') / 2;
    style.y = Math.abs(this.get('top')) + this.get('cropHeight') / 2;

    style.ratio = style.width / $preview.width();

    // adjust position to center image
    style.newX = style.x * style.ratio;
    style.newY = style.y * style.ratio;

    // update style position
    style.left = this.get('left') - (style.newX - style.x);
    style.top = this.get('top') - (style.newY - style.y);

    this.set('top', this.getPosition( style.top, this.get('topLimit')) );
    this.set('left', this.getPosition( style.left, this.get('leftLimit')) );

    this.set('width', style.width);
    this.set('height', style.height);
  },

  /* preview */

  didImageUpdated: observer('image', function(){
    this.initImage();
  }),

  didZoomUpdated: observer('zoom', function(){
    this.updateZoom();
  }),

  didCropUpdated: observer('zoom', 'left', 'top', 'clipLeft', 'clipTop', 'clipWidth', 'clipHeight', function(){
    run.debounce(this, this.sendUpdate, 500);
  }),

  /* drag limits */

  leftLimit: computed('width', 'height', function(){
    return -Math.abs( parseFloat(this.get('width') - this.get('cropWidth')) );
  }),

  topLimit: computed('width', 'height', function(){
    return -Math.abs( parseFloat(this.get('height') - this.get('cropHeight')) );
  }),

  previewStyle: computed('top', 'left', 'width', 'height', function(){
    let cropWidth = this.get('cropWidth');
    let cropHeight = this.get('cropHeight');
    let style = `width: ${cropWidth}px; height: ${cropHeight}px`;

    return htmlSafe(style);
  }),

  imageStyle: computed('top', 'left', 'width', 'height', function(){
    let top     = parseFloat(this.get('top'));
    let left    = parseFloat(this.get('left'));
    let width   = this.get('width') ? parseFloat(this.get('width')) + 'px' : 'initial';
    let height  = this.get('height') ? parseFloat(this.get('height')) + 'px' : 'initial';
    let style   = `top: ${top}px; left: ${left}px; width: ${width}; height: ${height}`;

    return htmlSafe(style);
  }),

  getPosition(coordinate, min){
    return (coordinate > 0) ? 0 : (min < coordinate) ? parseFloat(coordinate) : min;
  },

  /* clip values */

  aspectRatio: computed('zoom', function(){
    return this.get('cropWidth') / this.get('cropHeight');
  }),

  ratio: computed('width', 'imageWidth', function(){
    return this.get('width') / this.get('imageWidth');
  }),

  clipTop: computed('top', 'ratio', function(){
    return  parseFloat( Math.abs(this.get('top')) / this.get('ratio') );
  }),

  clipLeft: computed('left', 'ratio', function(){
    return  parseFloat( Math.abs(this.get('left')) / this.get('ratio') );
  }),

  clipWidth: computed('ratio', function(){
    return (this.get('cropWidth') / this.get('width')) * this.get('imageWidth');
  }),

  clipHeight: computed('ratio', function(){
    return (this.get('cropHeight') / this.get('height')) * this.get('imageHeight');
  }),

  sendUpdate(){
    this.sendAction('onUpdate', this.getCropObject())
  },

  getCropObject(){
    let zoom = this.get('zoom') / 100;

    return {
      zoom,
      x: this.get('clipLeft'),
      y: this.get('clipTop'),
      width: this.get('clipWidth'),
      height: this.get('clipHeight')
    };
  }

});
