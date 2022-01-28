

function search(){
	let search = document.getElementById("search").value;
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			let friends = JSON.parse(this.responseText);
			console.log(friends);
			let results = document.getElementById("results");
			results.innerHTML = "";
			friends.forEach(function(user){
				let div = document.createElement("div");
				let br = document.createElement("br");
				let text = document.createTextNode("- "+user.username);
				let input = document.createElement("input");
				input.type = "submit";
				input.value = "Add Friend";
				input.addEventListener("click", function(){
				  addFriend(user._id);
				});
				input.id = user._id;
				div.appendChild(text);
				div.appendChild(input);
				results.appendChild(div);
				results.appendChild(br);
			});
		}
	}
	req.open("GET", "/friends?name="+search);
	req.send();
}

function addFriend(id){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			
			
		}
	}
	req.open("POST", "/friends");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(id));
}