import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    doSomething(data){
      console.log('data', data);
    }
  }

});
