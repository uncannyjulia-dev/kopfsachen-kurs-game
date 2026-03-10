// cms/config/admin.js
'use strict'

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '/M7EfNaASwL878h6KHuCGb4oumJBDsG15OcMX9WMU6Q='),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'Tzw2mIDDnD42jp/vX51iqxRfVaQYrQPntCSUGuPP0i4='),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'kP8xWz3nL9mQ2vR5tY7uA0cE4fG6hJ1i'),
    },
  },
})
