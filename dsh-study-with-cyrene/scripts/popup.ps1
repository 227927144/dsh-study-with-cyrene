param(
  [Parameter(Mandatory = $true)][string]$ResultPath,
  [string]$DomainBase64 = '',
  [int]$ElapsedMinutes = 0,
  [int]$BreakMinutes = 5,
  [int]$Sound = 1,
  [switch]$Test
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function ConvertFrom-Base64Text([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return '' }
  try {
    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($value))
  } catch {
    return ''
  }
}

function Brush([string]$color) {
  return [System.Windows.Media.BrushConverter]::new().ConvertFromString($color)
}

$domain = ConvertFrom-Base64Text $DomainBase64
if ([string]::IsNullOrWhiteSpace($domain)) { $domain = '学习' }
$script:done = $false
$script:breakMode = $false

$window = New-Object System.Windows.Window
$window.WindowStyle = [System.Windows.WindowStyle]::None
$window.ResizeMode = [System.Windows.ResizeMode]::NoResize
$window.Topmost = $true
$window.ShowInTaskbar = $true
$window.WindowStartupLocation = [System.Windows.WindowStartupLocation]::Manual
$window.Background = Brush '#0B0D12'
$window.Foreground = Brush '#F5F0FF'

if ($Test) {
  $window.WindowStyle = [System.Windows.WindowStyle]::SingleBorderWindow
  $window.Topmost = $false
  $window.Width = 640
  $window.Height = 380
  $window.Left = 200
  $window.Top = 200
} else {
  $virtual = [System.Windows.Forms.SystemInformation]::VirtualScreen
  $window.Left = $virtual.Left
  $window.Top = $virtual.Top
  $window.Width = $virtual.Width
  $window.Height = $virtual.Height
}

$root = New-Object System.Windows.Controls.Border
$root.Background = Brush '#0B0D12'
$root.Padding = '28'
$window.Content = $root

$outer = New-Object System.Windows.Controls.StackPanel
$outer.HorizontalAlignment = 'Center'
$outer.VerticalAlignment = 'Center'
$root.Child = $outer

$card = New-Object System.Windows.Controls.Border
$card.Background = Brush '#141824'
$card.BorderBrush = Brush '#2A2F3F'
$card.BorderThickness = '1'
$card.CornerRadius = '20'
$card.Padding = '34,30'
$card.MaxWidth = 820
$card.HorizontalAlignment = 'Center'
$outer.Children.Add($card) | Out-Null

$content = New-Object System.Windows.Controls.StackPanel
$content.HorizontalAlignment = 'Center'
$card.Child = $content

$accent = Brush '#E6A6C8'
$muted = Brush '#B9B3C8'
$soft = Brush '#8F8AA3'

$brand = New-Object System.Windows.Controls.TextBlock
$brand.Text = 'StudyWithCyrene · 昔涟'
$brand.FontSize = 14
$brand.Foreground = $soft
$brand.HorizontalAlignment = 'Center'
$brand.Margin = '0,0,0,18'
$content.Children.Add($brand) | Out-Null

$title = New-Object System.Windows.Controls.TextBlock
$title.Text = '伙伴，回来啦？'
$title.FontSize = 38
$title.FontWeight = [System.Windows.FontWeights]::SemiBold
$title.Foreground = $accent
$title.HorizontalAlignment = 'Center'
$title.Margin = '0,0,0,16'
$content.Children.Add($title) | Out-Null

$body = New-Object System.Windows.Controls.TextBlock
$body.Text = "已经 $ElapsedMinutes 分钟啦。人家有两分钟没在「$domain」里看到你学习了……`n回来把这小段光接上，好吗？"
$body.FontSize = 19
$body.Foreground = $muted
$body.TextWrapping = 'Wrap'
$body.TextAlignment = 'Center'
$body.LineHeight = 32
$body.MaxWidth = 680
$body.HorizontalAlignment = 'Center'
$body.Margin = '0,0,0,26'
$content.Children.Add($body) | Out-Null

$buttons = New-Object System.Windows.Controls.StackPanel
$buttons.Orientation = 'Horizontal'
$buttons.HorizontalAlignment = 'Center'
$content.Children.Add($buttons) | Out-Null

function New-ActionButton([string]$label, [string]$background, [string]$foreground) {
  $button = New-Object System.Windows.Controls.Button
  $button.Content = $label
  $button.FontSize = 16
  $button.Padding = '20,11'
  $button.Margin = '7,0'
  $button.Background = Brush $background
  $button.Foreground = Brush $foreground
  $button.BorderThickness = '0'
  $button.Cursor = [System.Windows.Input.Cursors]::Hand
  return $button
}

$back = New-ActionButton '我回来了' '#E6A6C8' '#1A1018'
$break = New-ActionButton '休息一下' '#242938' '#F5F0FF'
$paper = New-ActionButton '不想学啦' '#1B2030' '#F5F0FF'
$buttons.Children.Add($back) | Out-Null
$buttons.Children.Add($break) | Out-Null
$buttons.Children.Add($paper) | Out-Null

$hint = New-Object System.Windows.Controls.TextBlock
$hint.Text = '长按 Esc 3 秒可以强制关掉提醒'
$hint.FontSize = 12
$hint.Foreground = $soft
$hint.HorizontalAlignment = 'Center'
$hint.Margin = '0,22,0,0'
$content.Children.Add($hint) | Out-Null

$escTimer = New-Object System.Windows.Threading.DispatcherTimer
$escTimer.Interval = [TimeSpan]::FromSeconds(3)
$escTimer.Add_Tick({
  $escTimer.Stop()
  Complete 'force'
})

function Complete([string]$action) {
  if ($script:done) { return }
  $script:done = $true
  $payload = [ordered]@{
    action = $action
    at = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  try {
    [System.IO.File]::WriteAllText($ResultPath, ($payload | ConvertTo-Json -Compress), [System.Text.UTF8Encoding]::new($false))
  } catch { }
  $escTimer.Stop()
  $window.Close()
}

$back.Add_Click({ Complete 'back' })
$break.Add_Click({
  if (-not $script:breakMode) {
    $script:breakMode = $true
    $break.Content = '继续学习'
    $title.Text = '先歇一会儿吧'
    $body.Text = '人家把这段光先放在这里。等你准备好了，再点「继续学习」接着来，好吗？'
    $hint.Text = '休息的时候，不用急着回来'
    return
  }
  Complete 'back'
})
$paper.Add_Click({ Complete 'paper' })
$window.Add_KeyDown({
  if ($_.Key -eq [System.Windows.Input.Key]::Escape -and -not $escTimer.IsEnabled) {
    $escTimer.Start()
  }
})
$window.Add_KeyUp({
  if ($_.Key -eq [System.Windows.Input.Key]::Escape) {
    $escTimer.Stop()
  }
})
$window.Add_Closed({
  if (-not $script:done) {
    $script:done = $true
    $payload = [ordered]@{
      action = 'closed'
      at = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    }
    try {
      [System.IO.File]::WriteAllText($ResultPath, ($payload | ConvertTo-Json -Compress), [System.Text.UTF8Encoding]::new($false))
    } catch { }
  }
})

if ($Sound -ne 0) {
  try { [System.Media.SystemSounds]::Exclamation.Play() } catch { }
}

if ($Test) {
  $testTimer = New-Object System.Windows.Threading.DispatcherTimer
  $testTimer.Interval = [TimeSpan]::FromSeconds(1.5)
  $testTimer.Add_Tick({
    $testTimer.Stop()
    Complete 'back'
  })
  $window.Add_Loaded({ $testTimer.Start() })
}
$window.ShowDialog() | Out-Null
