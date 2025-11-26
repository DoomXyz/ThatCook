import axios from '../axios';
import { ethers } from 'ethers';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
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
      { "name": "petStatus", "type": "string" },
      { "name": "petImage", "type": "string" }
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
          { "name": "petStatus", "type": "string" },
          { "name": "petImage", "type": "string" }
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
      { "name": "petStatus", "type": "string" },
      { "name": "petImage", "type": "string" }
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

const handleGetPetInfoApi = (accountid, petid) => {
  return axios.get(`/api/get-petinfo?accountid=${accountid}&petid=${petid}`);
};

const handleSavePetInfoApi = async (petInfo, signer) => {
  try {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log('pet: ', petInfo)

    const petId = `P${Date.now().toString().slice(-9).padStart(9, '0')}`;
    const tx = await contract.addPet(
      petId,
      petInfo.petname,
      petInfo.pettype,
      petInfo.petgender,
      petInfo.petweight,
      petInfo.age,
      'VALID',
      petInfo.petimage
    );
    await tx.wait();
    return { data: { errCode: 0, errMessage: 'Lưu thông tin thú cưng thành công!', data: { PetID: petId } } };
  } catch (e) {
    console.error('Error in handleSavePetInfoApi:', e);
    return { data: { errCode: 3, errMessage: `Lỗi khi lưu thú cưng`, data: null } };
  }
};

const handleChangePetInfoApi = async (petid, petInfo, signer) => {
  try {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.updatePet(
      petid,
      petInfo.petname,
      petInfo.pettype,
      petInfo.petgender,
      petInfo.petweight,
      petInfo.age,
      petInfo.petStatus || 'VALID',
      petInfo.petImage || ''
    );
    await tx.wait();
    return { data: { errCode: 0, errMessage: 'Cập nhật thông tin thú cưng thành công!', data: null } };
  } catch (e) {
    return {
      data: {
        errCode: 3,
        errMessage: `Lỗi khi cập nhật thông tin`,
        data: null
      }
    };
  }
};

const handleRemovePetApi = async (petid, signer) => {
  try {
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
