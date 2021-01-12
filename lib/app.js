/* eslint-disable no-undef */
// gets and sets playerSpells from localStorage

const getSavedSpells = () => {
  const spellsJSON = localStorage.getItem('playerSpells');

  try {
    return spellsJSON ? JSON.parse(spellsJSON) : [];
  } catch (e) {
    return [];
  }
};

let playerSpells = getSavedSpells();

const filters = {
  searchText: '',
};

const saveSpells = (playerSpells) => {
  localStorage.setItem('playerSpells', JSON.stringify(playerSpells));
};

// SPELL LIST
// Promise to generate list of spell names to select from list

getSpellList = async () => {
  const response = await fetch(`https://www.dnd5eapi.co/api/spells/`);
  if (response.status === 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Unable to Fetch!');
  }
};

// render spell list based on filters

renderSpellList = async (filter) => {
  const spellArray = await getSpellList();

  const filteredSpells = spellArray.results.filter((spell) =>
    spell.name.toLowerCase().includes(filter.searchText.toLowerCase())
  );

  spellListEl.innerHTML = '';

  filteredSpells.forEach((spell) => {
    const opt = document.createElement('option');
    opt.value = spell.index;
    opt.text = spell.name;
    spellListEl.add(opt, null);
  });
  return spellListEl;
};

renderSpellList(filters);

// event to filter by name text

document.querySelector('#spell-list__filter').addEventListener('input', (e) => {
  filters.searchText = e.target.value;
  renderSpellList(filters);
});

// SPELLBOOK
// renders items in the spellbook

renderSpellBook = (playerSpells) => {
  document.querySelectorAll('.spell-level').forEach((element) => {
    element.innerHTML = '';
  });

  playerSpells.forEach((spell) => {
    document
      .querySelector(`#list_level-${spell.level}`)
      .appendChild(generateSpellbookDom(spell));
  });
};

// function to remove a spell from spellbook. Needs to be reworked with UUIDs instead of index

const removeSpell = (index) => {
  const spellIndex = playerSpells.findIndex((spell) => spell.index === index);
  if (spellIndex > -1) {
    playerSpells.splice(spellIndex, 1);
  }
};

const spellListEl = document.querySelector('#spell-list');

// generates DOM for spellbook items

generateSpellbookDom = (playerSpell) => {
  const listEl = document.createElement('li');
  const nameEl = document.createElement('span');
  const componentEl = document.createElement('span');
  const concentrationEl = document.createElement('span');
  const ritualEl = document.createElement('span');
  const removeButton = document.createElement('button');

  // set up remove buttons for spells
  removeButton.textContent = 'x';
  removeButton.classList.add('button', 'remove--button');
  listEl.appendChild(removeButton);
  removeButton.addEventListener('click', () => {
    removeSpell(playerSpell.index);
    saveSpells(playerSpells);
    renderSpellBook(playerSpells);
  });
  // set up spell names
  nameEl.textContent = playerSpell.name;
  componentEl.textContent = ` (${playerSpell.components})`;
  concentrationEl.textContent = ' ©';
  ritualEl.textContent = ' ®';
  listEl.appendChild(nameEl);

  // set up components and concentration/ritual markers
  listEl.appendChild(componentEl);
  if (playerSpell.concentration) {
    listEl.appendChild(concentrationEl);
  }
  if (playerSpell.ritual) {
    listEl.appendChild(ritualEl);
  }

  return listEl;
};

renderSpellBook(playerSpells);

// Fetches spell info based on argument
// could be used with below event to access full spell info and add to player list

const getSpell = async (spellName) => {
  const response = await fetch(`https://www.dnd5eapi.co/api/spells/${spellName}/
      `);
  if (response.status === 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Unable to Fetch!');
  }
};

// event handlers to submit chosen spell from main list to player list

document.querySelector('#add-spells').addEventListener('submit', (e) => {
  e.preventDefault();
  const chosenSpellArray = Array.from(spellListEl.selectedOptions);
  chosenSpellArray.forEach((spell) => {
    getSpell(spell.value)
      .then((data) => {
        playerSpells.push(data);
        saveSpells(playerSpells);
        renderSpellBook(playerSpells);
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  });
});

// event handler to clear all spells from playerSpells

document.querySelector('#clear-all__button').addEventListener('click', () => {
  const confirmDelete = confirm('Clear all Spells? This cannot be undone.');
  if (confirmDelete) {
    playerSpells = [];
    saveSpells(playerSpells);
    renderSpellBook(playerSpells);
  }
});

// SPELL INFO

// Will I even need this? Maybe I dunno
renderSpellInfo = () => {};

removeInfo = () => {};

generateSpellInfoDom = (spell) => {
  const blockDiv = document.querySelector('#spell-info__block');
  const blockEl = document.createElement('div');
  const nameEl = document.createElement('h4');
  const levelEl = document.createElement('span');
  const infoListEl = document.createElement('ul');
  const timeEl = document.createElement('li');
  const rangeEl = document.createElement('li');
  const componentEl = document.createElement('li');
  const durationEl = document.createElement('li');

  // Spell Info Container
  blockDiv.prepend(blockEl);
  blockEl.setAttribute('class', 'spell-info');

  // Close/Remove Button
  const removeButton = document.createElement('button');
  removeButton.textContent = 'x';
  removeButton.classList.add('button', 'remove-info__btn');
  blockEl.appendChild(removeButton);
  removeButton.addEventListener('click', (e) => {
    // needs removeInfo function, needs to target specific infobox Div
    console.log(e);
  });

  // Top of Spell Info (Name, Time, Range etc)
  nameEl.textContent = spell.name;
  let numSuffix = 'th';
  if (spell.level === 1) {
    numSuffix = 'st';
  }
  if (spell.level === 2) {
    numSuffix = 'nd';
  }
  if (spell.level === 3) {
    numSuffix = 'rd';
  }

  levelEl.textContent =
    spell.level === 0
      ? `${spell.school.name} Cantrip`
      : `${spell.level}${numSuffix}-level ${spell.school.name}`;

  timeEl.textContent = `Casting Time: ${spell.casting_time}`;
  rangeEl.textContent = `Range: ${spell.range}`;

  componentEl.textContent =
    'material' in spell
      ? `Components: ${spell.components} (${spell.material})`
      : `Components: ${spell.components}`;

  durationEl.textContent = spell.concentration
    ? `Duration: Concentration, ${spell.duration}`
    : `Duration: ${spell.duration}`;

  blockEl.appendChild(nameEl);
  blockEl.appendChild(levelEl);
  blockEl.appendChild(infoListEl);
  infoListEl.appendChild(timeEl);
  infoListEl.appendChild(rangeEl);
  infoListEl.appendChild(componentEl);
  infoListEl.appendChild(durationEl);

  // Spell Description & Higher Level Info
  spell.desc.forEach((element) => {
    const descripEl = document.createElement('p');
    descripEl.textContent = element;
    blockEl.appendChild(descripEl);
  });
  if ('higher_level' in spell) {
    const higherEl = document.createElement('p');
    higherEl.textContent = `At Higher Levels: ${spell.higher_level[0]}`;
    blockEl.appendChild(higherEl);
  }
  return blockEl;
};

document.querySelector('#spell-info__btn').addEventListener('click', (e) => {
  const chosenSpellArray = Array.from(spellListEl.selectedOptions);
  console.log(document.querySelectorAll('.spell-info'));
  chosenSpellArray.forEach((spell) => {
    getSpell(spell.value).then((data) => {
      generateSpellInfoDom(data);
    });
  });
});

// event handler to remove spell box