// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PetRegistry {
    struct Pet {
        string petId;
        string petName;
        string petType;
        string petGender;
        uint256 petWeight;
        uint256 age;
        string petStatus;
    }

    mapping(address => Pet[]) public pets;

    event PetAdded(address indexed owner, string petId);
    event PetUpdated(address indexed owner, string petId);
    event PetRemoved(address indexed owner, string petId);

    function addPet(
        string memory petId,
        string memory petName,
        string memory petType,
        string memory petGender,
        uint256 petWeight,
        uint256 age,
        string memory petStatus
    ) public {
        require(bytes(petId).length > 0, "Pet ID is required");
        require(bytes(petName).length > 0, "Pet name is required");
        require(bytes(petType).length > 0, "Pet type is required");
        require(bytes(petGender).length > 0, "Pet gender is required");
        require(petWeight > 0, "Weight must be positive");
        require(age >= 0, "Age cannot be negative");

        // Đếm số lượng thú cưng VALID
        uint256 validCount = 0;
        for (uint256 i = 0; i < pets[msg.sender].length; i++) {
            if (keccak256(bytes(pets[msg.sender][i].petStatus)) == keccak256(bytes("VALID"))) {
                validCount++;
            }
        }
        require(validCount < 3, "Maximum 3 VALID pets allowed per account");

        pets[msg.sender].push(Pet(petId, petName, petType, petGender, petWeight, age, petStatus));
        emit PetAdded(msg.sender, petId);
    }

    function getPets(address owner) public view returns (Pet[] memory) {
        return pets[owner];
    }

    function updatePet(
        string memory petId,
        string memory petName,
        string memory petType,
        string memory petGender,
        uint256 petWeight,
        uint256 age,
        string memory petStatus
    ) public {
        require(bytes(petId).length > 0, "Pet ID is required");
        require(bytes(petName).length > 0, "Pet name is required");
        require(bytes(petType).length > 0, "Pet type is required");
        require(bytes(petGender).length > 0, "Pet gender is required");
        require(petWeight > 0, "Weight must be positive");
        require(age >= 0, "Age cannot be negative");

        Pet[] storage userPets = pets[msg.sender];
        for (uint256 i = 0; i < userPets.length; i++) {
            if (keccak256(bytes(userPets[i].petId)) == keccak256(bytes(petId))) {
                userPets[i].petName = petName;
                userPets[i].petType = petType;
                userPets[i].petGender = petGender;
                userPets[i].petWeight = petWeight;
                userPets[i].age = age;
                userPets[i].petStatus = petStatus;
                emit PetUpdated(msg.sender, petId);
                return;
            }
        }
        revert("Pet not found");
    }

    function removePet(string memory petId) public {
        require(bytes(petId).length > 0, "Pet ID is required");
        Pet[] storage userPets = pets[msg.sender];
        for (uint256 i = 0; i < userPets.length; i++) {
            if (keccak256(bytes(userPets[i].petId)) == keccak256(bytes(petId))) {
                // Di chuyển phần tử cuối lên vị trí xóa và pop
                userPets[i] = userPets[userPets.length - 1];
                userPets.pop();
                emit PetRemoved(msg.sender, petId);
                return;
            }
        }
        revert("Pet not found");
    }
}