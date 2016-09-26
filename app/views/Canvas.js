import m from 'mithril';

import './canvas.less';
import lena_img from 'app/lena_mini.png';

const debug = require('debug')('app/widgets/Canvas');

const WIDTH = 128;
const HEIGHT = 128;



const Canvas = {
  controller () {
    const ctrl = this;
    let ctx, context;

    ctrl.conv_matrix = [
      [ 0, 0, 0 ],
      [ 0, 1, 0 ],
      [ 0, 0, 0 ],
    ];

    ctrl.initCanvas = (el, inited) => {
      if(inited) {
        return;
      }
      ctx = context = el.getContext('2d');
      ctrl.loadImg();
    };

    ctrl.loadImg = () => {
      let img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        debug(ctx.getImageData(0, 0, WIDTH, HEIGHT).data.filter((d, i) => {
          return i % 4 == 3;
        }).reduce((obj, n) => {
          obj[n] = obj[n] || 0;
          obj[n]++;
          return obj;
        }, {}));
      };
      img.src = lena_img;
    };

    function drawPixel(ctx, x, y, rgba) {
      let id = ctx.createImageData(1, 1);
      let d = id.data;
      const [ r, g, b, a ] = rgba;
      d[0] = r;
      d[1] = g;
      d[2] = b;
      d[3] = a;
      ctx.putImageData(id, x, y);
    }

    function readPixelData(ctx, x, y) {
      return ctx.getImageData(x, y, 1, 1).data;
    }

    function applyConvMatrix(ctx) {
      const conv_matrix = ctrl.conv_matrix;
      let data = [];
      for(let i = 0; i < WIDTH; i++) {
        data[i] = [];
        for(let j = 0; j < HEIGHT; j++) {
          data[i].push(readPixelData(ctx, i, j));
        }
      }
      for(let i = 1; i < WIDTH - 1; i++) {
        for(let j = 1; j < HEIGHT - 1; j++) {
          const [x, y] = [i, j];
          const dataPoints = [
            [data[x - 1][y - 1], data[x][y - 1], data[x + 1][y - 1]],
            [data[x - 1][y + 0], data[x][y + 0], data[x + 1][y + 0]],
            [data[x - 1][y + 1], data[x][y + 1], data[x + 1][y + 1]],
          ];
          let r = 0, g = 0, b = 0, a = data[x][y][3];

          for(let conv_i = 0; conv_i < conv_matrix.length; conv_i++) {
            for(let conv_j = 0; conv_j < conv_matrix[conv_i].length; conv_j++) {
              const mul = conv_matrix[conv_i][conv_j];
              r += mul * dataPoints[conv_i][conv_j][0];
              g += mul * dataPoints[conv_i][conv_j][1];
              b += mul * dataPoints[conv_i][conv_j][2];
            }
          }
          r = Math.min(255, Math.max(0, r));
          g = Math.min(255, Math.max(0, g));
          b = Math.min(255, Math.max(0, b));
          drawPixel(ctx, i, j, [r, g, b, a]);
        }
      }
    }

    function lowerOpactiy(ctx) {
      for(let i = 0; i < WIDTH; i++) {
        for(let j = 0; j < HEIGHT; j++) {
          const [r, g, b, a] = readPixelData(ctx, i, j);
          drawPixel(ctx, i, j, [r, g, b, Math.max(50, a - 50)]);
        }
      }
    }
    function increaseOpactiy(ctx) {
      for(let i = 0; i < WIDTH; i++) {
        for(let j = 0; j < HEIGHT; j++) {
          const [r, g, b, a] = readPixelData(ctx, i, j);
          drawPixel(ctx, i, j, [r, g, b, Math.min(255, a + 50)]);
        }
      }
    }

    ctrl.threshold = m.prop(100);

    function threshold(threshold, rgb) {
      const [ r, g, b ] = rgb;
      if(r * g * b > Math.pow(threshold, 3)) {
        return [ 255, 255, 255 ];
      }
      return [ 0, 0, 0 ];
    }

    function thresholding(ctx) {
      for(let i = 0; i < WIDTH; i++) {
        for(let j =  0; j < HEIGHT; j++) {
          const origRGBA = readPixelData(ctx, i, j);
          const [ r, g, b ] = threshold(ctrl.threshold(), origRGBA);
          drawPixel(ctx, i, j, [ r, g, b, origRGBA[3] ]);
        }
      }
    }

    ctrl.dimmer = () => {
      lowerOpactiy(ctx);
    };

    ctrl.brighter = () => {
      increaseOpactiy(ctx);
    };

    ctrl.thresholding = () => {
      thresholding(ctx);
    };

    ctrl.filter = () => {
      applyConvMatrix(ctx);
    };

    ctrl.changeConvValue = (x, y, v) => {
      ctrl.conv_matrix[x][y] = v;
    };
  },
  view (ctrl) {
    return m('.Canvas', [
      m('button', {onclick: ctrl.loadImg}, 'reload image'),
      m('br'),
      m('button', {onclick: ctrl.dimmer}, 'dimmer'),
      m('button', {onclick: ctrl.brighter}, 'brighter'),
      m('br'),
      m('span', 'threshold:'),
      m('input', {
        value: ctrl.threshold(),
        oninput: m.withAttr('value', ctrl.threshold),
      }),
      m('button', {onclick: ctrl.thresholding}, 'threshold'),
      m('br'),
      m('button', {onclick: ctrl.filter}, 'apply conv matrix'),
      m('br'),
      ctrl.conv_matrix.map((row, i) => {
        return m('.row', row.map((n, j) => {
          return m('input', {
            value: n,
            oninput: m.withAttr('value', ctrl.changeConvValue.bind(ctrl, i, j)),
          });
        }));
      }),
      m('canvas', {
        config: ctrl.initCanvas,
        width: WIDTH,
        height: HEIGHT,
      }),
    ]);
  }
};

export default Canvas;
