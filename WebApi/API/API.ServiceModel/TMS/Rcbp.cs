using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;
namespace WebApi.ServiceModel.TMS
{
    [Route("/tms/rcbp1", "Get")]  // rcbp1?BookingNo=
    public class Rcbp : IReturn<CommonResponse>
    {
        public string BookingNo { get; set; }
    }
    public class Rcbp_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Rcbp1> Get_rcbp1_List(Rcbp request)
        {
            List<Rcbp1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
     
                    if (!string.IsNullOrEmpty(request.BookingNo))
                    {                  
                        string strSQL = "select isnull(Rcbp1.Handphone1, '') as Handphone1,isnull(Rcbp1.Telephone, '') as Telephone from Rcbp1 left join csbk1 on  Rcbp1.BusinessPartyCode=csbk1.BookingCustomerCode  where csbk1.BookingNo='"+request.BookingNo+"'";
                        Result = db.Select<Rcbp1>(strSQL);

                    }

                }

            }
            catch { throw; }
            return Result;

        }

    }
}
