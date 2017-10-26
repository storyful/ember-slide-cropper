import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/slide-crop-slider';

const NS = "slide-crop-slider";

export default Component.extend({

  layout,

  NS,

  classNames: [NS],

  handle: 0,

  increment: 0.05,

  actions: {
    minus(){
      let value = this.get('handle') - this.get('increment');
      this.set('handle', value < 0 ? 0 : value );
    },
    plus(){
      let value = this.get('handle') + this.get('increment');
      this.set('handle', value > 1 ? 1 : value );
    }
  },

  didInsertElement(){
    this.updateSizes();
    this.initDraggable();
  },

  updateSizes(){
    this.set('handleWidth', this.$('[data-slide-crop-handle]').width());
  },

  initDraggable(){
    let self = this;
    let $handle = this.$('[data-slide-crop-handle]');

    $handle.draggable({
      containment: 'parent',
      axis: 'x',
      helper: function(){
        return '<span></span>';
      },
      drag: function( event, ui ) {
        let $container = self.$('[data-slide-crop-container]');
        self.set('handle', ui.position.left / $container.width());
      }
    });
  },

  handleStyle: computed('handle', function(){
    let handle = this.get('handle') * 100;
    let style = `left: ${handle}%;`;

    return htmlSafe(style);
  }),

  didHandleUpdated: observer('handle', function(){
    let min = parseFloat(this.get('min'));
    let max = parseFloat(this.get('max'));
    let pos = parseFloat(this.get('handle'));
    let value = ((max - min) * pos) + min;

    this.set('value', value);
  })
});
