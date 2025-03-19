// Token de GitHub
const token = 'TOKEN';
// Spreadsheet para leer
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
// Organizacion
const org = "impatrq";

// Opciones para request de la API
const options = {
  method: "",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json"
  },
  payload: "",
  muteHttpExceptions: true
};

/**
 * @brief Busca los equipos disponibles
 * @return array de strings con los equipos
 */
function getTeams() {
  // Rango de celdas donde estan los nombres de los grupos
  const idRange = 'R2:R60';
  // Nombre de la hoja donde estan los datos
  const sheetName = 'equipos_inscripcion';
  // Saca los nombres de los teams desde la hoja
  const teams = [];
  spreadsheet.getSheetByName(sheetName)
  .getRange(idRange).getValues()
  .forEach(col => {
    const team = col[0];
    if(!teams.includes(team) && team !== '') { teams.push(team); }
  });

  return teams;
}

/**
 * @brief Crea los equipos en GitHub en la organizacion
 */
function createTeams() {
  // URL para la API de GitHub
  const url = 'https://api.github.com/orgs/${org}/teams';
  // Consigue los nombres de los equipos del spreadsheet
  const teams = getTeams();

  // Hace un llamado a la API por cada equipo
  for(let team of teams) {
    // Actualizo options para API
    options.method = "post";
    options.payload = JSON.stringify({ 
      name: team, 
      privacy: "closed" 
    });

    const response = UrlFetchApp.fetch(url, options);
  }
}

/**
 * @brief Crea los repositorios para cada grupo
 */
function createRepos() {
  // URL para crear un repo
  const url = 'https://api.github.com/orgs/${org}/repos';
  // Busco el nombre de los equipos
  const repoNames = getTeams().map(team => {
    const foo = team.split('_');
    return foo[foo.length - 1];
  });

  repoNames.forEach(repo => {

    // Actualizo options para API
    options.method = "post";
    options.payload = JSON.stringify({
      name: repo,
      private: false,
      auto_init: true, // Crea un README automáticamente
    });

    const response = UrlFetchApp.fetch(url, options);
  });
}

/**
 * @brief Agrega usuarios de GitHub a su equipo de organizacion
 */
function addUserToTeam() {
  // Rango de celdas donde estan los nombres de los grupos y el usuario de GitHub
  const idRange = 'F2:H60';
  // Nombre de la hoja donde estan los datos
  const sheetName = 'equipos_integrantes';
  // Actualizo opciones para API
  options.method = "put";
  options.payload = JSON.stringify({ role: "member" });

  // Obtengo el par usuario, equipo
  const foo = spreadsheet.getSheetByName(sheetName).getRange(idRange).getValues();
  const data = foo.map(obj => {return {"username": obj[0], "team": obj[2]}})
  .filter(obj => {
    if(obj.username !== '') { return true; }
    else { return false; }
  });

  // Hago una solicitud a la API por cada usuario
  data.forEach(obj => {
    // URL para usar
    const url = `https://api.github.com/orgs/${org}/teams/${obj.team}/memberships/${obj.username}`;
    const response = UrlFetchApp.fetch(url, options);
  });
}

/**
 * @brief Agrega un equipo al repo con permisos de escritura
 */
function addTeamToRepo() {
  // Opciones para API
  options.method = "put";
  options.payload = JSON.stringify({
    permission: "push"
  });
  // Busco equipos
  getTeams().forEach(team => {
    // Obtengo el nombre
    const foo = team.split("_");
    const repo = foo[foo.length - 1];
    // URL para API
    const url = `https://api.github.com/orgs/${org}/teams/${team}/repos/${org}/${repo}`;
    // Consulta a la API
    const response = UrlFetchApp.fetch(url, options);
  });
}
