"""
BOOND — Windows & Cross-Platform Lambda Packaging Script
Builds a deployable AWS Lambda package for Python 3.12 x86_64 runtime.
Can be executed directly from Windows PowerShell without WSL or Bash.
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
REQUIREMENTS_FILE = BACKEND_DIR / "requirements.txt"
OUTPUT_DIR = ROOT_DIR / "dist"


def build_lambda_package(target_zip: Path, skip_deps: bool = False):
    """Packages backend code and Linux x86_64 wheels into a deployable zip."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp_dir:
        staging_dir = Path(tmp_dir)
        print(f"[*] Staging package in: {staging_dir}")

        if not skip_deps and REQUIREMENTS_FILE.exists():
            print(f"[*] Downloading and installing Linux-compatible wheels for Python 3.12...")
            pip_cmd = [
                sys.executable,
                "-m",
                "pip",
                "install",
                "--platform",
                "manylinux2014_x86_64",
                "--target",
                str(staging_dir),
                "--implementation",
                "cp",
                "--python-version",
                "3.12",
                "--only-binary=:all:",
                "-r",
                str(REQUIREMENTS_FILE),
                "--upgrade",
            ]
            try:
                subprocess.run(pip_cmd, check=True)
                print("[+] Successfully installed dependencies.")
            except subprocess.CalledProcessError as e:
                print(f"[!] Warning: pip install with manylinux targeting returned error: {e}")
                print("[!] Falling back to standard pip install into target directory...")
                subprocess.run(
                    [sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE), "-t", str(staging_dir)],
                    check=True,
                )

        # Copy application source files
        print("[*] Copying backend application code and Cedar policies...")
        files_to_copy = [
            ("app.py", "app.py"),
            ("policy.py", "policy.py"),
            ("__init__.py", "__init__.py"),
        ]
        for src_name, dst_name in files_to_copy:
            src_file = BACKEND_DIR / src_name
            if src_file.exists():
                shutil.copy2(src_file, staging_dir / dst_name)

        # Copy policies directory
        policies_src = BACKEND_DIR / "policies"
        if policies_src.exists():
            shutil.copytree(policies_src, staging_dir / "policies", dirs_exist_ok=True)

        # Create zip archive
        print(f"[*] Creating deployment archive: {target_zip}")
        if target_zip.exists():
            target_zip.unlink()

        with zipfile.ZipFile(target_zip, "w", zipfile.ZIP_DEFLATED) as zf:
            for file_path in staging_dir.rglob("*"):
                if file_path.is_file():
                    arcname = file_path.relative_to(staging_dir)
                    zf.write(file_path, arcname)

        size_mb = target_zip.stat().st_size / (1024 * 1024)
        print(f"[SUCCESS] Lambda package created: {target_zip} ({size_mb:.2f} MB)")


def main():
    parser = argparse.ArgumentParser(description="Package BOOND Lambda for Python 3.12")
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default=str(OUTPUT_DIR / "boond-backend.zip"),
        help="Target zip file path",
    )
    parser.add_argument(
        "--skip-deps",
        action="store_true",
        help="Skip packaging external pip dependencies (code only)",
    )
    args = parser.parse_args()

    build_lambda_package(Path(args.output), skip_deps=args.skip_deps)


if __name__ == "__main__":
    main()
