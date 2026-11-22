$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class SwcWindow {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
'@
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
while ($true) {
  try {
    $handle = [SwcWindow]::GetForegroundWindow()
    $builder = New-Object System.Text.StringBuilder 512
    [void][SwcWindow]::GetWindowText($handle, $builder, $builder.Capacity)
    [uint32]$processId = 0
    [void][SwcWindow]::GetWindowThreadProcessId($handle, [ref]$processId)
    $processName = ''
    if ($processId -ne 0) {
      $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
      if ($null -ne $process) { $processName = $process.ProcessName }
    }
    $payload = [ordered]@{
      process = $processName
      title = $builder.ToString()
      at = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    }
    [Console]::Out.WriteLine(($payload | ConvertTo-Json -Compress))
    [Console]::Out.Flush()
  } catch {
    # A locked desktop or a transient Win32 error is not fatal for the watcher.
  }
  Start-Sleep -Milliseconds 2000
}
