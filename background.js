console.log("Background loaded");

async function openTabs(urls){

    let ids=[];

    for(let url of urls){

        let tab = await chrome.tabs.create({
            url:url,
            active:false
        });

        ids.push(tab.id);
    }

    if(ids.length>1){

        chrome.tabs.group(
            {tabIds:ids},
            (groupId)=>{

                chrome.tabGroups.update(
                    groupId,
                    {
                        title:"Codeforces"
                    }
                );

            }
        );
    }
}

chrome.runtime.onMessage.addListener((message)=>{


    console.log("Received:");
    console.log(message);

    if(message.openTabs){

        openTabs(message.openTabs);
    }

    if(message.contestType){

        openTabs(message.urls.slice(0,6));

        fetch("http://127.0.0.1:5000/startContest",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                contestType:message.contestType,
                title:message.title,
                letters:message.letters
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