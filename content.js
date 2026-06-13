console.log("CONTENT SCRIPT LOADED");

chrome.runtime.onMessage.addListener((request)=>{

    console.log("Message received:");
    console.log(request);

    let links = Array.from(
        document.querySelectorAll('a[href*="/problem/"]')
    );

    let unique = [];
    let seen = new Set();

    links.forEach(link=>{

        let url = new URL(link.href).href;

        if(!seen.has(url)){
            seen.add(url);
            unique.push(url);
        }
    });

    unique.sort();

    if(
        request.action==="PRACTICE_CONTEST"
    ){

        const letters = [];

        unique.forEach(url => {

            const match = url.match(/problem\/([A-Z][0-9]*)/);

            if(match){
                letters.push(match[1]);
            }

        });

        const contestMatch =
            window.location.pathname.match(
                /contest\/(\d+)/
            );

        const contestId =
            contestMatch
            ? contestMatch[1]
            : null;


        console.log("SENDING:");
        console.log({
            contestType: request.action,
            title: document.title,
            urls: unique,
            letters: letters,
            contestId: contestId
        });

        chrome.runtime.sendMessage({
            contestType: request.action,
            title: document.title,
            urls: unique,
            letters: letters,
            contestId: contestId
        });

        return;
    }

    let result=[];

    if(request.action==="AD"){
        result = unique.slice(0,4);
    }
    else if(request.action==="AF"){
        result = unique.slice(0,6);
    }
    else{
        result = unique;
    }

    chrome.runtime.sendMessage({
        openTabs:result,
        contestTitle: document.title
    });

});

function injectCFToolkit() {

    const contestBox = document.querySelector(
        ".roundbox.sidebox"
    );

    if (!contestBox) {
        return;
    }

    if (
        document.getElementById(
            "cf-toolkit-buttons"
        )
    ) {
        return;
    }

    const container =
        document.createElement("div");

    container.id =
        "cf-toolkit-buttons";

    container.style.padding =
        "10px";

    container.style.display =
        "flex";

    container.style.gap =
        "10px";

    container.style.justifyContent =
        "center";

    const testBtn =
        document.createElement("button");

    testBtn.innerText =
        "Test";

    testBtn.style.width = "100%";

    testBtn.style.padding =
        "8px";

    testBtn.style.cursor =
        "pointer";

    testBtn.style.border =
        "none";

    testBtn.style.borderRadius =
        "6px";

    testBtn.style.background =
        "#005d22";

    testBtn.style.color =
        "white";

    testBtn.style.fontWeight =
        "bold";

    testBtn.style.fontSize =
        "13px";

    testBtn.onclick = async () => {

        const problemLetter =
            window.location.pathname
                .split("/")
                .pop();

        const sampleInputs = Array.from(
            document.querySelectorAll(
                ".sample-test .input pre"
            )
        ).map(x => x.innerText);

        const sampleOutputs = Array.from(
            document.querySelectorAll(
                ".sample-test .output pre"
            )
        ).map(x => x.innerText);

        try{

            const response =
                await fetch(
                    "http://127.0.0.1:5000/testProblem",
                    {
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({
                            problem:problemLetter,
                            inputs:sampleInputs,
                            outputs:sampleOutputs
                        })
                    }
                );

            const data =
                await response.json();

            if(data.results){

                let passedCount = 0;

                data.results.forEach(r => {

                    if(r.passed){
                        passedCount++;
                    }

                });

                const allPassed =
                    passedCount === data.results.length;

                let html = `
                    <div style="
                        font-weight:bold;
                        margin-bottom:5px;
                        margin-left:4px;
                        margin-right:4px;
                        padding:4px;
                        border-radius:6px;
                        font-size:11px;
                        background:${
                            allPassed
                            ? "#66b5a0"
                            : "#a55252"
                        };
                        color:white;
                    ">
                        ${
                            allPassed
                            ? "🟢"
                            : "🔴"
                        }

                        Passed ${passedCount}/${data.results.length}
                        Samples
                    </div>

                    <div style="
                        font-weight:bold;
                        margin-bottom:8px;
                        margin-left:4px;
                        margin-right:4px;
                    ">
                        Test Results
                    </div>
                `;

                data.results.forEach(r => {

                    if(r.passed){

                        html += `
                            <div style="
                                margin-bottom:8px;
                                margin-left:4px;
                                margin-right:4px;
                                color:#22c55e;
                                font-weight:bold;
                                font-size:11px;
                            ">
                                ✅ Sample ${r.sample} Passed
                            </div>
                        `;
                    }
                    else{

                        let rows = "";

                        const maxLines =
                            Math.max(
                                r.expected.length,
                                r.got.length
                            );

                        for(let i=0;i<maxLines;i++){

                            const exp =
                                r.expected[i] ?? "";

                            const got =
                                r.got[i] ?? "";

                            const wrong =
                                exp !== got;

                            rows += `
                                <tr>

                                    <td style="
                                        border:1px solid #334155;
                                        margin-left:4px;
                                        margin-right:4px;
                                        padding:2px;
                                        font-size:10px;
                                        color:${
                                            wrong
                                            ? "#ef4444"
                                            : "#22c55e"
                                        };
                                    ">
                                        ${exp}
                                    </td>

                                    <td style="
                                        border:1px solid #334155;
                                        margin-left:4px;
                                        margin-right:4px;
                                        padding:4px;
                                        color:${
                                            wrong
                                            ? "#ef4444"
                                            : "#22c55e"
                                        };
                                    ">
                                        ${got}
                                    </td>

                                </tr>
                            `;
                        }

                        html += `
                            <div style="
                                margin-top:10px;
                                margin-bottom:5px;
                                margin-left:4px;
                                margin-right:4px;
                                color:#ef4444;
                                font-weight:bold;
                                font-size:11px;
                            ">
                                ❌ Sample ${r.sample} Failed
                            </div>

                            <table style="
                                width:97%;
                                border-collapse:collapse;
                                margin-bottom:10px;
                                margin-left:4px;
                                margin-right:4px;
                            ">
                                <tr>
                                    <th style="
                                        border:1px solid #334155;
                                        padding:3px;
                                        font-size:10px;
                                        background:#0f172a;
                                        color:white;
                                        margin-left:4px;
                                        margin-right:4px;
                                    ">
                                        Expected
                                    </th>

                                    <th style="
                                        border:1px solid #334155;
                                        padding:3px;
                                        font-size:10px;
                                        color:white;
                                        background:#0f172a;
                                        margin-left:4px;
                                        margin-right:4px;
                                    ">
                                        Got
                                    </th>
                                </tr>

                                <tbody>
                                    ${rows}
                                </tbody>

                                
                            </table>
                        `;
                    }

                });

                showCFResult(
                    html,
                    true
                );
            }
            else{

                showCFResult(
                    data.message
                );
            }

        }
        catch(error){

            showCFResult(
                "Server Offline"
            );

        }

    };


    container.appendChild(
        testBtn
    );

    contestBox.appendChild(
        container
    );

    const panel =
        document.createElement("div");

    panel.id =
        "cf-toolkit-result";

    contestBox.appendChild(panel);
}

function showCFResult(content, isHTML=false){

    let panel =
        document.getElementById(
            "cf-toolkit-result"
        );

    if(!panel){

        panel =
            document.createElement("div");

        panel.id =
            "cf-toolkit-result";

        panel.style.marginTop =
            "12px";

        panel.style.padding =
            "6px";

        panel.style.borderRadius =
            "8px";

        panel.style.background =
            "#1e293b";

        panel.style.color =
            "white";

        panel.style.fontSize =
            "10px";

        panel.style.fontFamily =
            "Consolas, monospace";

        panel.style.lineHeight =
            "1.4";

        panel.style.maxWidth =
            "100%";

        panel.style.boxSizing =
            "border-box";

        panel.style.maxHeight =
            "250px";

        panel.style.overflowY =
            "auto";
    }

    if(isHTML){
        panel.innerHTML = content;
    }
    else{
        panel.innerText = content;
    }
}

async function updateContestProgress(){

    try{

        const response =
            await fetch(
                "http://127.0.0.1:5000/contestProgress"
            );

        const data =
            await response.json();

        if(!data.success){
            return;
        }

        let panel =
            document.getElementById(
                "cf-progress-panel"
            );

        if(!panel){

            panel =
                document.createElement(
                    "div"
                );

            panel.id =
                "cf-progress-panel";

            panel.style.marginTop =
                "8px";

            const contestBox =
                document.querySelector(
                    ".roundbox.sidebox"
                );

            contestBox.appendChild(
                panel
            );
        }

        let html = `
            <div style="
                font-weight:bold;
                margin-bottom:5px;
                margin-left:4px;
                margin-right:4px;
                font-size:11px;
            ">
                Contest Progress
            </div>

            <table style="
                width:97%;
                border-collapse:collapse;
                font-size:10px;
                margin-left:4px;
                margin-right:4px;
            ">
        `;

        for(const [problem,status]
            of Object.entries(
                data.progress
            )){

            let color =
                "#b6b6b6";

            if(
                status ===
                "Accepted"
            ){

                color =
                    "#53ff98";
            }

            else if(
                status ===
                "Wrong"
            ){

                color =
                    "#ff6e6e";
            }

            else if(
                status ===
                "In Queue"
            ){

                color =
                    "#ffbd71";
            }

            html += `
                <tr style="
                    background:${color};
                ">
                    <td style="
                        border:1px solid black;
                        padding:4px;
                        font-weight:bold;
                    ">
                        ${problem}
                    </td>

                    <td style="
                        border:1px solid black;
                        padding:4px;
                    ">
                        ${status}
                    </td>
                </tr>
            `;
        }

        html += `
            </table>
        `;

        panel.innerHTML =
            html;

    }
    catch(error){

        console.log(
            error
        );

    }

}

setTimeout(()=>{

    injectCFToolkit();

    updateContestProgress();

    setInterval(
        updateContestProgress,
        30000
    );

},1000);