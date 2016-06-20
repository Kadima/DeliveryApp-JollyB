// Database instance.
var db;

var appendProtocol = function(url, blnSSL, portNo) {
  if (url.length > 0 && url.toUpperCase().indexOf('HTTPS://') < 0 && url.toUpperCase().indexOf('HTTP://') < 0) {
    if (blnSSL) {
      url = 'https://' + url;
    } else {
      var aURL = url.split('/');
      if (aURL[0].indexOf(':') < 0) {
        url = 'http://' + aURL[0] + ':' + portNo;
      } else {
        url = 'http://' + aURL[0];
      }
      for (var i = 1; i < aURL.length; i++) {
        url = url + '/' + aURL[i];
      }
    }
  }
  return url;
};
var rmProtocol = function(url, portNo) {
    if (is.not.empty(url)) {
        var regex = /(https?:\/\/)?/gi;
        url = url.replace(regex, '');
        regex = /(http?:\/\/)?/gi;
        url = url.replace(regex, '');
    }
    if (is.not.empty(portNo)) {
        var regex = /\:(\d)+/;
        url = url.replace(regex, '');
    }
    return url;
};

var checkDatetime = function(datetime) {
  if (is.equal(moment(datetime).format('DD-MMM-YYYY'), '01-Jan-0001')) {
    datetime = '';
  }
  if (is.not.empty(datetime)) {
    datetime = moment(datetime).format('DD-MMM-YYYY');
  }
  return datetime;
};
var repalceObj = function(obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (is.null(obj[i])) {
        obj[i] = '';
      }
      if (is.undefined(obj[i])) {
        obj[i] = '';
      }
      if (is.equal(obj[i], 'undefined')) {
        obj[i] = '';
      }
    }
  }
  return obj;
};

var dbInfo = {
  dbName: 'TmsDB',
  dbVersion: '1.0',
  dbDisplayName: 'TMS Database',
  dbEstimatedSize: 10 * 11024 * 1024
};
var dbSql = '';

function dbError(tx, error) {
  console.log(error.message);
}
var dbTms = window.openDatabase(dbInfo.dbName, dbInfo.dbVersion, dbInfo.dbDisplayName, dbInfo.dbEstimatedSize);
if (dbTms) {
  dbTms.transaction(function(tx) {
    dbSql = 'DROP TABLE if exists Csbk1_Accept';
    tx.executeSql(dbSql, [], null, dbError);
    dbSql = "CREATE TABLE Csbk1_Accept (TrxNo INT,BookingNo TEXT, JobNo TEXT, StatusCode TEXT,BookingCustomerCode TEXT,Pcs INT,CollectionTimeStart TEXT,CollectionTimeEnd TEXT,PostalCode TEXT,BusinessPartyCode TEXT,BusinessPartyName TEXT,Address1 TEXT,Address2 TEXT,Address3 TEXT,Address4 TEXT,CompletedFlag TEXT,TimeFrom TEXT,TimeTo TEXT,ColTimeFrom TEXT,ColTimeTo TEXT,ScanDate TEXT)";
    tx.executeSql(dbSql, [], null, dbError);
  });
  dbTms.transaction(function(tx) {
    dbSql = 'DROP TABLE if exists Csbk2_Accept';
    tx.executeSql(dbSql, [], null, dbError);
    dbSql = "CREATE TABLE Csbk2_Accept (TrxNo INT,LineItemNo INT, BoxCode TEXT,Pcs INT,UnitRate TEXT,CollectedPcs INT)";
    tx.executeSql(dbSql, [], null, dbError);
  });

  dbTms.transaction(function(tx) {
    dbSql = 'DROP TABLE if exists Csbk1Detail_Accept';
    tx.executeSql(dbSql, [], null, dbError);
    dbSql = "CREATE TABLE Csbk1Detail_Accept (BookingNo TEXT, JobNo TEXT,TrxNo INT,StatusCode TEXT,ItemNo INT,DepositAmt INT,DiscountAmt  INT,CollectedAmt  INT,CompletedFlag TEXT)";
    tx.executeSql(dbSql, [], null, dbError);
  });
}
var db_del_Csbk1_Accept = function() {
  if (dbTms) {
    dbTms.transaction(function(tx) {
      dbSql = 'Delete from Csbk1_Accept';
      tx.executeSql(dbSql, [], null, dbError)
    });
  }
}
var db_del_Csbk1_Accept_detail = function(bookingNo) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
      dbSql = "Delete from Csbk1_Accept where BookingNo='"+bookingNo+"'";
      tx.executeSql(dbSql, [], null, dbError)
    });
  }
}
var db_add_Csbk1_Accept = function(Csbk1) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
      Csbk1 = repalceObj(Csbk1);
      dbSql = 'INSERT INTO Csbk1_Accept(TrxNo,BookingNo,JobNo,StatusCode,BookingCustomerCode,Pcs,CollectionTimeStart,CollectionTimeEnd,PostalCode,BusinessPartyCode,BusinessPartyName,Address1,Address2,Address3,Address4,CompletedFlag,TimeFrom,TimeTo,ColTimeFrom,ColTimeTo,ScanDate) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      tx.executeSql(dbSql, [Csbk1.TrxNo,Csbk1.BookingNo, Csbk1.JobNo, Csbk1.StatusCode, Csbk1.BookingCustomerCode, Csbk1.Pcs, Csbk1.CollectionTimeStart, Csbk1.CollectionTimeEnd, Csbk1.PostalCode, Csbk1.BusinessPartyCode,Csbk1.BusinessPartyName, Csbk1.Address1, Csbk1.Address2, Csbk1.Address3, Csbk1.Address4,Csbk1.CompletedFlag,Csbk1.TimeFrom,Csbk1.TimeTo,Csbk1.ColTimeFrom,Csbk1.ColTimeTo,Csbk1.ScanDate], null, dbError);
  });
  }
}
var db_add_Csbk2_Accept = function(Csbk2) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
      Csbk2 = repalceObj(Csbk2);
      dbSql = 'INSERT INTO Csbk2_Accept(TrxNo,LineItemNo, BoxCode,Pcs,UnitRate,CollectedPcs) values(?,?,?,?,?,?)';
      tx.executeSql(dbSql, [Csbk2.TrxNo,Csbk2.LineItemNo, Csbk2.BoxCode,Csbk2.Pcs,Csbk2.UnitRate,Csbk2.CollectedPcs], null, dbError);
  });
  }
}

var db_add_Csbk1Detail_Accept = function(Csbk1Detail) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
      Csbk1Detail = repalceObj(Csbk1Detail);
      dbSql = 'INSERT INTO Csbk1Detail_Accept(BookingNo,JobNo,TrxNo,StatusCode,ItemNo,DepositAmt,DiscountAmt,CollectedAmt,CompletedFlag) values(?,?,?,?,?,?,?,?,?)';
      tx.executeSql(dbSql, [Csbk1Detail.BookingNo,Csbk1Detail.JobNo,Csbk1Detail.TrxNo,Csbk1Detail.StatusCode,Csbk1Detail.ItemNo,Csbk1Detail.DepositAmt,Csbk1Detail.DiscountAmt,Csbk1Detail.CollectedAmt,Csbk1Detail.CompletedFlag], null, dbError);
  });
  }
}

var onStrToURL = function(strURL) {
    if (strURL.length > 0 && strURL.indexOf('http://') < 0 && strURL.indexOf('HTTP://') < 0) {
        strURL = "http://" + strURL;
    }
    return strURL;
};

var db_update_Csbk1_Accept = function(Csbk1) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
        Csbk1 = repalceObj(Csbk1);
      dbSql = 'Update Csbk1_Accept set CompletedFlag=? where BookingNo=?';
      tx.executeSql(dbSql, [Csbk1.CompletedFlag, Csbk1.BookingNo], null, dbError);
    });
  }
}

var db_update_Csbk1Detail_Accept = function(Csbk1) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
        Csbk1 = repalceObj(Csbk1);
      dbSql = 'Update Csbk1Detail_Accept set CompletedFlag=?,CollectedAmt=? where BookingNo=?';
      tx.executeSql(dbSql, [Csbk1.CompletedFlag,Csbk1.CollectedAmt, Csbk1.BookingNo], null, dbError);
    });
  }
}

var db_update_Csbk1DetailAmount_Accept = function(Csbk1) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
        Csbk1 = repalceObj(Csbk1);
      dbSql = 'Update Csbk1Detail_Accept set CollectedAmt=? where BookingNo=?';
      tx.executeSql(dbSql, [Csbk1.CollectedAmt, Csbk1.BookingNo], null, dbError);
    });
  }
}

var db_update_Csbk2_Amount=function(Csbk2){
  if (dbTms) {
    dbTms.transaction(function(tx) {
        Csbk2 = repalceObj(Csbk2);
      dbSql = 'Update Csbk2_Accept set CollectedAmt=? where  BookingNo=?';
      tx.executeSql(dbSql, [Csbk2.CollectedAmt,Csbk2.BookingNo], null, dbError);
    });
  }
}

var db_update_Csbk2_Accept = function(Csbk2) {
  if (dbTms) {
    dbTms.transaction(function(tx) {
        Csbk2 = repalceObj(Csbk2);
      dbSql = 'Update Csbk2_Accept set CollectedPcs=? where TrxNo=? and LineItemNo=?';
      tx.executeSql(dbSql, [Csbk2.CollectedPcs,Csbk2.TrxNo,Csbk2.LineItemNo], null, dbError);
    });
  }
}
