module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 8000000, // Tăng gas
      gasPrice: 20000000000 // 20 gwei
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.21",
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
  }
};