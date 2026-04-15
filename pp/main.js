const puppeteer = require('puppeteer');
const fs = require('fs');
const relevamientoCompleto = require('./relevamiento.json');
const relevamiento = relevamientoCompleto.filter(alumno => !alumno.cargado);
// const relevamiento = relevamientoFiltrado.slice(0, 5);

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

const dateFormat = (date) => {
  const foo = date.split('/');
  return `${foo[2]}/${foo[1]}/${foo[0]}`;
}

(async () => {

    const browser = await puppeteer.launch({ 
      headless: false,
      args: [
        '--disable-features=HttpsFirstBalancedModeAutoEnable'
      ],
      defaultViewport: {
        width: 1512,
        height: 982,
      }
    }); // Abre el navegador en modo no headless para ver la interacción

    const page = await browser.newPage();

    // Escuchar el evento de alerta
    page.on('dialog', async dialog => {
      await dialog.accept(); // Cerrar la alerta
    });

    await page.goto('http://ree.copret.abc.gob.ar/admin/login.php');
    // Completar los campos de usuario y contraseña
    await page.type('#user', 'eet.trq@gmail.com');
    await page.type('#pass', 'jotape');
    
    // Hacer clic en el botón de iniciar sesión
    await page.click('#btnInciarSesion');
    
    // Espero que aparezca el modal de bienvenida y clickeo el boton
    await page.waitForSelector('#avisoModal .modal-content', { visible: true, timeout: 15000 });
    await page.click('#avisoModal .modal-content button');

    // Clickeo el menu de estudiantes
    await page.evaluate(() => {
      const a = [...document.querySelectorAll('a')].find(a => a.innerText.endsWith('Estudiantes'));
      if (a) {
          a.click();
      }
    });

    await delay(500);

    for(const alumno of relevamiento) {

      console.log(alumno);

      // Cargo DNI (no estaba funcionando con page.type y page.click)
      await page.evaluate((al) => {
        const input = document.querySelector("#documentoAlumnoAlta");
        if(input) {
          input.value = al.dni;
          document.querySelector("#btnBuscarAlumno").click();
        }
      }, alumno);

      await page.waitForSelector('#datosAlumnoAlta', { visible: true, timeout: 2000 });

      // Completo con los datos
      await page.type('#nombreAlumnoAlta', alumno.nombre);
      await page.type('#apellidoAlumnoAlta', alumno.apellido);
      await page.select('#generoAlumnoAlta', (alumno.genero == 'Femenino')? '1' : '2');
      await page.type('#nacimientoAlumnoAlta', dateFormat(alumno.nacimiento));
      await page.type('#emailAlumnoAlta', alumno.email);

      console.log(alumno.nacimiento);

      // Mando el alumno
      await page.click('#btnSubmitAltaAlumno');
      console.log('Cargado!');

      relevamientoCompleto.find(al => {
        if(al.dni == alumno.dni) {
          al.cargado = true;
        }
      });

      await delay(2000);
    };

    fs.writeFileSync('./relevamiento.json', JSON.stringify(relevamientoCompleto, null, 2), 'utf-8');

})();