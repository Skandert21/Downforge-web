
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 639, hash: '74d20680f7fc5a2f045fd8e182c8e66b1a7d772e7e8f67ddc27522c01436e8a7', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 949, hash: '1131d1b20b300b81553e1b3d2282ebee59495d28744856812412b697d01220ca', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 4652, hash: '7636e2a517281828039783bf04199035a8d2b8b9b981dbb7de7aa26c124c1672', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-WFI2MSK5.css': {size: 2546, hash: 'EfR8DE5cGsg', text: () => import('./assets-chunks/styles-WFI2MSK5_css.mjs').then(m => m.default)}
  },
};
