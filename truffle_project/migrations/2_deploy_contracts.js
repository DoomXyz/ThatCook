const PetRegistry = artifacts.require("PetRegistry");

module.exports = function (deployer) {
    deployer.deploy(PetRegistry);
};