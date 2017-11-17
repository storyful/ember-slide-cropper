import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Controller.extend({

  actions: {
    doSomething(data){
      this.set('cropAttrs', data);
    }
  },

  previewStyles: computed('cropAttrs', function(){
    return htmlSafe(`
      width:  ${parseInt( get(this, 'cropAttrs.width') )}px;
      height: ${parseInt( get(this, 'cropAttrs.height') )}px;
      left:   ${parseInt( get(this, 'cropAttrs.x') )}px;
      top:    ${parseInt( get(this, 'cropAttrs.y') )}px;
    `);
  })

});
