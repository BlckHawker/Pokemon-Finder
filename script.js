let submitButton;
let nextButton;
let prevButtton;
let nextButton2;
let prevButtton2;
let fullPokemonList = [];
let currentOffset = 0;
let currentLimit = 20;
const buttonWidthLimit = 774;

const makePokemonTypeRequest = (type) => {
  let typeURL = "https://pokeapi.co/api/v2/type/" + type;

  return fetch(typeURL)
    .then((actualResults) => {
      const parsedResults = actualResults.json();

      return parsedResults;
    })
    .then((actualActualParsedResults) => {
      return actualActualParsedResults;
    });
};

const makePokemonRequest = (name) => {
  let typeURL = "https://pokeapi.co/api/v2/pokemon/" + name;

  return fetch(typeURL)
    .then((actualResults) => {
      const parsedResults = actualResults.json();

      return parsedResults;
    })
    .then((actualActualParsedResults) => {
      return actualActualParsedResults;
    });
};

const getPokemonPromises = (pokeNameArr) => {
  let promiseArr = [];
  for (let name of pokeNameArr) {
    promiseArr.push(makePokemonRequest(name));
  }

  return Promise.all(promiseArr);
};

const pagePokemonNameArr = (offset, limit) => {
  return fullPokemonList.slice(offset, offset + limit);
};

const getDesiredPokemonNames = (pokemonList) => {
  let pokemonNames = [];

  for (pokemonObj of pokemonList) {
    let pokemonName = pokemonObj.pokemon.name;

    if (pokemonNames.length === 0) {
      pokemonNames.push(pokemonName);
    } else {
      if (pokemonNames.indexOf(pokemonName) === -1) {
        pokemonNames.push(pokemonName);
      }
    }
  }

  pokemonNames.sort();

  return pokemonNames;
};

const getDesiredPokemonTypes = (damageRelations, filter) => {
  let types = [];

  if (filter === "Weak") {
    let weakArr = [];

    weakArr.push(damageRelations["double_damage_from"]);
    weakArr.push(damageRelations["half_damage_to"]);
    weakArr.push(damageRelations["no_damage_to"]);

    weakArr = weakArr.flat();

    weakArr = removeDuplicateTypes(weakArr);

    for (element of weakArr) {
      types.push(element.name);
    }

    return types;
  } else {
    let strongArr = [];

    strongArr.push(damageRelations["double_damage_to"]);
    strongArr.push(damageRelations["half_damage_from"]);
    strongArr.push(damageRelations["no_damage_from"]);

    strongArr = strongArr.flat();

    strongArr = removeDuplicateTypes(strongArr);

    for (element of strongArr) {
      types.push(element.name);
    }

    return types;
  }
};

const getPokemonInfo = (pokeInfo) => {
  let pokemon = {
    name: pokeInfo.name[0].toUpperCase() + pokeInfo.name.substring(1),
    image: pokeInfo["sprites"]["front_default"],
    types: [],
  };

  for (let type of pokeInfo["types"]) {
    pokemon.types.push(type.type.name);
  }

  if (!pokemon.image) {
    pokemon.image = "images/Spr_3r_000.png";
  }

  return pokemon;
};

const getPokemonInfoArr = (result) => {
  let pokemonDataArr = [];

  for (let pokemonData of result) {
    pokemonDataArr.push(getPokemonInfo(pokemonData));
  }

  return pokemonDataArr;
};

window.onload = () => {
  submitButton = document.getElementById("submitButton");

  submitButton.onclick = clickSubmitButton;

  nextButton = document.getElementById("nextButt");

  nextButton.onclick = clickNextButton;

  nextButton.style.visibility = "hidden";

  nextButton2 = document.getElementById("nextButt2");

  nextButton2.onclick = clickNextButton;

  nextButton2.style.visibility = "hidden";

  prevButtton = document.getElementById("previousButt");

  prevButtton.onclick = clickPrevButton;

  prevButtton.style.visibility = "hidden";

  prevButtton2 = document.getElementById("previousButt2");

  prevButtton2.onclick = clickPrevButton;

  prevButtton2.style.visibility = "hidden";
};

window.onresize = () => {
  prevButtton2.style.visibility = displayPrevButton2() ? "visible" : "hidden";
  nextButton2.style.visibility = displayNextButton2() ? "visible" : "hidden";
};

const clickSubmitButton = (e) => {
  // showLoadingGif();
  currentOffset = 0;

  enableButtons(false);
  prevButtton.style.visibility = "hidden";
  prevButtton2.style.visibility = "hidden";

  let type = document.getElementById("typeDropDown").value;

  let filter = document.getElementById("filterDropDown").value;

  const requestTypePromise = makePokemonTypeRequest(type);

  let types;

  if (filter === "Exact") {
    types = Promise.resolve([`${type}`]);
  } else {
    types = requestTypePromise.then((result) => {
      return getDesiredPokemonTypes(result["damage_relations"], filter);
    });
  }

  types
    .then((typeArr) => {
      let requestPokemonTypePromiseArr = [];

      for (let i = 0; i < typeArr.length; i++) {
        requestPokemonTypePromiseArr.push(makePokemonTypeRequest(typeArr[i]));
      }

      return Promise.all(requestPokemonTypePromiseArr);
    })
    .then((resultArr) => {
      let pokemonList = resultArr
        .map((type) => {
          return type["pokemon"];
        })
        .flat();

      fullPokemonList = getDesiredPokemonNames(pokemonList);
      let currentDisplayedPokemonNameArr = pagePokemonNameArr(
        currentOffset,
        currentLimit
      );

      return getPokemonPromises(currentDisplayedPokemonNameArr);
    })
    .then((result) => {
      enableButtons(true);
      nextButton.style.visibility = displayNextButton() ? "visible" : "hidden";
      nextButton2.style.visibility = displayNextButton2()
        ? "visible"
        : "hidden";
      let pokemonDataArr = getPokemonInfoArr(result);

      updateGrid(pokemonDataArr);
    });
};

const clickNextButton = (e) => {
  // showLoadingGif();

  enableButtons(false);
  let tempOffset = currentOffset + currentLimit;

  let pokemonNames = pagePokemonNameArr(tempOffset, currentLimit);

  getPokemonPromises(pokemonNames).then((result) => {
    enableButtons(true);
    let pokemonDataArr = getPokemonInfoArr(result);
    updateGrid(pokemonDataArr);

    currentOffset += currentLimit;

    nextButton.style.visibility = displayNextButton() ? "visible" : "hidden";
    nextButton2.style.visibility = displayNextButton2() ? "visible" : "hidden";

    prevButtton.style.visibility = "visible";
    prevButtton2.style.visibility = displayPrevButton2() ? "visible" : "hidden";
  });
};

const clickPrevButton = (e) => {
  // showLoadingGif();

  enableButtons(false);

  let tempOffset = currentOffset - currentLimit;

  let pokemonNames = pagePokemonNameArr(tempOffset, currentLimit);

  getPokemonPromises(pokemonNames).then((result) => {
    enableButtons(true);
    let pokemonDataArr = getPokemonInfoArr(result);
    updateGrid(pokemonDataArr);

    currentOffset -= currentLimit;

    prevButtton.style.visibility = displayPrevButton() ? "visible" : "hidden";
    prevButtton2.style.visibility = displayPrevButton2() ? "visible" : "hidden";
    nextButton.style.visibility = "visible";
    nextButton2.style.visibility = displayNextButton2() ? "visible" : "hidden";
  });
};

const updateGrid = (pokemonList) => {
  let gridSegments = document.getElementById("grid").querySelectorAll(".poke");

  for (let i = 0; i < pokemonList.length; i++) {
    let gridSegment = gridSegments[i];
    let pokemon = pokemonList[i];

    let nameElement = gridSegment.querySelector(".name");

    nameElement.innerHTML = pokemon.name;

    let imageDiv = gridSegment.querySelector(".image");
    imageDiv.src = pokemon.image;

    let firstType = gridSegment.querySelector(".type1");

    firstType.src = `./images/${pokemon.types[0]}.webp`;

    let secondType = gridSegment.querySelector(".type2");

    if (pokemon.types.length == 2) {
      secondType.src = `./images/${pokemon.types[1]}.webp`;
    } else {
      secondType.src = "";
    }
  }

  let emptySpaces = gridSegments.length - pokemonList.length;

  if (emptySpaces !== 0) {
    for (
      let i = gridSegments.length - emptySpaces;
      i < gridSegments.length;
      i++
    ) {
      gridSegments[i].querySelector(".name").innerHTML = "";
      gridSegments[i].querySelector(".image").src = "";

      gridSegments[i].querySelector(".type1").src = "";
      gridSegments[i].querySelector(".type2").src = "";
    }
  }
};

const showLoadingGif = () => {
  let gridSegments = document.getElementById("grid").querySelectorAll(".poke");


  for (let i = 0; i < gridSegments.length; i++) {
    let gridSegment = gridSegments[i];

    let imageEl = gridSegment.childNodes[3].childNodes[0]

    imageEl.src = "./images/load.gif";
    debugger;

  }
};

const removeDuplicateTypes = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    for (let j = i - 1; j > -1; j--) {
      if (i === arr.length) {
        continue;
      }

      if (arr[i].name === arr[j].name) {
        arr.splice(j, 1);
      }
    }
  }

  return arr;
};

const displayNextButton = () => {
  return currentOffset + currentLimit < fullPokemonList.length - 1;
};

const displayNextButton2 = () => {
  return (
    currentOffset + currentLimit < fullPokemonList.length - 1 &&
    window.innerWidth <= buttonWidthLimit
  );
};

const displayPrevButton = () => {
  return currentOffset !== 0;
};

const displayPrevButton2 = () => {
  return currentOffset !== 0 && window.innerWidth <= buttonWidthLimit;
};

const enableButtons = (bool) => {
  submitButton.disabled = !bool;
  nextButton.disabled = !bool;
  prevButtton.disabled = !bool;
  nextButton2.disabled = !bool;
  prevButtton2.disabled = !bool;
};
