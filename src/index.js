//As stipulated in deliverables item 2, you can either 
//    1. Use the character information from your first request
//    2. Make a new request to the endpoint.
//I chose option 1, to cache the data after a single fetch call in order to save on load time. 
document.addEventListener("DOMContentLoaded", () => {
  //Fetch configuration details
  const baseUrl = "http://localhost:3000";
  const mainRoute = "/characters";

  //Function used to render each character's name in the character bar of the website.
  function renderCharacterInBar(character){

    //Create a span with the character name as its contents.
    const characterName = document.createElement("span");
    characterName.textContent = character.name;
    characterName.id = character.name;


    //Add the character to the DOM
    const characterBar = document.querySelector("#character-bar");
    characterBar.appendChild(characterName);
  }


  //Function that renders the body of the website. It renders each character's name and image the in-body.
  function renderCharacterInfo(character){
    const name = document.querySelector("p#name");
    name.textContent = character.name;

    const image = document.querySelector("#image");
    image.src = character.image;
    image.alt = character.name;

    const votes = document.querySelector("#vote-count");
    votes.textContent = character.votes;
  }



  //Function to add event listeners to the spans containing character names in the bar.
  function addCharacterBarListerners(characterName, charactersArray) {
    characterName.addEventListener("click", (event) => clickLogic(characterName.textContent, charactersArray));
  
    function clickLogic(name, charactersArray) {

      for (let index = 0; index < charactersArray.length; ++index) {
        if (charactersArray[index].name === name) {
          renderCharacterInfo(charactersArray[index]);
          break;
        }
      }
    }
  }


  //Function to update total votes for a character. Rejects input that is not a non-negative integer.
  function updateTotalVotes(charactersArray, newVotes){
    try{
      const isInvalidVotes = isNaN(newVotes) || newVotes === "" || Number(newVotes) < 0 || !Number.isInteger(Number(newVotes));

      if (isInvalidVotes) throw ("Input for additional votes must be a non-negative integer");

      const name = document.querySelector("p#name");
      const votes = document.querySelector("#vote-count");
      
      let index = 0
      for ( ; index < charactersArray.length; ++index) {
        if (charactersArray[index].name === name.textContent) {
          newVotes = parseInt(newVotes, 10);
          newVotes += parseInt(charactersArray[index].votes, 10);
          votes.textContent = `${newVotes}`;
          charactersArray[index].votes = `${newVotes}`;
          break;
        }
      }

      const url = baseUrl + mainRoute + `/${index + 1}`;
      fetch(url, {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({"votes": charactersArray[index].votes})})
      .then(response => response.json())
      .then(data => console.log(data));

    } catch(error){
        alert(error);
    }
  }

  
  //Function that resets the vote count of the currently rendered character.
  function resetTotalVotes(charactersArray, newVotes){
    const name = document.querySelector("p#name");
    const votes = document.querySelector("#vote-count");

    let index = 0;
    for ( ; index < charactersArray.length; ++index) {
        if (charactersArray[index].name === name.textContent) {
          charactersArray[index].votes = newVotes;
          votes.textContent = newVotes;
          break;
        }
    }

    const url = baseUrl + mainRoute + `/${index + 1}`;
    fetch(url, {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({"votes": charactersArray[index].votes})})
    .then(response => response.json())
    .then(data => console.log(data));
  }


  //Function that defines a template for a new character and POSTS it to the database.
  function createNewCharacter(charactersArray){
    const nameInput = document.querySelector("input#name");
    const imageInput = document.querySelector("input#image-url");
    const newId = charactersArray.length + 1;
    newCharacter = {id: newId ,name: nameInput.value, image: imageInput.value, votes: "0"};
    charactersArray.push(newCharacter);

    const url = baseUrl + mainRoute;
    fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(newCharacter)})
    .then(response => response.json())
    .then(data => console.log(data));

    return newCharacter;
  }

  
  //Function that renders the new character immediately after they are created.
  function renderNewCharacter(charactersArray, newEntry){
    renderCharacterInBar(newEntry);
    renderCharacterInfo(newEntry);

    const characterBar = document.querySelector("#character-bar");
    addCharacterBarListerners(characterBar.lastChild, charactersArray);

  }


  //The solution to the problem begins here.
  const url = baseUrl + mainRoute;

  fetch(url).then((result) => result.json()).then((data) => {

    //Cache the fetched data.
    const charactersArray = Array.from(data);
  
    //Render the top part of the homepage (character-bar)
    charactersArray.forEach((character) => renderCharacterInBar(character));

    //Render the characterInfo part of the home page using the first record (Mr. Cute).
    renderCharacterInfo(charactersArray[0]);

    return charactersArray;

  }).then((charactersArray) => {

    //Render the page based on the character name clicked on the character bar.
    const characterBar = document.querySelector("#character-bar");
    const characterBarArray = Array.from(characterBar.childNodes);
    characterBarArray.slice(3).forEach((characterName) => addCharacterBarListerners(characterName, charactersArray));

    //Update the votes from the input given in the form.
    const form = document.querySelector("#votes-form");
    form.addEventListener("submit", (event) => { 
      event.preventDefault(); 
      updateTotalVotes(charactersArray, event.target.childNodes[1].value); 
      const votesInput = document.querySelector("#votes");
      votesInput.value = "";
      
    });

    //Reset votes on button click
    const button = document.querySelector("#reset-btn");
    button.addEventListener("click", (event) => resetTotalVotes(charactersArray, "0"));

    //Create a new character
    const newCharacterForm = document.querySelector("#character-form");
    newCharacterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderNewCharacter(charactersArray, createNewCharacter(charactersArray));

    })

  })
    
})