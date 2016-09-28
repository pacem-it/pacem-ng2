<%@ WebHandler Language="C#" Class="uploader" %>

using System;
using System.Web;
using System.Threading.Tasks;
using Newtonsoft.Json;
using PacemJS;
using System.IO;
using System.Linq;

public class uploader : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        context.Response.ContentType = "application/json";
        var q = context.Request.QueryString["q"];
        int ndx = 1;
        var regions = Regions.OrderBy(r => r)
                .Select(r => new { ID = ndx++, Name = r });
        var result = regions.Where(r => !string.IsNullOrEmpty(q) && r.Name.ToLowerInvariant().Contains(q.ToLowerInvariant()))
                .OrderBy(r => r.ID).Take(4);
        //System.Threading.Thread.Sleep(2000);
        context.Response.Write(JsonConvert.SerializeObject(new { success = true, result = result }));
    }

    private static string[] Regions =
        {
            "Valle d'Aosta",
            "Piemonte",
            "Lombardia",
            "Veneto",
            "Trentino Alto Adige",
            "Friuli Venezia Giulia",
            "Liguria",
            "Emilia Romagna",
            "Toscana",
            "Umbria",
            "Marche",
            "Lazio",
            "Abruzzo",
            "Campania",
            "Molise",
            "Puglia",
            "Basilicata",
            "Calabria",
            "Sicilia",
            "Sardegna"
        };

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}