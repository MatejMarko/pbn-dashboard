module.exports = [
  {
    context: [
      "/prijava",
      "/bnk",
      "/pbn",
    ],
    target: "https://tmbankanet.otpbanka.si",
    secure: false,
    changeOrigin: true,
    logLevel: "debug",
    cookieDomainRewrite: {
      "*": "localhost"
    },
    cookiePathRewrite: {
      "*": "/"
    },
    onProxyRes: function (proxyRes, req, res) {
      console.log('[proxy]', proxyRes.statusCode, req.url);
      if (proxyRes.headers.location) {
        const original = proxyRes.headers.location;
        proxyRes.headers.location = original.replace(
          "https://tmbankanet.otpbanka.si",
          "http://localhost:4200"
        );
        console.log('[proxy] location rewrite:', original, '→', proxyRes.headers.location);
      }
    },
    bypass: function (req, res, proxyOptions) {
      if (req.headers.accept && req.headers.accept.indexOf("html") !== -1) {
        return "/index.html";
      }
      return null;
    },
  }
];
