import m from 'mithril';
import Canvas from 'app/views/Canvas';

import 'normalize.css';

function mountApplication() {
  const el = document.getElementById('app');
  m.mount(el, m(Canvas));
}

function init() {
  require('app/styles/style.less');

  mountApplication();
}

window.onload = init;

if(module.hot) {
  module.hot.accept();
  init();

  // setup debug
  localStorage.debug = 'app/*';
}

