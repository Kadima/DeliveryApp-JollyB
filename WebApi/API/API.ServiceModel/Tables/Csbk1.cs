using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
   public class Csbk1
    {
        public string BookingNo { get; set; }
        public int TrxNo { get; set; }
        public string StatusCode { get; set; }  
        public string JobNo { get; set; }
        public int  Pcs { get; set; }
        public string CollectionTimeStart { get; set; }
        public string CollectionTimeEnd { get; set; }
        public string PostalCode { get; set; }
        public string BusinessPartyCode { get; set; }
        public string  BusinessPartyName { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Address4 { get; set; }
        public string BookingCustomerCode { get; set; }
        public string CompletedFlag { get; set; }
        public string AttachmentFlag { get; set; }
        public string TimeFrom { get; set; }
        public string TimeTo { get; set; }
        public string ColTimeFrom { get; set; }
        public string ColTimeTo { get; set; }
        public decimal CollectedAmt { get; set; }
        public decimal DepositAmt { get; set; }
        public decimal DiscountAmt { get; set; }
        public int ItemNo { get; set; }
        public decimal PaidAmt { get; set; }
        public string ScanDate  { get; set; }
        public string ActualCollectionDate { get; set; }
        public string ActualDeliveryDate { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        







    }
}
