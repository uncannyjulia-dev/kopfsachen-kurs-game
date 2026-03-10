// cms/config/server.js
'use strict'

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', [
      'ey/mdtDFeKohCaB1XYP8Z0CgIHPOvhphepZ72dXKHD0=',
      'T+Jz9PMIZcs2Fe/HA9XiIUQUvh+UXiki3/eySePhOVY=',
    ]),
  },
})
