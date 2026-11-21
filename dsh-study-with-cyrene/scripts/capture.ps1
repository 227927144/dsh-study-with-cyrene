param(
  [Parameter(Mandatory = $true)][string]$OutPath,
  [Parameter(Mandatory = $true)][string]$JsonPath,
  [int]$MaxWidth = 1280
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class SwcCaptureWindow {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
}
'@

function Get-ExceptionText([System.Exception]$exception) {
  $parts = @()
  $current = $exception
  for ($index = 0; $index -lt 6 -and $null -ne $current; $index++) {
    if (-not [string]::IsNullOrWhiteSpace($current.Message)) { $parts += $current.Message }
    if ($current -is [System.AggregateException] -and $current.InnerExceptions.Count -gt 0) {
      $current = $current.InnerExceptions[0]
    } else {
      $current = $current.InnerException
    }
  }
  return ($parts -join ' | ')
}

function Write-CaptureError([string]$message) {
  $payload = [ordered]@{
    ok = $false
    error = $message
    ocrOk = $false
    ocr = ''
    capturedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  $json = $payload | ConvertTo-Json -Compress
  try {
    $directory = Split-Path -Parent $JsonPath
    if ($directory -and -not (Test-Path -LiteralPath $directory)) {
      New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }
    [System.IO.File]::WriteAllText($JsonPath, $json, [System.Text.UTF8Encoding]::new($false))
  } catch { }
  Write-Output $json
}

try {
  $directory = Split-Path -Parent $JsonPath
  if ($directory -and -not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
  }

  $handle = [SwcCaptureWindow]::GetForegroundWindow()
  if ($handle -ne [IntPtr]::Zero) {
    $screen = [System.Windows.Forms.Screen]::FromHandle($handle)
  } else {
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen
  }
  if ($null -eq $screen) { $screen = [System.Windows.Forms.Screen]::PrimaryScreen }
  $bounds = $screen.Bounds
  $bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bitmap.Size, [System.Drawing.CopyPixelOperation]::SourceCopy)
  $bitmap.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()

  $ocrText = ''
  $ocrOk = $false
  $ocrError = ''
  try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Storage.Streams.DataWriter, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Storage.Streams.IRandomAccessStream, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Globalization.Language, Windows.Foundation, ContentType = WindowsRuntime]
    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
      $_.Name -eq 'AsTask' -and
      $_.GetParameters().Count -eq 1 -and
      $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
    } | Select-Object -First 1)
    if ($null -eq $asTaskGeneric) { throw 'AsTask(IAsyncOperation<T>) not found' }
    function Await-WinRt($operation, $resultType) {
      $task = $asTaskGeneric.MakeGenericMethod($resultType).Invoke($null, @($operation))
      $task.Wait(-1) | Out-Null
      $task.Result
    }
    $bytes = [System.IO.File]::ReadAllBytes($OutPath)
    $memoryStream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $writer = New-Object Windows.Storage.Streams.DataWriter($memoryStream)
    $writer.WriteBytes($bytes)
    $null = Await-WinRt ($writer.StoreAsync()) ([uint32])
    $null = $writer.DetachStream()
    $writer.Dispose()
    $memoryStream.Seek(0)
    $decoder = Await-WinRt ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($memoryStream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $softwareBitmap = Await-WinRt ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if ($null -eq $engine) {
      foreach ($tag in @('zh-Hans', 'zh-CN', 'en-US')) {
        try {
          $language = [Windows.Globalization.Language]::new($tag)
          $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($language)
        } catch {
          $engine = $null
        }
        if ($null -ne $engine) { break }
      }
    }
    if ($null -eq $engine) { throw 'Windows OCR engine unavailable (language pack missing?)' }
    $ocrResult = Await-WinRt ($engine.RecognizeAsync($softwareBitmap)) ([Windows.Media.Ocr.OcrResult])
    $ocrText = [string]$ocrResult.Text
    $ocrOk = $true
    if ($null -ne $memoryStream) { $memoryStream.Dispose() }
    if ($null -ne $softwareBitmap) { $softwareBitmap.Dispose() }
  } catch {
    $ocrOk = $false
    $ocrError = Get-ExceptionText $_.Exception
  }

  if ($MaxWidth -gt 0) {
    $source = [System.Drawing.Image]::FromFile($OutPath)
    try {
      if ($source.Width -gt $MaxWidth) {
        $height = [int][Math]::Max(1, [Math]::Round($source.Height * $MaxWidth / $source.Width))
        $resized = New-Object System.Drawing.Bitmap($MaxWidth, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $resizeGraphics = [System.Drawing.Graphics]::FromImage($resized)
        $resizeGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $resizeGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $resizeGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $resizeGraphics.DrawImage($source, 0, 0, $MaxWidth, $height)
        $resizeGraphics.Dispose()
        $temporary = $OutPath + '.resized.png'
        $resized.Save($temporary, [System.Drawing.Imaging.ImageFormat]::Png)
        $resized.Dispose()
        $source.Dispose()
        $source = $null
        Move-Item -LiteralPath $temporary -Destination $OutPath -Force
      }
    } finally {
      if ($null -ne $source) { $source.Dispose() }
    }
  }

  $payload = [ordered]@{
    ok = $true
    ocrOk = $ocrOk
    ocr = $ocrText
    ocrError = $ocrError
    imagePath = $OutPath
    width = $bounds.Width
    height = $bounds.Height
    capturedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  $json = $payload | ConvertTo-Json -Compress
  [System.IO.File]::WriteAllText($JsonPath, $json, [System.Text.UTF8Encoding]::new($false))
  Write-Output $json
} catch {
  Write-CaptureError (Get-ExceptionText $_.Exception)
}
