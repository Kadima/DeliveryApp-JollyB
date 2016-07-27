using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WebApi.ServiceModel;
using WebApi.ServiceModel.TMS;

namespace WebApi.ServiceInterface.TMS
{
    public class TableService
    {
        public void TS_Tobk(Auth auth, Csbk request, Csbk_Logic tobk_Logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {

                if (uri.IndexOf("/tms/csbk1/sps") > 0)
                {
                    ecr.data.results = tobk_Logic.Get_csbk1_SpsList(request);
                }
                else if (uri.IndexOf("tms/csbk1/UpdateCollected") > 0)
                {
                    ecr.data.results = tobk_Logic.Update_Csbk1Collected(request);
                }
                else if (uri.IndexOf("/tms/csbk1/update") > 0)
                {
                    ecr.data.results = tobk_Logic.update_csbk1(request);
                }
                else if (uri.IndexOf("/tms/csbk1/confirm") > 0)
                {
                    ecr.data.results = tobk_Logic.confirm_csbk1(request);
                }
                else if (uri.IndexOf("/tms/csbk1") > 0)
                {
                    ecr.data.results = tobk_Logic.Get_csbk1_List(request);

                }
                else if (uri.IndexOf("/tms/csbk2/update") > 0)
                {
                    ecr.data.results = tobk_Logic.Update_Csbk2(request);
                }
                else if (uri.IndexOf("/tms/csbk2") > 0)
                {
                    ecr.data.results = tobk_Logic.Get_Csbk2_List(request);
                }
                ecr.meta.code = 200;
                ecr.meta.message = "OK";
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }

        public void TS_Slcr(Auth auth, Slcr request, Slcr_Logic slcr_logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
                if (uri.IndexOf("/tms/slcr1/complete") > 0)
                {
                    ecr.data.results = slcr_logic.Complete_Slcr1(request);
                }
                else if (uri.IndexOf("/tms/slcr1") > 0)
                {
                    ecr.data.results = slcr_logic.Get_slcr1(request);
                }
                ecr.meta.code = 200;
                ecr.meta.message = "OK";
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }


        public void TS_Rcbp(Auth auth, Rcbp request, Rcbp_Logic rcbp_logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
                if (uri.IndexOf("/tms/rcbp1") > 0)
                {
                    ecr.data.results = rcbp_logic.Get_rcbp1_List(request);
                }
                ecr.meta.code = 200;
                ecr.meta.message = "OK";
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }


        public void DownLoadImg(Auth auth, DownLoadImg request, DownLoadImg_Logic logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
                if (uri.IndexOf("/tms/csbk1/attach") > 0)
                {
                    ecr.data.results = logic.Get_Jmjm1_Attach_List(request);
                }
                if (uri.IndexOf("/tms/jmjm1/doc") > 0)
                {
                    ecr.data.results = logic.Get_Jmjm1_Doc_List(request);
                }
                ecr.meta.code = 200;
                ecr.meta.message = "OK";
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }

    }
}
