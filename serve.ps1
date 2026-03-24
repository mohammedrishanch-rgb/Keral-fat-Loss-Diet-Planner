$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Listening on http://localhost:8080/"
while ($true) {
    $context = $listener.GetContext()
    $response = $context.Response
    
    $localPath = $context.Request.Url.LocalPath.Replace("/", "\")
    if ($localPath -eq "\") {
        $localPath = "\index.html"
    }

    $file = "c:\website&anti gravity\fat loss diet plan creator" + $localPath
    
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllBytes($file)
        $response.ContentLength64 = $content.Length
        
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        if ($ext -eq ".css") { $response.ContentType = "text/css" }
        elseif ($ext -eq ".js") { $response.ContentType = "application/javascript" }
        elseif ($ext -eq ".html") { $response.ContentType = "text/html" }
        
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.Close()
}
