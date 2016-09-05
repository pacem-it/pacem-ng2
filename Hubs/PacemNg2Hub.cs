using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;

namespace PacemNg2.Hubs
{
    public class PacemNg2Hub : Hub
    {
        internal static int counter = 0;

        public override Task OnConnected()
        {
            return base.OnConnected().ContinueWith(t =>
            {
                if (t.IsCompleted)
                    Clients.Caller.notify(counter);
            });
        }

        public string Echo(string message)
        {
            counter++;
            Clients.All.notify(counter);
            return message;
        }
    }
}