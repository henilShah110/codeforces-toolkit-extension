from flask import Flask, request
from flask_cors import CORS
import os
import re
import subprocess
import json
import requests


app = Flask(__name__)
CORS(app)

PRACTICE_DIR = r"C:\Users\shahj\Projects\cppPractice\codeForcesContests"

CPP_TEMPLATE = """#include <bits/stdc++.h>
using namespace std;

int main() {
    long long t;
    cin >> t;

    while (t--) {

        long long n;
        cin >> n;


    }

    return 0;
}
"""


def contest_name(title):

    edu_match = re.search(
        r'Educational Codeforces Round\s+(\d+)',
        title
    )

    if edu_match:
        return f"edu{edu_match.group(1)}"

    round_match = re.search(
        r'Codeforces Round\s+(\d+)',
        title
    )

    if round_match:
        return f"round{round_match.group(1)}"

    return "UnknownContest"


def get_current_contest():

    try:

        with open(
            "current_contest.json",
            "r"
        ) as f:

            return json.load(f)

    except:

        return None


@app.route("/startContest", methods=["POST"])
def start_contest():

    print("\nPOST RECEIVED")

    data = request.json

    print(data)

    name = contest_name(data["title"])

    # Save current contest
    with open(
        "current_contest.json",
        "w"
    ) as f:

        json.dump(
            {
                "contest": name,
                "type": data["contestType"],
                "letters": sorted(
                    set(
                        data["letters"]
                    )
                )
            },
            f,
            indent=4
        )

    base = PRACTICE_DIR

    folder = os.path.join(base, name)

    folder_exists = os.path.exists(folder)

    if folder_exists:

        print("Folder already exists")

    else:

        print("Creating:")
        print(folder)

        os.makedirs(folder, exist_ok=True)

        if data["contestType"] == "ACTIVE_CONTEST":

            letters = [
                "A",
                "B",
                "C",
                "D",
                "E",
                "F"
            ]

        else:

            letters = sorted(
                set(
                    data["letters"]
                )
            )

        for letter in letters:

            file_path = os.path.join(
                folder,
                f"{letter}.cpp"
            )

            with open(file_path, "w") as f:
                f.write(CPP_TEMPLATE)

        for i in range(1, 4):

            file_path = os.path.join(
                folder,
                f"temp{i}.cpp"
            )

            with open(file_path, "w") as f:
                f.write(CPP_TEMPLATE)

        print("Files created")

    try:

        subprocess.Popen(
            f'code -n "{folder}"',
            shell=True
        )

        print("VS Code opened")

    except Exception as e:

        print("VS Code error:")
        print(e)

    return {
        "success": True,
        "folder": folder,
        "alreadyExisted": folder_exists
    }


@app.route("/status")
def status():

    return {
        "status": "online"
    }

@app.route("/contestInfo")
def contest_info():

    contest_data = get_current_contest()

    if contest_data is None:

        return {
            "success": False
        }

    return {
        "success": True,
        "contest": contest_data["contest"],
        "type": contest_data["type"],
        "letters": contest_data["letters"]
    }


@app.route("/contestProgress")
def contest_progress():

    contest_data = get_current_contest()

    if contest_data is None:

        return {
            "success": False
        }

    letters = contest_data["letters"]

    try:

        response = requests.get(
            "https://codeforces.com/api/user.status",
            params={
                "handle":"shadowman11",
                "from":1,
                "count":100
            },
            timeout=10
        )

        submissions = response.json()["result"]

        progress = {}

        for letter in letters:

            progress[letter] = "-"

        for submission in submissions:

            problem = submission["problem"]

            if "index" not in problem:
                continue

            index = problem["index"]

            if index not in progress:
                continue

            verdict = submission.get(
                "verdict"
            )

            if verdict == "OK":

                progress[index] = "Accepted"

            elif progress[index] != "Accepted":

                if verdict is None:

                    progress[index] = "In Queue"

                else:

                    progress[index] = "Wrong"

        return {
            "success": True,
            "progress": progress
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

@app.route("/testProblem", methods=["POST"])
def test_problem():

    data = request.json

    contest_data = get_current_contest()

    if contest_data is None:

        return {
            "success": False,
            "message": "No contest selected."
        }

    contest = contest_data["contest"]
    problem = data["problem"]

    contest_dir = os.path.join(
        PRACTICE_DIR,
        contest
    )

    cpp_file = os.path.join(
        contest_dir,
        f"{problem}.cpp"
    )

    exe_file = os.path.join(
        contest_dir,
        f"{problem}.exe"
    )

    try:

        compile_result = subprocess.run(
            [
                "g++",
                cpp_file,
                "-std=c++17",
                "-O2",
                "-o",
                exe_file
            ],
            capture_output=True,
            text=True
        )

        if compile_result.returncode != 0:

            return {
                "success": False,
                "message":
                    "❌ Compilation Failed\n\n"
                    + "\n".join(
                        compile_result.stderr.splitlines()[-5:]
                    )
            }

        results = []

        inputs = data["inputs"]
        outputs = data["outputs"]

        for i in range(len(inputs)):

            run_result = subprocess.run(
                [exe_file],
                input=inputs[i],
                capture_output=True,
                text=True,
                timeout=5
            )

            user_output = run_result.stdout.strip()

            expected_output = (
                outputs[i]
                .strip()
            )

            passed = (
                user_output ==
                expected_output
            )

            expected_lines = expected_output.splitlines()
            got_lines = user_output.splitlines()

            results.append({
                "sample": i + 1,
                "passed": passed,
                "expected": expected_lines,
                "got": got_lines
            })

        return {
            "success": True,
            "results": results
        }

    except subprocess.TimeoutExpired:

        return {
            "success": False,
            "message":
                "Program exceeded 5 seconds."
        }

    except Exception as e:

        return {
            "success": False,
            "message":
                str(e)
        }
if __name__ == "__main__":
    app.run(port=5000)