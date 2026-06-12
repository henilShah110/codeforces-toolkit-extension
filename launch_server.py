import urllib.request
import subprocess

try:
    urllib.request.urlopen(
        "http://127.0.0.1:5000",
        timeout=1
    )

except:
    subprocess.Popen(
        ["pythonw", "server.py"],
        cwd=r"C:\Users\shahj\Projects\codeForcesTabOpener"
    )