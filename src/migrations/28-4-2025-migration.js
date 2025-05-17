'use strict';

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
          type: Sequelize.CHAR(30),
          allowNull: false,
        },
        Code: {
          type: Sequelize.CHAR(20),
          allowNull: false,
        },
        CodeValueVI: {
          type: Sequelize.CHAR(50),
          allowNull: false,
        },
        ExtraValue: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
      },
      {
        indexes: [{ unique: true, fields: ['Type', 'Code'], name: 'unique_type_code' }],
      }
    );

    // Tạo bảng Account
    await queryInterface.createTable(
      'Account',
      {
        AccountID: {
          type: Sequelize.CHAR(10),
          primaryKey: true,
          allowNull: false,
        },
        AccountName: {
          type: Sequelize.CHAR(50),
          allowNull: false,
          collate: 'utf8mb4_bin',
        },
        Email: {
          type: Sequelize.CHAR(100),
          allowNull: false,
        },
        Password: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        UserName: {
          type: Sequelize.CHAR(50),
          allowNull: false,
        },
        UserImage: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        Phone: {
          type: Sequelize.CHAR(11),
          allowNull: true,
        },
        Address: {
          type: Sequelize.CHAR(100),
          allowNull: true,
        },
        Gender: {
          type: Sequelize.CHAR(20),
          allowNull: true,
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
          allowNull: true,
        },
        AccountStatus: {
          type: Sequelize.CHAR(20),
          allowNull: true,
        },
        AccountType: {
          type: Sequelize.CHAR(20),
          allowNull: false,
        },
      },
      {
        indexes: [
          { unique: true, fields: ['Email'], name: 'unique_email' },
          { fields: ['Phone'], name: 'index_phone' },
        ],
      }
    );

    // Tạo bảng Pet
    await queryInterface.createTable('Pet', {
      PetID: {
        type: Sequelize.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      PetName: {
        type: Sequelize.CHAR(50),
        allowNull: false,
      },
      AccountID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Account',
          key: 'AccountID',
        },
        onDelete: 'CASCADE',
      },
      PetType: {
        type: Sequelize.CHAR(20),
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
        type: Sequelize.CHAR(20),
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
        type: Sequelize.CHAR(50),
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
    });

    // Tạo bảng Appointment
    await queryInterface.createTable('Appointment', {
      AppointmentID: {
        type: Sequelize.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      CustomerName: {
        type: Sequelize.CHAR(50),
        allowNull: false,
      },
      CustomerEmail: {
        type: Sequelize.CHAR(100),
        allowNull: false,
      },
      CustomerPhone: {
        type: Sequelize.CHAR(11),
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
        allowNull: true,
      },
      AppointmentStatus: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
      AccountID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Account',
          key: 'AccountID',
        },
        onDelete: 'CASCADE',
      },
      VeterinarianID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Account',
          key: 'AccountID',
        },
        onDelete: 'CASCADE',
      },
      ServiceID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Service',
          key: 'ServiceID',
        },
        onDelete: 'CASCADE',
      },
      PetID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Pet',
          key: 'PetID',
        },
        onDelete: 'CASCADE',
      },
    });

    // Tạo bảng AppointmentBill
    await queryInterface.createTable('AppointmentBill', {
      AppointmentBillID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      AppointmentID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Appointment',
          key: 'AppointmentID',
        },
        onDelete: 'CASCADE',
      },
      PaymentType: {
        type: Sequelize.CHAR(20),
        allowNull: false,
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
    });

    // Tạo bảng FuAppointment
    await queryInterface.createTable('FuAppointment', {
      FuAppointmentID: {
        type: Sequelize.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      AppointmentID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Appointment',
          key: 'AppointmentID',
        },
        onDelete: 'CASCADE',
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
        allowNull: true,
      },
      FuAppointmentStatus: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
      ServiceID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Service',
          key: 'ServiceID',
        },
        onDelete: 'CASCADE',
      },
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
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Account',
          key: 'AccountID',
        },
        onDelete: 'CASCADE',
      },
      AppointmentID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Appointment',
          key: 'AppointmentID',
        },
        onDelete: 'CASCADE',
      },
    });

    // Tạo bảng VeterinarianInfo
    await queryInterface.createTable('VeterinarianInfo', {
      AccountID: {
        type: Sequelize.CHAR(10),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Account',
          key: 'AccountID',
        },
        onDelete: 'CASCADE',
      },
      Bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      Specialization: {
        type: Sequelize.CHAR(50),
        allowNull: true,
      },
      WorkingStatus: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
    });

    // Tạo bảng Product
    await queryInterface.createTable('Product', {
      ProductID: {
        type: Sequelize.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      ProductType: {
        type: Sequelize.CHAR(20),
        allowNull: false,
      },
      ProductName: {
        type: Sequelize.CHAR(100),
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
        type: Sequelize.CHAR(50),
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
        allowNull: true,
      },
      DetailStatus: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
      ProductID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Product',
          key: 'ProductID',
        },
        onDelete: 'CASCADE',
      },
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
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Product',
          key: 'ProductID',
        },
        onDelete: 'CASCADE',
      },
      PetType: {
        type: Sequelize.CHAR(20),
        allowNull: false,
      },
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
      ProductID: {
        type: Sequelize.CHAR(10),
        allowNull: true,
        references: {
          model: 'Product',
          key: 'ProductID',
        },
        onDelete: 'SET NULL',
      },
      AppointmentID: {
        type: Sequelize.CHAR(10),
        allowNull: true,
        references: {
          model: 'Appointment',
          key: 'AppointmentID',
        },
        onDelete: 'SET NULL',
      },
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
        type: Sequelize.CHAR(20),
        allowNull: false,
      },
      ProductID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Product',
          key: 'ProductID',
        },
        onDelete: 'CASCADE',
      },
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
          type: Sequelize.CHAR(100),
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
          allowNull: false,
        },
        DiscountType: {
          type: Sequelize.CHAR(20),
          allowNull: false,
        },
        CouponStatus: {
          type: Sequelize.CHAR(20),
          allowNull: false,
        },
      },
      {
        indexes: [{ unique: true, fields: ['CouponCode'], name: 'unique_coupon_code' }],
      }
    );

    // Tạo bảng Invoice
    await queryInterface.createTable('Invoice', {
      InvoiceID: {
        type: Sequelize.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      ReceiverName: {
        type: Sequelize.CHAR(50),
        allowNull: false,
      },
      ReceiverPhone: {
        type: Sequelize.CHAR(11),
        allowNull: false,
      },
      ReceiverAddress: {
        type: Sequelize.CHAR(100),
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
        allowNull: true,
      },
      CanceledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      CancelReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      PaymentStatus: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
      ShippingStatus: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
      PaymentType: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
      ShippingMethod: {
        type: Sequelize.CHAR(20),
        allowNull: true,
      },
      CouponID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Coupon',
          key: 'CouponID',
        },
        onDelete: 'SET NULL',
      },
      AccountID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
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
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Invoice',
          key: 'InvoiceID',
        },
        onDelete: 'CASCADE',
      },
      ProductID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Product',
          key: 'ProductID',
        },
        onDelete: 'CASCADE',
      },
      ProductDetailID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductDetail',
          key: 'ProductDetailID',
        },
        onDelete: 'CASCADE',
      },
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
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Account',
          key: 'AccountID',
        },
        onDelete: 'CASCADE',
      },
      ProductID: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        references: {
          model: 'Product',
          key: 'ProductID',
        },
        onDelete: 'CASCADE',
      },
      ProductDetailID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductDetail',
          key: 'ProductDetailID',
        },
        onDelete: 'CASCADE',
      },
    });

    // Tạo bảng BlacklistToken
    await queryInterface.createTable(
      'BlacklistToken',
      {
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
          type: Sequelize.CHAR(10),
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
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa các bảng theo thứ tự ngược lại để tránh lỗi khóa ngoại
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
    await queryInterface.dropTable('VeterinarianInfo');
    await queryInterface.dropTable('Schedule');
    await queryInterface.dropTable('FuAppointment');
    await queryInterface.dropTable('AppointmentBill');
    await queryInterface.dropTable('Appointment');
    await queryInterface.dropTable('Service');
    await queryInterface.dropTable('Pet');
    await queryInterface.dropTable('Account');
    await queryInterface.dropTable('AllCodes');
  },
};
