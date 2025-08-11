import subprocess
import os

# 需要的图标尺寸
sizes = [16, 32, 48, 128]

# 使用系统命令转换SVG到PNG
for size in sizes:
    output_file = f"public/icon-{size}.png"
    # 使用 rsvg-convert 或 ImageMagick 的 convert 命令
    try:
        # 尝试使用 rsvg-convert
        subprocess.run([
            "rsvg-convert",
            "-w", str(size),
            "-h", str(size),
            "icon.svg",
            "-o", output_file
        ], check=True)
        print(f"Generated {output_file} using rsvg-convert")
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            # 如果 rsvg-convert 不可用，尝试 ImageMagick
            subprocess.run([
                "convert",
                "-background", "none",
                "-resize", f"{size}x{size}",
                "icon.svg",
                output_file
            ], check=True)
            print(f"Generated {output_file} using ImageMagick")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"Error: Neither rsvg-convert nor ImageMagick is available")
            print("Please install one of them:")
            print("  macOS: brew install librsvg or brew install imagemagick")
            print("  Ubuntu: sudo apt-get install librsvg2-bin or sudo apt-get install imagemagick")
            exit(1)

print("All icons generated successfully!")