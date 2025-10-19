import axios from '../axios';
import { ethers } from 'ethers';

const contractAddress = process.env.CONTRACT_ADDRESS;
const abi = [
  {
    "type": "event",
    "name": "PetAdded",
    "inputs": [
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": false, "name": "petId", "type": "string" }
    ]
  },
  {
    "type": "event",
    "name": "PetUpdated",
    "inputs": [
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": false, "name": "petId", "type": "string" }
    ]
  },
  {
    "type": "event",
    "name": "PetRemoved",
    "inputs": [
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": false, "name": "petId", "type": "string" }
    ]
  },
  {
    "type": "function",
    "name": "addPet",
    "inputs": [
      { "name": "petId", "type": "string" },
      { "name": "petName", "type": "string" },
      { "name": "petType", "type": "string" },
      { "name": "petGender", "type": "string" },
      { "name": "petWeight", "type": "uint256" },
      { "name": "age", "type": "uint256" },
      { "name": "petStatus", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getPets",
    "inputs": [{ "name": "owner", "type": "address" }],
    "outputs": [
      {
        "type": "tuple[]",
        "components": [
          { "name": "petId", "type": "string" },
          { "name": "petName", "type": "string" },
          { "name": "petType", "type": "string" },
          { "name": "petGender", "type": "string" },
          { "name": "petWeight", "type": "uint256" },
          { "name": "age", "type": "uint256" },
          { "name": "petStatus", "type": "string" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "updatePet",
    "inputs": [
      { "name": "petId", "type": "string" },
      { "name": "petName", "type": "string" },
      { "name": "petType", "type": "string" },
      { "name": "petGender", "type": "string" },
      { "name": "petWeight", "type": "uint256" },
      { "name": "age", "type": "uint256" },
      { "name": "petStatus", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removePet",
    "inputs": [{ "name": "petId", "type": "string" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

const handleGetAccountPetInfoApi = (accountid) => {
  return axios.get(`/api/get-account-petinfo?accountid=${accountid}`);
};

const handleGetPetInfoApi = (petid) => {
  return axios.get(`/api/get-petinfo?petid=${petid}`);
};

const handleSavePetInfoApi = async (accountid, petInfo, signer) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const petId = `P${Date.now()}`;
    const tx = await contract.addPet(
      petId,
      petInfo.petname,
      petInfo.pettype,
      petInfo.petgender,
      petInfo.petweight,
      petInfo.age,
      'VALID'
    );
    await tx.wait();
    return { data: { errCode: 0, errMessage: 'Lưu thông tin thú cưng thành công!', data: { PetID: petId } } };
  } catch (e) {
    console.error('Error in handleSavePetInfoApi:', e);
    return { data: { errCode: 3, errMessage: `Lỗi khi lưu thú cưng: ${e.message}`, data: null } };
  }
};

const handleChangePetInfoApi = async (petid, petInfo, signer) => {
  try {
    console.log('handleChangePetInfoApi - petid:', petid, 'petInfo:', petInfo); // Debug
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log('Calling updatePet with:', { petid, ...petInfo }); // Debug
    const tx = await contract.updatePet(
      petid,
      petInfo.petname,
      petInfo.pettype,
      petInfo.petgender,
      petInfo.petweight,
      petInfo.age,
      petInfo.petStatus || 'VALID'
    );
    console.log('Transaction sent:', tx.hash); // Debug
    await tx.wait();
    console.log('Transaction confirmed:', tx.hash); // Debug
    return { data: { errCode: 0, errMessage: 'Cập nhật thông tin thú cưng thành công!', data: null } };
  } catch (e) {
    console.error('Error in handleChangePetInfoApi:', e);
    return { data: { errCode: 3, errMessage: `Lỗi khi cập nhật thông tin: ${e.message}`, data: null } };
  }
};

const handleRemovePetApi = async (petid, signer) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.removePet(petid);
    await tx.wait();
    return { data: { errCode: 0, errMessage: 'Xóa thú cưng thành công!', data: null } };
  } catch (e) {
    console.error('Error in handleRemovePetApi:', e);
    return { data: { errCode: 3, errMessage: `Lỗi khi xóa thú cưng: ${e.message}`, data: null } };
  }
};

export {
  handleGetAccountPetInfoApi,
  handleGetPetInfoApi,
  handleSavePetInfoApi,
  handleChangePetInfoApi,
  handleRemovePetApi,
};
