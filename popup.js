// makes buttons so the urls that are already stored can be assigened to a button
// when the extension icon is pressed
function fetchButtons() {
// div that we will use in order to add new buttons to that section
	
	//get the list of the urls
	// make a button for each url
	chrome.storage.local.get({userKeyIds: []}, function(result){
		result.userKeyIds.forEach(function(result){

			let button = createButton(result.keyPairId, result.buttonId);
			// checking the current background tab to see if it matches any of the url buttons
			// if so, highlight its border
			chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
				let currentbackgroundurl = tabs[0].url.split('/');

				if((currentbackgroundurl[2].substring(0, 4) === "www." && currentbackgroundurl[2].substring(4) === result.keyPairId) || currentbackgroundurl[2] === result.keyPairId){
					button.style.border = "thick solid 	#ff0000";
				}
			})
			
			//appending button to the popup
			appendButton(button);
		});
	});
 }


// First lets fetch all the urls that have been made and then we make buttons for each
// we can later listen for the add function in order to add new urls
function addButton(keyPairId) {
	// keyPairId = url
	if(keyPairId.includes("https://")){
		keyPairId = keyPairId.replace("https://", "");
	}

	if(keyPairId.includes("www.")){
		keyPairId = keyPairId.replace("www.", "");
	}
	
	let id = getUniqueId();

	chrome.storage.local.get({userKeyIds: []}, function (result) {
    // the input argument is ALWAYS an object containing the queried keys
    // so we select the key we need
    	let userKeyIds = result.userKeyIds;
    	userKeyIds.push({keyPairId: keyPairId, buttonId: id});
    	// set the new array value to the same key
    	chrome.storage.local.set({userKeyIds: userKeyIds}, function () {
        // you can use strings instead of objects
        // if you don't  want to define default values
        	chrome.storage.local.get('userKeyIds', function (result) {
            	console.log(result.userKeyIds);
        	});
    	});
	});

	let button = createButton(keyPairId, id);
	appendButton(button);
}

function createButton(url, buttonId){
	
	// setting the passed url into storage
	let button = document.createElement("button");
	//creating unique id for each button

	button.classList.add("circle-btn");

	button.id = buttonId;

	button.style.backgroundImage = "url(" + getFavicon(url) + ")";

	button.style.backgroundRepeat = "no-repeat";

	// create event listener that when pressed it replaces the current page url

	button.addEventListener('click', function(){
		if(deleteMode){
			//delteing pressed button
			chrome.storage.local.get({userKeyIds: []}, function(result){
				for(let i = 0; i < result.userKeyIds.length; i++){
					if(result.userKeyIds[i].buttonId === button.id){
						console.log("here");
						deleteButton(i);
						break;
					}
				}
			});
		} else{
			replaceUrl(url);
		}
	})

	return button;
}
// appends button to popup
function appendButton(button){
	let page = document.getElementById("buttonDiv");

	page.appendChild(button);

}

//swaps the current url with new url
function replaceUrl(url) {

	// fetching the current tab url
	chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
		//getting current tab url
		let currentUrl = tabs[0].url;

		if(!currentUrl.includes("https://")){
			currentUrl = "https://" + currentUrl;
		}

		// split in order to get the domain
		let urlArray = currentUrl.split('/');

		// replace the domain with the saved url
		currentUrl = currentUrl.replace(urlArray[2], url);

		let newTab = document.getElementById("toggle").checked;
		// Logic for taking care of if the user wants a new tab or not
		if(newTab){
			//creating new tab 
			window.open(currentUrl);
		} else{
			// staying in the same tab
			chrome.tabs.update(tabs[0].id, {url: currentUrl});
		}
	});
}

function getFavicon(url){
	return "https://plus.google.com/_/favicon?domain=" + url;
}


// clears every saved url in the list
// will use later for delete option
function deleteButton(index) {
	chrome.storage.local.get({userKeyIds: []}, function(result){

		let userKeyIds = result.userKeyIds;
		userKeyIds.splice(index, 1);

		chrome.storage.local.set({userKeyIds: result.userKeyIds}, function(){
			console.log("deleted");
		});
	});

	document.getElementById('buttonDiv').innerHTML = "";
	fetchButtons();
	location.reload();
}

// generates unique id for deleting purposes
function getUniqueId(){
	return Math.random().toString(36);
}


// make a new url button
let trigger = document.getElementById("addUrl");

let clear = document.getElementById("clearUrlList");

let newUrl = document.getElementById("inputUrl");

// boolean that allows us to edit and delete buttons
let deleteMode = false; 

let urlChange = false;

// evenet listener for when we want to add a new button associated with a new url
trigger.addEventListener("click", function(){
	
	if(newUrl.value === ""){
		alert("Url field is empty. Please enter a url.");
	} 
	
	//else if(this.firstChild.nodeValue === "Enter" ){}

	else{
		addButton(newUrl.value);
	}
	
	// we then clear it so the user doesnt make multiple identical buttons
	newUrl.value = "";
});

// event listener for the clear List button
clear.addEventListener("click", function(){
	if(!deleteMode){
		trigger.firstChild.nodeValue = "Enter";
		this.firstChild.nodeValue = "Done";
		deleteMode = true;
	} else{
		trigger.firstChild.nodeValue = "Add Url";
		this.firstChild.nodeValue = "Delete";
		newUrl.value = "";
		deleteMode = false;
	}
});

// fetches the created buttons
fetchButtons();
