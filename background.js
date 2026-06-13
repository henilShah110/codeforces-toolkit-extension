console.log("Background loaded");

function getGroupName(title){

    let match =
        title.match(
            /Round\s+(\d+)/
        );

    if(match){
        return `Round${match[1]}`;
    }

    match =
        title.match(
            /Educational Codeforces Round\s+(\d+)/
        );

    if(match){
        return `Edu${match[1]}`;
    }

    return "Codeforces";
}

async function openTabs(
    urls,
    contestTitle
){

    const currentTabs =
        await chrome.tabs.query({
            active:true,
            currentWindow:true
        });

    const currentTab =
        currentTabs[0];

    let ids = [
        currentTab.id
    ];

    for(const url of urls){

        const tab =
            await chrome.tabs.create({
                url:url,
                active:false
            });

        ids.push(tab.id);
    }

    chrome.tabs.group(
        {
            tabIds: ids
        },
        (groupId)=>{

            chrome.tabGroups.update(
                groupId,
                {
                    title:
                        getGroupName(
                            contestTitle
                        )
                }
            );

        }
    );
}

chrome.runtime.onMessage.addListener((message)=>{


    console.log("Received:");
    console.log(message);

    if(message.openTabs){
        openTabs(
            message.openTabs,
            message.contestTitle
        );
    }

    if(message.contestType){

        openTabs(message.urls.slice(0,6));

        console.log("BACKGROUND:");
        console.log(message);

        fetch("http://127.0.0.1:5000/startContest",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                contestType:message.contestType,
                title:message.title,
                letters:message.letters,
                contestId:message.contestId
            })
        });
    }

});

chrome.commands.onCommand.addListener(async(command)=>{

    if(command==="open-all-problems"){

        let tabs = await chrome.tabs.query({
            active:true,
            currentWindow:true
        });

        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                action:"ALL"
            }
        );
    }

});