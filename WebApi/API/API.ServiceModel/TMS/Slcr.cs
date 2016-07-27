using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;
using System.Collections;

namespace WebApi.ServiceModel.TMS
{
    [Route("/tms/slcr1/complete", "Get")] //
    [Route("/tms/slcr1/checkStatus", "Get")]  //checkStatus?BookingNo=
    [Route("/tms/slcr1/update", "Get")]
    [Route("/tms/slcr1", "Get")]      //slcr1?BookingNo=
    public  class Slcr : IReturn<CommonResponse>
    {
        public string ReceiptNo { get; set; }
        public string JobNo { get; set; }
        public string BookingNo { get; set; }
        public decimal CashAmt { get; set; }
       public string UpdateBy { get; set; }
        public decimal ChequeAmt { get; set; }
        public string CollectBy { get; set; }
        
    }
    public class Slcr_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public int Complete_Slcr1(Slcr request)
        {
            int Result = -1;
            string NextNo = "";
            int intMonth = 0;
            request.ChequeAmt = 0;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {

                    var strSQL = "SELECT "+
" case "+
     "  when MONTH(GETDATE()) = '1' then(select  Mth01NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))"+
 " when MONTH(GETDATE()) = '2' then(select  Mth02NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
  "     when MONTH(GETDATE()) = '3' then(select  Mth03NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
"  when MONTH(GETDATE()) = '4' then(select  Mth04NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
  "     when MONTH(GETDATE()) = '5' then(select  Mth05NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
"  when MONTH(GETDATE()) = '6' then(select  Mth06NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
  "     when MONTH(GETDATE()) = '7' then(select  Mth07NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
"  when MONTH(GETDATE()) = '8' then(select  Mth08NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
   "    when MONTH(GETDATE()) = '9' then(select  Mth09NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
 " when MONTH(GETDATE()) = '10' then(select  Mth10NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
  "     when MONTH(GETDATE()) = '11' then(select  Mth11NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
 " when MONTH(GETDATE()) = '12' then(select  Mth12NextNo from sanm2 where TrxNo = (Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate())))" +
 "end as 'NextNo' ";
                    NextNo = db.Scalar<string>(strSQL);
                    NextNo= CheckUpdateFieldLength(NextNo);

                    if (NextNo.Length > 0)
                    {
                        db.Insert(
                            new Slcr1
                            {

                                ReceiptNo = "RE" + DateTime.Now.ToString("yyMMdd") + NextNo,
                                JobNo = request.JobNo,
                                BookingNo = request.BookingNo,
                                BookingLine = null,
                                Remark = null,
                                ReceiptType = "Payment",
                                CashAmt = request.CashAmt,
                                ChequeAmt = request.ChequeAmt,
                                ReceiptAmt = request.CashAmt+ request.ChequeAmt,
                                ReceiptDate = DateTime.Now,
                                ChequeDate = null,
                                UpdateBy = request.UpdateBy,
                                CollectBy = request.CollectBy,
                            }
                            );
                        Result = 0;

                       strSQL = "SELECT " +
" case " +
 "  when MONTH(GETDATE()) = '1' then  1" +
" when MONTH(GETDATE()) = '2' then 2 " +
"     when MONTH(GETDATE()) = '3' then 3 " +
"  when MONTH(GETDATE()) = '4' then 4 " +
"     when MONTH(GETDATE()) = '5' then 5 " +
"  when MONTH(GETDATE()) = '6' then 6 " +
"     when MONTH(GETDATE()) = '7' then 7 " +
"  when MONTH(GETDATE()) = '8' then 8 " +
"    when MONTH(GETDATE()) = '9' then 9 " +
" when MONTH(GETDATE()) = '10' then 10 " +
"     when MONTH(GETDATE()) = '11' then 11 " +
" when MONTH(GETDATE()) = '12' then 12" +
" end as 'NextNo' ";
                        intMonth = db.Scalar<int>(strSQL);

                        if (intMonth == 1)
                        {

                            db.Update("sanm2", " Mth01NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 2)
                        {
                            db.Update("sanm2", " Mth02NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 3)
                        {
                            db.Update("sanm2", " Mth03NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                       else if (intMonth == 4)
                        {

                            db.Update("sanm2", " Mth04NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 5)
                        {
                            db.Update("sanm2", " Mth05NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        if (intMonth == 6)
                        {

                            db.Update("sanm2", " Mth06NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 7)
                        {
                            db.Update("sanm2", " Mth07NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 8)
                        {
                            db.Update("sanm2", " Mth08NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        if (intMonth == 9)
                        {

                            db.Update("sanm2", " Mth09NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 10)
                        {
                            db.Update("sanm2", " Mth10NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 11)
                        {
                            db.Update("sanm2", " Mth11NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }
                        else if (intMonth == 12)
                        {
                            db.Update("sanm2", " Mth12NextNo = '" + NextNo + "'", "trxno =(Select TrxNo From Sanm1 Where NumberType = 'Slcr') and YEAR = (select year(getdate()))");

                        }

                                 Result = db.Update<Csbk1>(
                                    new
                                    {
                                   
                                        DepositAmt = Convert.ToDecimal(0),
                                        PaidAmt= Convert.ToDecimal(request.CashAmt+ request.ChequeAmt)

                                    },
                                    p => p.BookingNo == request.BookingNo
                    );




                    }
                }
            }
            catch { throw; }
            return Result;
        }

        public string CheckUpdateFieldLength(string strField)
        {
                      int intI=0;
                      int intStartLen=0;
                      string   CheckUpdateFieldLength1="";
                   CheckUpdateFieldLength1 = Convert.ToString((int.Parse(strField) + 1));
                   intStartLen = CheckUpdateFieldLength1.Length;
                   if( intStartLen != strField.Length )
                 {
                      for( intI = intStartLen; intI< strField.Length; intI++)
                    {
                    CheckUpdateFieldLength1 = "0" + CheckUpdateFieldLength1;
                   }

             }
          
            return CheckUpdateFieldLength1;
       
        }

        //public int CheckStatus(Slcr request) {
        //    int Result = -1;
        //    try
        //    {
        //        using (var db = DbConnectionFactory.OpenDbConnection())
        //        {
        //            string strSql = "";
        //            if ( ! string.IsNullOrEmpty(request.BookingNo))
        //            {
        //                 strSql = "Select count(*) From slcr1 Where BookingNo='" + request.BookingNo + "'";
        //            }                
        //            Result = db.Scalar<int>(strSql);
        //        }
        //    }
        //    catch { throw; }
        //    return Result;

        //}

        public List<Slcr1> Get_slcr1(Slcr request)
        {
            List<Slcr1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                   
                    string strWhere = "";
                    if (!string.IsNullOrEmpty(request.BookingNo))
                    {

                        strWhere = "Where BookingNo='" + request.BookingNo + "'";

                    }
                  var strSQL = "select sum(ReceiptAmt) as ReceiptAmt,BookingNo from  slcr1 " + strWhere+"group by BookingNo";
                    Result = db.Select<Slcr1>(strSQL);

                }

            }
            catch { throw; }
            return Result;

        }

    }
}
