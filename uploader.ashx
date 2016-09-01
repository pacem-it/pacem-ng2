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
        var form = context.Request.Form;
        switch (context.Request.QueryString["what"])
        {
            case "start":
                context.Response.Write(StartUpload(form["filename"], long.Parse(form["length"])));
                break;
            case "do":
                var stream = form["chunk"];
                byte[] buffer = Convert.FromBase64String(stream);
                context.Response.Write(Upload(form["uid"], buffer, long.Parse(form["position"])));
                break;
            case "undo":
                context.Response.Write(UndoUpload(form["uid"]));
                break;
            case "complete":
                context.Response.Write(CompleteUpload(form["filename"]));
                break;
        }
    }

    public string StartUpload(string filename, long length)
    {
        try
        {
            var result = UploadManager.CreateUpload(filename, length);
            return JsonConvert.SerializeObject(new { success = true, result = result });
        }
        catch (Exception exc)
        {
            return JsonConvert.SerializeObject(new { success = false, error = exc.Message });
        }
    }

    public string Upload(string uid, byte[] chunk, long position)
    {
        try
        {
            var result = UploadManager.DoUpload(uid, chunk, position);
            return JsonConvert.SerializeObject(new { success = true, result = result });
        }
        catch (Exception exc)
        {
            return JsonConvert.SerializeObject(new { success = false, error = exc.Message });
        }
    }

    public async Task<string> UploadAsync(string uid, byte[] chunk, long position)
    {
        try
        {
            var result = await UploadManager.DoUploadAsync(uid, chunk, position);
            return JsonConvert.SerializeObject(new { success = true, result = result });
        }
        catch (Exception exc)
        {
            return JsonConvert.SerializeObject(new { success = false, error = exc.Message });
        }
    }

    public string CompleteUpload(string filename)
    {
        try
        {
            //Art.Website.UI.Admin.StoreBinaryFile(filename);
            return JsonConvert.SerializeObject(new { success = true });
        }
        catch (Exception exc)
        {
            return JsonConvert.SerializeObject(new { success = false, error = exc.Message });
        }
    }

    public string UndoUpload(string uid)
    {
        try
        {
            UploadManager.UndoUpload(uid);
            return JsonConvert.SerializeObject(new { success = true });
        }
        catch (Exception exc)
        {
            return JsonConvert.SerializeObject(new { success = false, error = exc.Message });
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}


public class UploadWrapper
{

    internal UploadWrapper(Upload upload)
    {
        this.Uid = upload.UniqueID;
        this.Percentage = 100F * (float)upload.Done / (float)upload.Total;
        this.OriginalFilename = upload.OriginalFilename;
        this.Size = upload.Total;
        this.Complete = upload.Complete;
        if (this.Complete)
            this.Filename = upload.Filename;
    }

    public UploadWrapper()
    {
    }

    public bool Complete { get; set; }

    public float Percentage { get; set; }

    public string Uid { get; set; }

    public string Filename { get; set; }

    public string OriginalFilename { get; set; }

    public long Size { get; set; }
}

public static class UploadManager
{
    internal const string TEMP_FOLDER = "~/App_Data/Files/Temp";

    private static readonly Uploader uploader = new Uploader
    {
        UploadTempPath = HttpContext.Current.Server.MapPath(UploadManager.TEMP_FOLDER),
        UploadPath = HttpContext.Current.Server.MapPath(UploadManager.TEMP_FOLDER)
    };

    public static void SweepTempFiles(double dayOld)
    {
        DateTime now = DateTime.Now;
        foreach (var path in Directory.GetFiles(uploader.UploadTempPath).Where(f =>
            now.Subtract(File.GetLastWriteTime(f)).TotalDays > dayOld
        ))
        {
            File.Delete(path);
        }
    }

    public static UploadWrapper CreateUpload(string filename, long length)
    {
        return new UploadWrapper(uploader.CreateUpload(filename, length));
    }

    public static async Task<UploadWrapper> DoUploadAsync(string uid, byte[] chunk, long position)
    {
        return new UploadWrapper(await uploader.DoUploadAsync(uid, chunk, position));
    }

    public static UploadWrapper DoUpload(string uid, byte[] chunk, long position)
    {
        return new UploadWrapper( uploader.DoUpload(uid, chunk, position));
    }

    public static void UndoUpload(string uid)
    {
        uploader.UndoUpload(uid);
    }
}