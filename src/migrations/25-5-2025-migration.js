'use strict';

//Ngày cuối chỉnh sửa: 25/05/2025
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tạo bảng AllCodes
    await queryInterface.createTable(
      'AllCodes',
      {
        CodeID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        Type: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        Code: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        CodeValueVI: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        ExtraValue: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
      },
      {
        indexes: [
          { unique: true, fields: ['Type', 'Code'], name: 'unique_type_code' },
          { fields: ['Type'], name: 'index_type' },
        ],
      }
    );

    // Tạo bảng Account
    await queryInterface.createTable(
      'Account',
      {
        AccountID: {
          type: Sequelize.STRING(10),
          primaryKey: true,
          allowNull: false,
        },
        AccountName: {
          type: Sequelize.STRING(50),
          allowNull: false,
          collate: 'utf8mb4_bin',
        },
        Email: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        Password: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        UserName: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        UserImage: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        Phone: {
          type: Sequelize.STRING(11),
          allowNull: false,
        },
        Address: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        Gender: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        LoginAttempt: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        LockUntil: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        CreatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        AccountStatus: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        AccountType: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
      },
      {
        indexes: [
          { unique: true, fields: ['Email'], name: 'unique_email' },
          { fields: ['Phone'], name: 'index_phone' },
          { fields: ['UserName'], name: 'index_username' },
        ],
      }
    );

    // Tạo bảng Pet
    await queryInterface.createTable('Pet', {
      PetID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      PetName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      AccountID: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      PetType: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      PetWeight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      Age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      PetGender: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      PetStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
    });

    // Tạo bảng Service
    await queryInterface.createTable('Service', {
      ServiceID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ServiceName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      Price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      Duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ServiceStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
    },
      {
        indexes: [
          { fields: ['ServiceName'], name: 'index_service_name' },
        ],
      });
    // Tạo bảng Appointment
    await queryInterface.createTable('Appointment', {
      AppointmentID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      CustomerName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      CustomerEmail: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      CustomerPhone: {
        type: Sequelize.STRING(11),
        allowNull: false,
      },
      AppointmentDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      StartTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      EndTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      Notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      CreatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      AppointmentStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      AccountID: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      VeterinarianID: {
        type: Sequelize.STRING(10),
        allowNull: true,
        references: { model: 'Account', key: 'AccountID' },
        onDelete: 'CASCADE',
      },
      ServiceID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Service', key: 'ServiceID' },
        onDelete: 'CASCADE',
      },
      PetID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Pet', key: 'PetID' },
        onDelete: 'CASCADE',
      },
      AppointmentType: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      PrevAppointmentID: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
    },
      {
        indexes: [
          { fields: ['AccountID'], name: 'index_account_id' },
          { fields: ['VeterinarianID'], name: 'index_veterinarian_id' },
          { fields: ['ServiceID'], name: 'index_service_id' },
          { fields: ['PetID'], name: 'index_pet_id' },
          { fields: ['AppointmentDate'], name: 'index_appointment_date' },
        ],
      });

    // Tạo bảng AppointmentBill
    await queryInterface.createTable('AppointmentBill', {
      AppointmentBillID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      AppointmentID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Appointment', key: 'AppointmentID' },
        onDelete: 'CASCADE',
      },
      ServicePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      MedicalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      TotalPayment: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      MedicalImage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      MedicalNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      CreatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
      {
        indexes: [
          { fields: ['AppointmentID'], name: 'index_appointment_id' },
        ],
      });

    // Tạo bảng Schedule
    await queryInterface.createTable('Schedule', {
      ScheduleID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VeterinarianID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Account', key: 'AccountID' },
        onDelete: 'CASCADE',
      },
      AppointmentID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Appointment', key: 'AppointmentID' },
        onDelete: 'CASCADE',
      },
      Date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      StartTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      EndTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      ScheduleStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
    },
      {
        indexes: [
          { fields: ['VeterinarianID'], name: 'index_veterinarian_id' },
          { fields: ['Date'], name: 'index_date' },
        ],
      });

    // Tạo bảng VeterinarianInfo
    await queryInterface.createTable('VeterinarianInfo', {
      AccountID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        references: { model: 'Account', key: 'AccountID' },
        onDelete: 'CASCADE',
      },
      Bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      Specialization: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      WorkingStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
    });

    // Tạo bảng Product
    await queryInterface.createTable('Product', {
      ProductID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      ProductType: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ProductName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      ProductPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      ProductImage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ProductDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
      {
        indexes: [
          { fields: ['ProductName'], name: 'index_product_name' },
          { fields: ['ProductType'], name: 'index_product_type' },
        ],
      });

    // Tạo bảng ProductDetail
    await queryInterface.createTable('ProductDetail', {
      ProductDetailID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      DetailName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      Stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SoldCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ExtraPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      Promotion: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      CreatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      DetailStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ProductID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Product', key: 'ProductID' },
        onDelete: 'CASCADE',
      },
    },
      {
        indexes: [
          { fields: ['ProductID'], name: 'index_product_id' },
        ],
      });

    // Tạo bảng ProductPetType
    await queryInterface.createTable('ProductPetType', {
      ProductPetTypeID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProductID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Product', key: 'ProductID' },
        onDelete: 'CASCADE',
      },
      PetType: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
    },
      {
        indexes: [
          { fields: ['ProductID'], name: 'index_product_id' },
        ],
      });

    // Tạo bảng Image
    await queryInterface.createTable('Image', {
      ImageID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Image: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      ReferenceType: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ReferenceID: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
    },
      {
        indexes: [
          { fields: ['ReferenceType', 'ReferenceID'], name: 'index_reference' },
        ],
      });

    // Tạo bảng Banner
    await queryInterface.createTable('Banner', {
      BannerID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      BannerImage: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      CreatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      HiddenAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      BannerStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ProductID: {
        type: Sequelize.STRING(10),
        allowNull: true,
        references: { model: 'Product', key: 'ProductID' },
        onDelete: 'SET NULL',
      },
    },
      {
        indexes: [
          { fields: ['ProductID'], name: 'index_product_id' },
        ],
      });

    // Tạo bảng Coupon
    await queryInterface.createTable(
      'Coupon',
      {
        CouponID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        CouponCode: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        CouponDescription: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        MinOrderValue: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        DiscountValue: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        MaxDiscount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        StartDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        EndDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        CreatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        DiscountType: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        CouponStatus: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
      },
      {
        indexes: [
          { unique: true, fields: ['CouponCode'], name: 'unique_coupon_code' },
          { fields: ['StartDate', 'EndDate'], name: 'index_date_range' },
        ],
      }
    );

    // Tạo bảng Invoice
    await queryInterface.createTable('Invoice', {
      InvoiceID: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      ReceiverName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      ReceiverPhone: {
        type: Sequelize.STRING(11),
        allowNull: false,
      },
      ReceiverAddress: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      TotalQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      TotalPrice: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      DiscountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      TotalPayment: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      CreatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      CanceledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      CancelReason: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      PaymentStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ShippingStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      PaymentType: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ShippingMethod: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      CouponID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Coupon', key: 'CouponID' },
        onDelete: 'SET NULL',
      },
      AccountID: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
    },
      {
        indexes: [
          { fields: ['CouponID'], name: 'index_coupon_id' },
          { fields: ['AccountID'], name: 'index_account_id' },
        ],
      });

    // Tạo bảng InvoiceDetail
    await queryInterface.createTable('InvoiceDetail', {
      InvoiceDetailID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ItemQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ItemPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      InvoiceID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Invoice', key: 'InvoiceID' },
        onDelete: 'CASCADE',
      },
      ProductID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Product', key: 'ProductID' },
        onDelete: 'CASCADE',
      },
      ProductDetailID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ProductDetail', key: 'ProductDetailID' },
        onDelete: 'CASCADE',
      },
    },
      {
        indexes: [
          { fields: ['InvoiceID'], name: 'index_invoice_id' },
          { fields: ['ProductID'], name: 'index_product_id' },
          { fields: ['ProductDetailID'], name: 'index_product_detail_id' },
        ],
      });

    // Tạo bảng CartItem
    await queryInterface.createTable('CartItem', {
      CartItemID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ItemQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ItemPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      AccountID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Account', key: 'AccountID' },
        onDelete: 'CASCADE',
      },
      ProductID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Product', key: 'ProductID' },
        onDelete: 'CASCADE',
      },
      ProductDetailID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ProductDetail', key: 'ProductDetailID' },
        onDelete: 'CASCADE',
      },
    },
      {
        indexes: [
          { fields: ['AccountID'], name: 'index_account_id' },
          { fields: ['ProductID'], name: 'index_product_id' },
          { fields: ['ProductDetailID'], name: 'index_product_detail_id' },
        ],
      });

    // Tạo bảng VeterinarianService
    await queryInterface.createTable('VeterinarianService', {
      VeterinarianServiceID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VeterinarianID: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'Account', key: 'AccountID' },
        onDelete: 'CASCADE',
      },
      ServiceID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Service', key: 'ServiceID' },
        onDelete: 'CASCADE',
      },
    },
      {
        indexes: [
          { fields: ['VeterinarianID'], name: 'index_veterinarian_id' },
          { fields: ['ServiceID'], name: 'index_service_id' },
        ],
      });

    // Tạo bảng BlacklistToken
    await queryInterface.createTable('BlacklistToken', {
      TokenID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      ExtraValue: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      CreatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ExpiredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
      {
        indexes: [{ fields: ['Token'], name: 'index_token' }],
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BlacklistToken');
    await queryInterface.dropTable('CartItem');
    await queryInterface.dropTable('InvoiceDetail');
    await queryInterface.dropTable('Invoice');
    await queryInterface.dropTable('Coupon');
    await queryInterface.dropTable('Banner');
    await queryInterface.dropTable('Image');
    await queryInterface.dropTable('ProductPetType');
    await queryInterface.dropTable('ProductDetail');
    await queryInterface.dropTable('Product');
    await queryInterface.dropTable('VeterinarianService');
    await queryInterface.dropTable('VeterinarianInfo');
    await queryInterface.dropTable('Schedule');
    await queryInterface.dropTable('AppointmentBill');
    await queryInterface.dropTable('Appointment');
    await queryInterface.dropTable('Service');
    await queryInterface.dropTable('Pet');
    await queryInterface.dropTable('Account');
    await queryInterface.dropTable('AllCodes');
  },
};