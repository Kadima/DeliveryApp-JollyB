using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;

namespace WebApi.ServiceModel.TMS
{
    [Route("/tms/csbk1/sps", "Get")]  // sps?RecordCount=
    [Route("/tms/csbk1/update", "Get")] //update?CompletedFlag=,Amount=,Package=
    [Route("/tms/csbk1/confirm", "Get")] //update?BookingNo=
    [Route("/tms/csbk1", "Get")]      //csbk1?BookingNo=
    [Route("/tms/csbk2", "Get")]      //Csbk2?BookingNo=
    [Route("/tms/csbk1/UpdateCollected", "Post")]  //UpdateCollected?BookinNo=
    [Route("/tms/csbk2/update", "Get")]      //Csbk2?TrxNo=,LineItemNo=,CollectedPcs=
    public class Csbk : IReturn<CommonResponse>
    {
        public string RecordCount { get; set; }
        public string BookingNo { get; set; }
        public string CompletedFlag { get; set; }
        public string DriverCode { get; set; }
        public string Amount { get; set; }
        public string Package { get; set; }
        public int TrxNo { get; set; }
        public int LineItemNo { get; set; }
        public string CollectedPcs { get; set; }
        public List<Csbk1> csbk1s { get; set; }
        public string   ActualDeliveryDate { get; set; }
        public string ActualCollectionDate { get; set; }
        public string AddQty { get; set; }

    }
    public class Csbk_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }

        public List<Csbk1> Get_csbk1_List(Csbk request)
        {
            List<Csbk1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                    int count = 5;
                    if (!string.IsNullOrEmpty(request.RecordCount))
                    {
                        count = int.Parse(request.RecordCount);
                     
                    }
                    string strWhere = "";
                    if (!string.IsNullOrEmpty(request.BookingNo))
                    {



                        //var strSQL = "select Csbk1.TrxNo,Csbk1.BookingNo,Csbk1.StatusCode,isnull(Csbk1.JobNo, '') as JobNo,isnull(Csbk1.BookingCustomerCode, '') as BookingCustomerCode,isnull(Csbk1.CollectionTimeStart, '') as CollectionTimeStart,isnull(Csbk1.CollectionTimeEnd, '') as CollectionTimeEnd ,sum(Csbk2.Pcs) as Pcs,isnull(rcbp1.BusinessPartyCode, '') as BusinessPartyCode,isnull(Rcbp1.PostalCode, '') as PostalCode,isnull(Rcbp1.BusinessPartyName, '') as BusinessPartyName,isnull(Rcbp1.Address1, '') as Address1,isnull(Rcbp1.Address2, '') as Address2,isnull(Rcbp1.Address3, '') as Address3,isnull(Rcbp1.Address4, '') as Address4 ,isnull(Csbk1.CompletedFlag,'') AS CompletedFlag" +
                        //  " from Csbk1 left join Csbk2 on Csbk1.TrxNo = Csbk2.TrxNo  left" +
                        //  " join rcbp1 on Csbk1.BookingCustomerCode = rcbp1.BusinessPartyCode " + strWhere +
                        //  " group  by Csbk1.jobno,rcbp1.BusinessPartyCode,Csbk1.BookingNo,Csbk1.StatusCode,Rcbp1.PostalCode,Rcbp1.BusinessPartyName,Rcbp1.Address1,Rcbp1.Address2,Rcbp1.Address3,Rcbp1.Address4,Csbk1.BookingCustomerCode,Csbk1.CollectionTimeStart,Csbk1.CollectionTimeEnd,Csbk1.CompletedFlag,Csbk1.TrxNo";

                        strWhere = "Where BookingNo like'%" +request.BookingNo + "' and isnull(Csbk1.CompletedFlag,'')<>'Y'";
                        var strSQL = "select Csbk1.TrxNo," +
          "isnull((Select top 1 TimeFrom From Todr2 Where District like '%' + Rcbp1.DistrictCode + '%' and  day in ( case when DatePart(W, GETDATE()) = 1 then 'SUN'" +
           " when DatePart(W, GETDATE()) = 2 then 'MON'" +
          "  when DatePart(W, GETDATE()) = 3 then 'TUE'" +
           " when DatePart(W, GETDATE()) = 4 then 'WED'" +
          "  when DatePart(W, GETDATE()) = 5 then 'THU'" +
          "  when DatePart(W, GETDATE()) = 6 then 'FRI'" +
          "  when DatePart(W, GETDATE()) = 7 then 'SAT'" +
         " end)),'') AS TimeFrom," +
         "isnull((Select top 1 TimeTo From Todr2 Where District like '%' + Rcbp1.DistrictCode + '%' and  day in ( case when DatePart(W, GETDATE()) = 1 then 'SUN'" +
         "  when DatePart(W, GETDATE()) = 2 then 'MON'" +
         "  when DatePart(W, GETDATE()) = 3 then 'TUE'" +
         "  when DatePart(W, GETDATE()) = 4 then 'WED'" +
         "   when DatePart(W, GETDATE()) = 5 then 'THU'" +
         "  when DatePart(W, GETDATE()) = 6 then 'FRI'" +
         "  when DatePart(W, GETDATE()) = 7 then 'SAT'" +
         " end )),'') AS TimeTo," +
         "  isnull((Select top 1 TimeFrom From Todr2 Where District like '%' + Rcbp1.DistrictCode + '%' and  day in ( case when DatePart(W, GETDATE()) = 1 then 'SUN'" +
         " when DatePart(W, GETDATE()) = 2 then 'MON'" +
         " when DatePart(W, GETDATE()) = 3 then 'TUE'" +
         "  when DatePart(W, GETDATE()) = 4 then 'WED'" +
         "  when DatePart(W, GETDATE()) = 5 then 'THU'" +
         "  when DatePart(W, GETDATE()) = 6 then 'FRI'" +
         "  when DatePart(W, GETDATE()) = 7 then 'SAT'" +
         "  end)),'') AS ColTimeFrom," +
         " isnull((Select top 1 TimeTo From Todr2 Where District like '%' + Rcbp1.DistrictCode + '%' and  day in ( case when DatePart(W, GETDATE()) = 1 then 'SUN'" +
        "   when DatePart(W, GETDATE()) = 2 then 'MON'" +
        "  when DatePart(W, GETDATE()) = 3 then 'TUE'" +
        "  when DatePart(W, GETDATE()) = 4 then 'WED'" +
        " when DatePart(W, GETDATE()) = 5 then 'THU'" +
        "  when DatePart(W, GETDATE()) = 6 then 'FRI'" +
        " when DatePart(W, GETDATE()) = 7 then 'SAT'" +
        " end )),'') AS ColTimeTo," +
        " Csbk1.BookingNo,Csbk1.StatusCode,isnull(Csbk1.JobNo, '') as JobNo,isnull(Csbk1.BookingCustomerCode, '') as BookingCustomerCode,isnull(Csbk1.CollectionTimeStart, '') as CollectionTimeStart,isnull(Csbk1.CollectionTimeEnd, '') as CollectionTimeEnd ,sum(Csbk2.Pcs) as Pcs, isnull(rcbp1.BusinessPartyCode,'') as BusinessPartyCode,isnull(Rcbp1.PostalCode, '') as PostalCode,isnull(rcbp1.FirstName, '')+isnull(rcbp1.LastName, '') as BusinessPartyName,isnull(Rcbp1.Address1, '') as Address1,isnull(Rcbp1.Address2, '') as Address2,isnull(Rcbp1.Address3, '') as Address3,isnull(Rcbp1.Address4, '') as Address4 ,isnull(Csbk1.CompletedFlag, '') AS CompletedFlag, (Select CONVERT(varchar(100), GETDATE(), 121)) as ScanDate " +
                       "  from Csbk1 join (SELECT TOP  " + (count + 10) + " row_number() OVER (ORDER BY TrxNo ASC) n, TrxNo FROM Csbk1 " + strWhere + " ) C2 on Csbk1.TrxNo = c2.TrxNo " +
                       " left join Csbk2 on Csbk1.TrxNo = Csbk2.TrxNo  left" +
                       "  join rcbp1 on Csbk1.BookingCustomerCode = rcbp1.BusinessPartyCode    " + strWhere + "and Csbk1.TrxNo = C2.TrxNo AND C2.n >0 " +
                       "  group  by Csbk1.jobno,rcbp1.BusinessPartyCode,Csbk1.BookingNo,Csbk1.StatusCode,Rcbp1.PostalCode,Rcbp1.BusinessPartyName,Rcbp1.Address1,Rcbp1.Address2,Rcbp1.Address3,Rcbp1.Address4,Csbk1.BookingCustomerCode,Csbk1.CollectionTimeStart,Csbk1.CollectionTimeEnd,Csbk1.CompletedFlag,Csbk1.TrxNo ,Rcbp1.DistrictCode,rcbp1.FirstName,rcbp1.LastName";
                        Result = db.Select<Csbk1>(strSQL);
//                        //=======
//                        " FROM csbk1 t1," +
//                                        "(SELECT TOP " + (count + 20) + "row_number() OVER(ORDER BY bookingNo ASC) n, bookingNo FROM csbk1  " + strWhere + " ) t2 " +
//                                        "WHERE t1.bookingNo = t2.bookingNo AND StatusCode<> 'DEL' AND t2.n >" + count +
//                                        "ORDER BY t2.n ASC";
////===============


                    }

                }

            }
            catch { throw; }
            return Result;

        }

        public List<Csbk1> Get_csbk1_SpsList(Csbk request)
        {
            List<Csbk1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                    int count = 0;
                    if (!string.IsNullOrEmpty(request.RecordCount))
                    {
                        count = int.Parse(request.RecordCount);
                    }
                    string strWhere = "";
                    if (!string.IsNullOrEmpty(request.BookingNo))
                    {

                        strWhere = "Where BookingNo='" + request.BookingNo + "'";

                    }
                    var strSQL = "SELECT t1.BookingNo,JobNo,CustomerCode,CustomerName,CustomerRefNo,DeliveryEndDateTime,TotalPcs,Toaddress1,Toaddress2,Toaddress3,Toaddress4,UOMCode" +
                         " FROM csbk1 t1," +
                         "(SELECT TOP " + (count + 20) + "row_number() OVER(ORDER BY bookingNo ASC) n, bookingNo FROM csbk1  " + strWhere + " ) t2 " +
                         "WHERE t1.bookingNo = t2.bookingNo AND StatusCode<> 'DEL' AND t2.n >" + count +
                         "ORDER BY t2.n ASC";
                    Result = db.Select<Csbk1>(strSQL);

                }

            }
            catch { throw; }
            return Result;

        }

        public Csbk1_with_Csbk2 Get_Csbk2_List(Csbk request)
        {
            Csbk1_with_Csbk2 Result = new Csbk1_with_Csbk2();
            Result.csbk1 = new Csbk1();
            Result.csbk2s = new List<Csbk2>();
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                    if (!string.IsNullOrEmpty(request.BookingNo))
                    {
                        var strSQL = "select Csbk1.BookingNo, Csbk1.JobNo,Csbk1.TrxNo,Csbk1.StatusCode as StatusCode,Csbk1.ItemNo,Csbk1.DepositAmt,Csbk1.DiscountAmt ,Csbk1.CollectedAmt,csbk1.PaidAmt      from  Csbk1  where BookingNo ='" + request.BookingNo + "'";
                        Result.csbk1 = db.Select<Csbk1>(strSQL)[0];
                        strSQL = " select Csbk2.TrxNo,Csbk2.LineItemNo,Csbk2.Pcs,Csbk2.UnitRate,Csbk2.CollectedPcs ,isnull(rcbx1.Description,'') as BoxCode,Csbk2.AddQty   from Csbk2 left join Csbk1 on Csbk2.trxno = Csbk1.trxno left join rcbx1 on csbk2.BoxCode=rcbx1.BoxCode  where BookingNo='" + request.BookingNo + "'";
                        Result.csbk2s = db.Select<Csbk2>(strSQL);
                       
                    }
                }
            }
            catch { throw; }
            return Result;

        }

        public int Update_Csbk2(Csbk request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    Result = db.Update<Csbk2>(
                        new {
                            CollectedPcs = int.Parse(request.CollectedPcs),
                            AddQty= int.Parse(request.AddQty)

                        },
               	p => p.TrxNo == request.TrxNo && p.LineItemNo == request.LineItemNo


                        );


                }
            }
            catch { throw; }
            return Result;
        }

        public int Update_Csbk1Collected(Csbk request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    foreach (Csbk1 p1 in request.csbk1s)
                    {
                        db.Update<Csbk1>(
                                        new
                                        {
                                            CollectedAmt = p1.CollectedAmt
                                        },
                                        p => p.BookingNo == p1.BookingNo
                        );
                    }
                    Result = 1;
                }
            }
            catch { throw; }
            return Result;
        }

        public int update_csbk1(Csbk request)
        {
            int Result = -1;
            int TrxNo = 0;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {


                    var strSQL = "select TrxNo from csbk1 where bookingno ='" + request.BookingNo + "' ";
                    TrxNo = db.Scalar<int>(strSQL);
                    Result = db.Update<Csbk1>(
                                    new
                                    {
                                        // CompletedFlag = request.CompletedFlag,
                                        ActualDeliveryDate= request.ActualDeliveryDate,
                                        ActualCollectionDate=request.ActualCollectionDate,
                                        CollectedAmt =Convert.ToDecimal( request.Amount)

                                    },
                                    p => p.BookingNo == request.BookingNo
                    );
                    if (Result > 0)
                    {
                        Result = db.Update<Csbk2>(
                              new
                              {
                                  // CompletedFlag = request.CompletedFlag,
                                  CollectedPcs = request.Package

                              },


                        p => p.TrxNo == TrxNo
              );

                    }
                }
            }
            catch { throw; }
            return Result;
        }

        public int confirm_csbk1(Csbk request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    Result = db.Update<Csbk1>(
                                    new
                                    {
                                        CompletedFlag = "Y"

                                    },
                                    p => p.BookingNo == request.BookingNo
                    );
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
