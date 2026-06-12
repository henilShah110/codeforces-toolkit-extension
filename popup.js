async function sendCommand(type){

    let [tab] = await chrome.tabs.query({
        active:true,
        currentWindow:true
    });

    chrome.tabs.sendMessage(
        tab.id,
        {action:type},
        (response)=>{
            console.log(
                "sendMessage result:",
                chrome.runtime.lastError
            );
        }
    );
}

document.getElementById("ad").onclick=()=>{
    sendCommand("AD");
};

document.getElementById("af").onclick=()=>{
    sendCommand("AF");
};

document.getElementById("all").onclick=()=>{
    sendCommand("ALL");
};


document.getElementById("practiceContest").onclick=()=>{

    console.log("Practice button clicked");

    sendCommand("PRACTICE_CONTEST");
};

async function checkServerStatus(){

    const statusDiv =
        document.getElementById(
            "serverStatus"
        );

    try{

        const response =
            await fetch(
                "http://127.0.0.1:5000/status"
            );

        const data =
            await response.json();

        if(data.status==="online"){

            statusDiv.classList.remove(
                "offline"
            );

            statusDiv.classList.add(
                "online"
            );

            statusDiv.innerHTML =
                "Server Online";
        }

    }
    catch{

        statusDiv.classList.remove(
            "online"
        );

        statusDiv.classList.add(
            "offline"
        );

        statusDiv.innerHTML =
            "Server Offline";
    }

}

checkServerStatus();