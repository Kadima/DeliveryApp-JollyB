using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;

namespace WebApi.ServiceModel.Utils
{
   public static class StreamExtender
    {
        public static void Copy(this Stream instance, Stream target)
        {
            int bytesRead = 0;
            int bufSize = copyBuf.Length;

            while ((bytesRead = instance.Read(copyBuf, 0, bufSize)) > 0)
            {
                target.Write(copyBuf, 0, bytesRead);
            }
        }
        private static readonly byte[] copyBuf = new byte[0x1000];
    }
}
