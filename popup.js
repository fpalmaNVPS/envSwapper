// makes buttons so the urls that are already stored can be assigened to a button
// when the extension icon is pressed
function fetchButtons() {

// div that we will use in order to add new buttons to that section
	let page = document.getElementById('buttonDiv');

	//get the List of the Urls
	// make a button for each url
	chrome.storage.local.get({userKeyIds: []}, function(result){
		result.userKeyIds.forEach(function(result){

			let button = createButton(result.keyPairId);
			// checking the current background tab to see if it matches any of the url buttons
			// if so, highlight its border
			chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
				let currentBackgroundUrl = tabs[0].url.split('/');

				if(currentBackgroundUrl[2].substring(0, 4) === "www." && currentBackgroundUrl[2].substring(4) === result.keyPairId){
					button.style.border = "thick solid 	#FF0000";
				} else if(currentBackgroundUrl[2] === result.keyPairId){
					button.style.border = "thick solid 	#FF0000";
				}
			})
			
			//appending button to the popup
			page.appendChild(button);
		});
	});
}



// First lets fetch all the urls that have been made and then we make buttons for each
// we can later listen for the add function in order to add new urls
function addButton(keyPairId) {

	if(keyPairId.includes("https://")){
		keyPairId = keyPairId.replace("https://", "");
	}

	if(keyPairId.includes("www.")){
		keyPairId = keyPairId.replace("www.", "");
	}
	
	// div that we will use in order to add new buttons to that section
	let page = document.getElementById('buttonDiv');

	let button = createButton(keyPairId);

	chrome.storage.local.get({userKeyIds: []}, function (result) {
    // the input argument is ALWAYS an object containing the queried keys
    // so we select the key we need
    	let userKeyIds = result.userKeyIds;
    	userKeyIds.push({keyPairId: keyPairId, buttonId: button.id});
    	// set the new array value to the same key
    	chrome.storage.local.set({userKeyIds: userKeyIds}, function () {
        // you can use strings instead of objects
        // if you don't  want to define default values
        	chrome.storage.local.get('userKeyIds', function (result) {
            	console.log(result.userKeyIds);
        	});
    	});
	});

	page.appendChild(button);
}

function createButton(url){
	
	// setting the passed url into storage
	let button = document.createElement('button');
	//creating unique id for each button

	button.classList.add("circle-btn");

	button.id = getUniqueId();

	// create event listener that when pressed it replaces the current page url

	button.addEventListener('click', function(){
		replaceUrl(url);
	})


	return button;
}

//swaps the current url with new url
function replaceUrl(url) {


	// fetching the current tab url
	chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs){
		//getting current tab url
		let currentUrl = tabs[0].url;
		// split in order to get the domain
		let urlArray = currentUrl.split('/');

		// replace the domain with the saved url
		currentUrl = currentUrl.replace(urlArray[2], url);

		let newTab = document.getElementById("toggle").checked;
	// Logic for taking care of if the user wants a new window or not
		if(newTab){
			window.open(currentUrl);
		} else{
			chrome.tabs.update(tabs[0].id, {url: currentUrl});
		}

	});
}

// clears every saved url in the list
// will use later for delete option
function clearListOfUrls() {
	chrome.storage.local.clear(function(){
		let error = chrome.runtime.lastError;

		if(error) {
			console.error(error);
		} else{
			console.log("Cleared List of Urls");
		}
	})

	document.getElementById('buttonDiv').innerHTML = "";
}


function getUniqueId(){
	return Math.random().toString(36);
}



// make a new url button
let trigger = document.querySelector(".trigger");

let clear = document.getElementById("clearUrlList");

let newUrl = document.getElementById("inputUrl");

// evenet listener for when we want to add a new button associated with a new url
trigger.addEventListener("click", function(){
	
	if(newUrl.value === ""){
		alert("Url field is empty. Please enter a url.");
	} else{
		addButton(newUrl.value);
	}
	
	// we then clear it so the user doesnt make multiple identical buttons
	newUrl.value = "";
});

// event listener for the clear List button
clear.addEventListener("click", function(){
	clearListOfUrls();
});


//fetches the created buttons
fetchButtons();





