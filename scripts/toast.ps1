param(
  [Parameter(Mandatory = $true)][string]$TextBase64,
  [int]$Seconds = 8
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

$text = ''
try {
  $text = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($TextBase64))
} catch {
  $text = '伙伴，继续加油呀♪'
}
if ([string]::IsNullOrWhiteSpace($text)) { $text = '伙伴，继续加油呀♪' }

$workArea = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$width = 380
$height = 128
$window = New-Object System.Windows.Window
$window.WindowStyle = [System.Windows.WindowStyle]::None
$window.ResizeMode = [System.Windows.ResizeMode]::NoResize
$window.AllowsTransparency = $true
$window.Background = [System.Windows.Media.Brushes]::Transparent
$window.Topmost = $true
$window.ShowInTaskbar = $false
$window.ShowActivated = $false
$window.Focusable = $false
$window.Width = $width
$window.Height = $height
$window.Left = $workArea.Right - $width - 20
$window.Top = $workArea.Bottom - $height - 20

$border = New-Object System.Windows.Controls.Border
$border.Background = Brush '#E61A1D26'
$border.BorderBrush = Brush '#33FFFFFF'
$border.BorderThickness = '1'
$border.CornerRadius = '14'
$border.Padding = '16,14'
$window.Content = $border

$textBlock = New-Object System.Windows.Controls.TextBlock
$textBlock.Text = $text
$textBlock.FontSize = 14
$textBlock.Foreground = Brush '#FFF5F0FF'
$textBlock.TextWrapping = 'Wrap'
$textBlock.LineHeight = 22
$border.Child = $textBlock

$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromSeconds([Math]::Max(1, $Seconds))
$timer.Add_Tick({
  $timer.Stop()
  $window.Close()
})
$window.Add_Loaded({ $timer.Start() })
$window.ShowDialog() | Out-Null
