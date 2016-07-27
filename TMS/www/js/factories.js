var appFactory = angular.module( 'TMS.factories', [
    'TMS.services'
] );

appFactory.factory( 'ACCEPTJOB_ORM', function () {
    var ACCEPTJOB_ORM = {
        LIST: {
            Csbk1s: {},
            _setCsbk: function ( value ) {
                this.Csbk1s = value;
            }
        }
    };
    ACCEPTJOB_ORM.init = function () {
        this.LIST.Csbk1s = {};
    };
    return ACCEPTJOB_ORM;
} );

appFactory.factory( 'TABLE_DB', function () {
    var TABLE_DB = {
        Csbk1: {
            TrxNo: 'INT',
            BookingNo: 'TEXT',
            JobNo: 'TEXT',
            StatusCode: 'TEXT',
            BookingCustomerCode: 'TEXT',
            Pcs: 'INT',
            CollectionTimeStart: 'TEXT',
            CollectionTimeEnd: 'TEXT',
            PostalCode: 'TEXT',
            BusinessPartyCode: 'TEXT',
            BusinessPartyName: 'TEXT',
            Address1: 'TEXT',
            Address2: 'TEXT',
            Address3: 'TEXT',
            Address4: 'TEXT',
            CompletedFlag: 'TEXT',
            TimeFrom: 'TEXT',
            TimeTo: 'TEXT',
            ColTimeFrom: 'TEXT',
            ColTimeTo: 'TEXT',
            CompletedDate: 'TEXT',
            DriverId: 'TEXT',
            CollectedAmt: 'INT',
            DepositAmt: 'INT',
            DiscountAmt: 'INT',
            PaidAmt : 'INT',
            ItemNo: 'INT',
            ScanDate: 'TEXT',
            TempBookingNo:'TEXT',
            DriverCode: 'TEXT',
            Base64:'TEXT',
            CashAmt:'INT',
            Csbk2CollectedPcs:'TEXT'

        },
          Csbk2:{
            TrxNo: 'INT',
            LineItemNo: 'INT',
            BoxCode: 'TEXT',
            Pcs: 'INT',
            UnitRate: 'TEXT',
            CollectedPcs: 'INT',
            AddQty: 'INT'
          },
          Users:{
            DriverId:'TEXT',
            DriverCode: 'TEXT',
            DriverName:'TEXT',
            VehicleNo:'TEXT'
          },
        CsbkDetail: {
          BookingNo: 'TEXT',
          JobNo: 'TEXT',
          TrxNo: 'INT',
          StatusCode: 'TEXT',
          ItemNo: 'INT',
          DepositAmt: 'INT',
          DiscountAmt:  'INT',
          CollectedAmt:  'INT',
          CompletedFlag: 'TEXT',
          PaidAmt: 'INT',
          Rcbp1PhoneNumber:'TEXT'
        },
        Slcr1:{
          BookingNo:'TEXT',
          ReceiptAmt:'INT'
        },
        TemCsbk1:{
          TrxNo: 'INT',
          BookingNo: 'TEXT',
          JobNo: 'TEXT',
          StatusCode: 'TEXT',
          BookingCustomerCode: 'TEXT',
          Pcs: 'INT',
          CollectionTimeStart: 'TEXT',
          CollectionTimeEnd: 'TEXT',
          PostalCode: 'TEXT',
          BusinessPartyCode: 'TEXT',
          BusinessPartyName: 'TEXT',
          Address1: 'TEXT',
          Address2: 'TEXT',
          Address3: 'TEXT',
          Address4: 'TEXT',
          CompletedFlag: 'TEXT',
          TimeFrom: 'TEXT',
          TimeTo: 'TEXT',
          ColTimeFrom: 'TEXT',
          ColTimeTo: 'TEXT',
          CompletedDate: 'TEXT',
          DriverId: 'TEXT',
          CollectedAmt: 'INT',
          DepositAmt: 'INT',
          DiscountAmt: 'INT',
          PaidAmt : 'INT',
          ItemNo: 'INT',
          ScanDate: 'TEXT',
          TempBookingNo:'TEXT',
          DriverCode: 'TEXT',
          Base64:'TEXT',
          CashAmt:'INT',
          Csbk2CollectedPcs:'TEXT'

  },

    };
    return TABLE_DB;
} );
