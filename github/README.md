# GitHub automation

El script [github.js](github.js) busca automatizar las tareas iniciales de GitHub en Prácticas Profesionalizantes.

##### Tareas

Este script automatiza tareas como:

* Crear Teams en la organizacion IMPATRQ de GitHub a partir de los que se hayan armado en las reuniones al inicio del ciclo lectivo
* Crear un repositorio por proyecto propuesto
* Agregar usuarios de GitHub a el Team de la organización que les corresponda
* Agregar el Team correspondiente al repositorio del proyecto con permisos de escritura

El script está pensado para trabajar con un SpreadSheet de Google en App Scripts. Las funciones se pueden disparar a mano de acuerdo a la tarea que sea necesaria o se puede correr una función como la siguiente:

```javascript
const debug = () => {
  createTeams();      // Crea los equipos
  createRepos();      // Crea los repositorios
  addUserToTeam();    // Agrega cada usuario a su equipo
  addTeamToRepo();    // Agrega cada equipo a su repositorio
}
```

##### Token

Para que funcionen las requests a la API de GitHub, hay que crear un token y asignarlo a la variable `token`. Este token de acceso personal debe tener permisos de:

* repo
* admin:org