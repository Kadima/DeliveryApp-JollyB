var checkDatetime = function (datetime) {
    if (is.equal(moment(datetime).format('DD-MMM-YYYY'), '01-Jan-0001')) {
        datetime = '';
    }
    if (is.not.empty(datetime)) {
        datetime = moment(datetime).format('DD-MMM-YYYY');
    }
    return datetime;
};


var objClone = function (obj) {
    var newObj = {};
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if(is.object(obj[prop])){
                newObj[prop] = objClone(obj[prop]);
            } else {
                if ( is.null( obj[ prop ] ) || is.undefined( obj[ prop ] ) || is.equal( obj[ prop ], 'undefined' ) ) {
                    newObj[ prop ] = '';
                } else{
                    newObj[prop] = obj[prop];
                }
            }
        }
    }
    return newObj;
};

// var objClone = function (oldObj, newObj) {
//     for (var key in newObj) {
//         if (newObj.hasOwnProperty(key)) {
//             if (is.null(oldObj[key]) || is.undefined(oldObj[key]) || is.equal(oldObj[key], 'undefined')) {
//                 oldObj[key] = '';
//             }
//             if (is.equal(newObj[key], 'INT')) {
//                 newObj[key] = oldObj[key];
//             } else {
//                 newObj[key] = oldObj[key];
//             }
//         }
//     }
// }
    /*
    var db_websql = window.openDatabase( db_websql_info.Name, db_websql_info.Version, db_websql_info.DisplayName, db_websql_info.EstimatedSize );

    if ( db_websql ) {
        db_websql.transaction( function ( tx ) {
            db_strSql = 'DROP TABLE if exists Csbk2';
            tx.executeSql( db_strSql, [], null, dbError );
            db_strSql = 'CREATE TABLE Csbk2 (TrxNo INT,LineItemNo INT, BoxCode TEXT,Pcs INT,UnitRate TEXT,CollectedPcs INT,AddQty INT)';
            tx.executeSql( db_strSql, [], null, dbError );
        } );

        db_websql.transaction( function ( tx ) {
            db_strSql = 'DROP TABLE if exists CsbkDetail';
            tx.executeSql( db_strSql, [], null, dbError );
            db_strSql = 'CREATE TABLE CsbkDetail (BookingNo TEXT, JobNo TEXT,TrxNo INT,StatusCode TEXT,ItemNo INT,DepositAmt INT,DiscountAmt  INT,CollectedAmt  INT,CompletedFlag TEXT,PaidAmt INT)';
            tx.executeSql( db_strSql, [], null, dbError );
        } );
    }
    var db_add_Csbk2_Accept = function ( Csbk2 ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk2 = repalceObj( Csbk2 );
                db_strSql = 'INSERT INTO Csbk2_Accept(TrxNo,LineItemNo, BoxCode,Pcs,UnitRate,CollectedPcs,AddQty) values(?,?,?,?,?,?,?)';
                tx.executeSql( db_strSql, [ Csbk2.TrxNo, Csbk2.LineItemNo, Csbk2.BoxCode, Csbk2.Pcs, Csbk2.UnitRate, Csbk2.CollectedPcs, Csbk2.AddQty ], null, dbError );
            } );
        }
    }

    var db_add_Csbk1Detail_Accept = function ( Csbk1Detail ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk1Detail = repalceObj( Csbk1Detail );
                db_strSql = 'INSERT INTO Csbk1Detail_Accept(BookingNo,JobNo,TrxNo,StatusCode,ItemNo,DepositAmt,DiscountAmt,CollectedAmt,CompletedFlag,PaidAmt) values(?,?,?,?,?,?,?,?,?,?)';
                tx.executeSql( db_strSql, [ Csbk1Detail.BookingNo, Csbk1Detail.JobNo, Csbk1Detail.TrxNo, Csbk1Detail.StatusCode, Csbk1Detail.ItemNo, Csbk1Detail.DepositAmt, Csbk1Detail.DiscountAmt, Csbk1Detail.CollectedAmt, Csbk1Detail.CompletedFlag, Csbk1Detail.PaidAmt ], null, dbError );
            } );
        }
    }

    var db_update_Csbk1_Accept = function ( Csbk1 ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk1 = repalceObj( Csbk1 );
                db_strSql = 'Update Csbk1_Accept set CompletedFlag=? where BookingNo=?';
                tx.executeSql( db_strSql, [ Csbk1.CompletedFlag, Csbk1.BookingNo ], null, dbError );
            } );
        }
    }

    var db_update_Csbk1_Accept_DriverCode = function ( Csbk1 ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk1 = repalceObj( Csbk1 );
                db_strSql = 'Update Csbk1 set DriverCode=? where BookingNo=?';
                tx.executeSql( db_strSql, [ Csbk1.DriverCode, Csbk1.BookingNo ], null, dbError );
            } );
        }
    }


    var db_update_Csbk1Detail_Accept = function ( Csbk1 ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk1 = repalceObj( Csbk1 );
                db_strSql = 'Update Csbk1Detail_Accept set CompletedFlag=?,CollectedAmt=? where BookingNo=?';
                tx.executeSql( db_strSql, [ Csbk1.CompletedFlag, Csbk1.CollectedAmt, Csbk1.BookingNo ], null, dbError );
            } );
        }
    }

    var db_update_Csbk1DetailAmount_Accept = function ( Csbk1 ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk1 = repalceObj( Csbk1 );
                db_strSql = 'Update Csbk1Detail_Accept set CollectedAmt=? where BookingNo=?';
                tx.executeSql( db_strSql, [ Csbk1.CollectedAmt, Csbk1.BookingNo ], null, dbError );
            } );
        }
    }

    var db_update_Csbk2_Amount = function ( Csbk2 ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk2 = repalceObj( Csbk2 );
                db_strSql = 'Update Csbk2_Accept set CollectedAmt=? where  BookingNo=?';
                tx.executeSql( db_strSql, [ Csbk2.CollectedAmt, Csbk2.BookingNo ], null, dbError );
            } );
        }
    }

    var db_update_Csbk2_Accept = function ( Csbk2 ) {
        if ( db_websql ) {
            db_websql.transaction( function ( tx ) {
                Csbk2 = repalceObj( Csbk2 );
                db_strSql = 'Update Csbk2_Accept set CollectedPcs=?,AddQty=? where TrxNo=? and LineItemNo=?';
                tx.executeSql( db_strSql, [ Csbk2.CollectedPcs, Csbk2.AddQty, Csbk2.TrxNo, Csbk2.LineItemNo ], null, dbError );
            } );
        }
    }
    */
