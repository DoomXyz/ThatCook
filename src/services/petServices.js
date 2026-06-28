import axios from '../axios';
import { ethers } from 'ethers';
import { validatePetInput } from '../utils/pakage';

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
const handleGetAccountPetInfoApi = (AccountID) => {
  return axios.get(`/api/get-account-petinfo?AccountID=${AccountID}`);
};
const handleGetPetInfoApi = (AccountID, PetID) => {
  return axios.get(`/api/get-petinfo?AccountID=${AccountID}&PetID=${PetID}`);
};
const handleSavePetInfoApi = async (petInfo, signer) => {
  try {
    const isValidateInput = await validatePetInput(petInfo);
    if (!isValidateInput.valid) {
      return {
        errCode: 1,
        errMessage: isValidateInput.errMessage,
        data: null
      }
    }
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const PetID = `P${Date.now().toString().slice(-9).padStart(9, '0')}`;
    console.log(petInfo)
    const tx = await contract.addPet(
      PetID,
      petInfo.PetName,
      petInfo.PetType,
      petInfo.PetGender,
      petInfo.PetWeight,
      petInfo.Age,
      'VALID',
      petInfo.PetImage,
    );
    await tx.wait();
    return {
      errCode: 0,
      errMessage: 'Lưu thông tin thú cưng thành công!',
      data: null
    };
  } catch (e) {
    console.log(e)
    return {
      errCode: 3,
      errMessage: `Lỗi khi lưu thú cưng`,
      data: null
    };
  }
};
const handleChangePetInfoApi = async (PetID, petInfo, signer) => {
  try {
    const isValidateInput = await validatePetInput(petInfo);
    if (!isValidateInput.valid) {
      return {
        errCode: 1,
        errMessage: isValidateInput.errMessage,
        data: null
      }
    }
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.updatePet(
      PetID,
      petInfo.PetName,
      petInfo.PetType,
      petInfo.PetGender,
      petInfo.PetWeight,
      petInfo.Age,
      petInfo.PetStatus || 'VALID',
      petInfo.PetImage || ''
    );
    await tx.wait();
    return {
      errCode: 0,
      errMessage: 'Cập nhật thông tin thú cưng thành công!',
      data: null
    };
  } catch (e) {
    return {
      errCode: 3,
      errMessage: `Lỗi khi cập nhật thông tin thú cưng`,
      data: null
    }
  }
};
const handleRemovePetApi = async (PetID, signer) => {
  try {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.removePet(PetID);
    await tx.wait();
    return {
      errCode: 0,
      errMessage: 'Xóa thú cưng thành công!',
      data: null
    };
  } catch (e) {
    return {
      errCode: 3,
      errMessage: `Lỗi khi xóa thú cưng`,
      data: null
    };
  }
};
export {
  handleGetAccountPetInfoApi,
  handleGetPetInfoApi,
  handleSavePetInfoApi,
  handleChangePetInfoApi,
  handleRemovePetApi,
};
