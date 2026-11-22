param(
  [string]$ApiBase = 'http://127.0.0.1:14444',
  [string]$ApiPrefix = '/study-with-cyrene/api',
  [switch]$Test
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms

function Brush([string]$color) {
  return [System.Windows.Media.BrushConverter]::new().ConvertFromString($color)
}

function Add-TextShadow($block) {
  $effect = New-Object System.Windows.Media.Effects.DropShadowEffect
  $effect.BlurRadius = 4
  $effect.ShadowDepth = 1
  $effect.Opacity = 0.9
  $effect.Color = [System.Windows.Media.Colors]::Black
  $block.Effect = $effect
}

function Format-Duration([double]$ms) {
  if (-not $ms -or $ms -lt 1000) { return '0 秒' }
  $seconds = [Math]::Floor($ms / 1000)
  if ($seconds -lt 60) { return "$seconds 秒" }
  $minutes = [Math]::Floor($seconds / 60)
  if ($minutes -lt 60) { return "$minutes 分钟" }
  $hours = [Math]::Floor($minutes / 60)
  $rest = $minutes % 60
  if ($rest -eq 0) { return "$hours 小时" }
  return "$hours 小时 $rest 分钟"
}

function Get-StatusLabel([string]$status) {
  switch ($status) {
    'study' { return '学习中' }
    'break' { return '休息中' }
    'paper' { return '歇一会儿' }
    'alert' { return '该回来啦' }
    default { return '在陪着你' }
  }
}

$script:base = $ApiBase.TrimEnd('/')
$script:prefix = '/' + $ApiPrefix.Trim('/')
$script:uri = "$script:base$script:prefix/state"
$script:headers = @{ 'X-Study-With-Cyrene' = '1' }
$script:data = $null
$script:apiOk = $false
$script:expanded = $false
$script:dragPoint = $null
$script:dragMoved = $false
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea

$window = New-Object System.Windows.Window
$window.WindowStyle = [System.Windows.WindowStyle]::None
$window.AllowsTransparency = $true
$window.ResizeMode = [System.Windows.ResizeMode]::NoResize
$window.Topmost = $true
$window.ShowInTaskbar = $false
$window.ShowActivated = $false
$window.WindowStartupLocation = [System.Windows.WindowStartupLocation]::Manual
$window.Background = [System.Windows.Media.Brushes]::Transparent
$window.Left = $screen.Right - 88
$window.Top = $screen.Bottom - 120
$window.Width = 68
$window.Height = 68

$shadow = New-Object System.Windows.Media.Effects.DropShadowEffect
$shadow.BlurRadius = 18
$shadow.ShadowDepth = 4
$shadow.Opacity = 0.28
$shadow.Color = [System.Windows.Media.Colors]::Black

# ---- ball ----
$ball = New-Object System.Windows.Controls.Border
$ball.Width = 64
$ball.Height = 64
$ball.CornerRadius = '32'
$ball.BorderThickness = '2'
$ball.BorderBrush = Brush '#FFE3F0'
$ball.Cursor = [System.Windows.Input.Cursors]::Hand
$ball.ToolTip = '点击展开 StudyWithCyrene'
$ball.Effect = $shadow
$imagePath = Join-Path $PSScriptRoot '..\assets\cyrene.png'
$bitmap = New-Object System.Windows.Media.Imaging.BitmapImage
$bitmap.BeginInit()
$bitmap.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
$bitmap.UriSource = [Uri]::new((Resolve-Path -LiteralPath $imagePath).Path)
$bitmap.EndInit()
$imageBrush = New-Object System.Windows.Media.ImageBrush
$imageBrush.ImageSource = $bitmap
$imageBrush.Stretch = [System.Windows.Media.Stretch]::UniformToFill
$ball.Background = $imageBrush
$ball.Clip = New-Object System.Windows.Media.EllipseGeometry
$ball.Clip.Center = New-Object System.Windows.Point(32, 32)
$ball.Clip.RadiusX = 32
$ball.Clip.RadiusY = 32

$ballGrid = New-Object System.Windows.Controls.Grid
$dot = New-Object System.Windows.Shapes.Ellipse
$dot.Width = 12
$dot.Height = 12
$dot.Fill = Brush '#8F8AA3'
$dot.Stroke = Brush '#FFF8FB'
$dot.StrokeThickness = 2
$dot.HorizontalAlignment = 'Right'
$dot.VerticalAlignment = 'Bottom'
$dot.Margin = '0,0,5,5'
$ballGrid.Children.Add($dot) | Out-Null
$ball.Child = $ballGrid

# ---- panel ----
$panel = New-Object System.Windows.Controls.Border
$panel.Width = 475
$panel.Height = 263
$panel.CornerRadius = '18'
$panel.Background = Brush '#B3F8E7F0'
$panel.BorderBrush = Brush '#80E9B9D0'
$panel.BorderThickness = '1'
$panel.Padding = '12'

$grid = New-Object System.Windows.Controls.Grid
$grid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition -Property @{ Height = '30' })) | Out-Null
$grid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition -Property @{ Height = '*' })) | Out-Null
$grid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition -Property @{ Height = '42' })) | Out-Null
$panel.Child = $grid

$header = New-Object System.Windows.Controls.Grid
[System.Windows.Controls.Grid]::SetRow($header, 0)
$grid.Children.Add($header) | Out-Null
$brand = New-Object System.Windows.Controls.TextBlock
$brand.Text = 'StudyWithCyrene'
$brand.FontSize = 20.3125
$brand.FontWeight = [System.Windows.FontWeights]::SemiBold
$brand.Foreground = Brush '#FFF8FB'
$brand.VerticalAlignment = 'Center'
$brand.Cursor = [System.Windows.Input.Cursors]::SizeAll
$header.Children.Add($brand) | Out-Null
Add-TextShadow $brand

$body = New-Object System.Windows.Controls.StackPanel
[System.Windows.Controls.Grid]::SetRow($body, 1)
$body.Margin = '0,4,0,0'
$grid.Children.Add($body) | Out-Null

$domainText = New-Object System.Windows.Controls.TextBlock
$domainText.Text = '正在读记忆……'
$domainText.FontSize = 23.4375
$domainText.FontWeight = [System.Windows.FontWeights]::SemiBold
$domainText.Foreground = Brush '#FFF8FB'
$domainText.TextWrapping = 'Wrap'
$body.Children.Add($domainText) | Out-Null
Add-TextShadow $domainText

$timerText = New-Object System.Windows.Controls.TextBlock
$timerText.Text = '—'
$timerText.FontSize = 43.75
$timerText.FontWeight = [System.Windows.FontWeights]::SemiBold
$timerText.Foreground = Brush '#FF9CC2'
$timerText.Margin = '0,1,0,0'
$body.Children.Add($timerText) | Out-Null
Add-TextShadow $timerText

$statusText = New-Object System.Windows.Controls.TextBlock
$statusText.Text = ''
$statusText.FontSize = 18.75
$statusText.Foreground = Brush '#A9D6F5'
$body.Children.Add($statusText) | Out-Null
Add-TextShadow $statusText

$metaText = New-Object System.Windows.Controls.TextBlock
$metaText.Text = ''
$metaText.FontSize = 18.75
$metaText.Foreground = Brush '#A9D6F5'
$metaText.Margin = '0,5,0,0'
$body.Children.Add($metaText) | Out-Null
Add-TextShadow $metaText

$actions = New-Object System.Windows.Controls.StackPanel
$actions.Orientation = 'Horizontal'
[System.Windows.Controls.Grid]::SetRow($actions, 2)
$actions.VerticalAlignment = 'Bottom'
$grid.Children.Add($actions) | Out-Null

function New-PanelButton([string]$label) {
  $button = New-Object System.Windows.Controls.Button
  $button.Content = $label
  $button.FontSize = 18.75
  $button.Padding = '14,5'
  $button.Margin = '0'
  $button.BorderThickness = '1'
  $button.BorderBrush = Brush '#66FFFFFF'
  $button.Background = Brush '#8C141414'
  $button.Foreground = Brush '#FFF8FB'
  $button.Cursor = [System.Windows.Input.Cursors]::Hand
  return $button
}

$fold = New-PanelButton '收起'
$actions.Children.Add($fold) | Out-Null

function Update-Ball {
  if (-not $script:apiOk) {
    $dot.Fill = Brush '#8F8AA3'
    return
  }
  $active = $script:data.active
  if (-not $active) {
    $dot.Fill = Brush '#8F8AA3'
    return
  }
  switch ($active.status) {
    'study' { $dot.Fill = Brush '#63D29A' }
    'break' { $dot.Fill = Brush '#F2B35C' }
    'paper' { $dot.Fill = Brush '#C9A6F5' }
    'alert' { $dot.Fill = Brush '#F06A8A' }
    default { $dot.Fill = Brush '#E6A6C8' }
  }
}

function Update-Panel {
  if (-not $script:apiOk) {
    $domainText.Text = 'DSH 未连接'
    $timerText.Text = '—'
    $statusText.Text = '等 DSH 回来，人家再接着数'
    $metaText.Text = ''

    return
  }
  $active = $script:data.active
  $today = if ($script:data.stats) { Format-Duration $script:data.stats.totalMs } else { '0 秒' }
  $week = if ($script:data.week) { Format-Duration $script:data.week.totalMs } else { '0 秒' }
  if (-not $active) {
    $domainText.Text = '还没有开始学习'
    $timerText.Text = '—'
    $statusText.Text = '点侧栏或悬浮球里的「开始学习」就会亮起来'
    $metaText.Text = "今日 $today · 本周 $week"

    return
  }
  $domainText.Text = '昔涟正在陪伴伙伴学习' + [string]$active.domain + '中'
  $timerText.Text = Format-Duration ([int64]$active.studyMs)
  $statusText.Text = Get-StatusLabel ([string]$active.status)
  $metaText.Text = "今日 $today · 本周 $week"

}

function Update-All {
  try {
    $response = Invoke-RestMethod -Uri $script:uri -Headers $script:headers -TimeoutSec 3
    if ($response.ok -and $response.value) {
      $script:data = $response.value
      $script:apiOk = $true
    } else {
      $script:apiOk = $false
    }
  } catch {
    $script:apiOk = $false
  }
  Update-Ball
  if ($script:expanded) { Update-Panel }
}

function Set-BallMode {
  $script:expanded = $false
  $window.Content = $ball
  $window.Width = 68
  $window.Height = 68
  $window.Left = $screen.Right - 88
  $window.Top = $screen.Bottom - 120
  Update-All
}

function Set-PanelMode {
  $script:expanded = $true
  $window.Content = $panel
  $window.Width = 475
  $window.Height = 263
  $window.Left = [Math]::Max(8, $screen.Right - 400)
  $window.Top = [Math]::Max(8, $screen.Bottom - 250)
  Update-All
}

$fold.Add_Click({ Set-BallMode })

$brand.Add_MouseLeftButtonDown({
  try { $window.DragMove() } catch { }
})

$ball.Add_MouseLeftButtonDown({
  $script:dragPoint = $_.GetPosition($window)
  $script:dragMoved = $false
})
$ball.Add_MouseMove({
  if ($_.LeftButton -eq [System.Windows.Input.MouseButtonState]::Pressed -and $script:dragPoint) {
    $point = $_.GetPosition($window)
    $dx = $point.X - $script:dragPoint.X
    $dy = $point.Y - $script:dragPoint.Y
    if ([Math]::Abs($dx) + [Math]::Abs($dy) -gt 4) { $script:dragMoved = $true }
    if ($script:dragMoved) {
      $window.Left += $dx
      $window.Top += $dy
      $script:dragPoint = $point
    }
  }
})
$ball.Add_MouseLeftButtonUp({
  if (-not $script:dragMoved) { Set-PanelMode }
  $script:dragPoint = $null
})

$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromSeconds(2)
$timer.Add_Tick({ Update-All })
$timer.Start()

$window.Content = $ball
Update-All

$testOpen = $null
$testClose = $null
if ($Test) {
  $window.Left = 300
  $window.Top = 300
  $testOpen = New-Object System.Windows.Threading.DispatcherTimer
  $testOpen.Interval = [TimeSpan]::FromMilliseconds(600)
  $testOpen.Add_Tick({
    $testOpen.Stop()
    Set-PanelMode
  })
  $testOpen.Start()
  $testClose = New-Object System.Windows.Threading.DispatcherTimer
  $testClose.Interval = [TimeSpan]::FromMilliseconds(2800)
  $testClose.Add_Tick({
    $testClose.Stop()
    $window.Close()
  })
  $testClose.Start()
}

$null = $window.ShowDialog()
$timer.Stop()
if ($testOpen) { $testOpen.Stop() }
if ($testClose) { $testClose.Stop() }
