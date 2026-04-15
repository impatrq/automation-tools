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
    try {
      await page.waitForSelector('#avisoModal .modal-content', { visible: true, timeout: 15000 }); 
      await page.click('#avisoModal .modal-content button');
    } catch (error) {
      console.log('No se encontró el modal de bienvenida o ya fue cerrado.');
    }


    // Clickeo el menu de planes
    await page.evaluate(() => {
      const a = [...document.querySelectorAll('a')].find(a => a.innerText.endsWith('Planes 2026'));
      if (a) { a.click(); }
    });

    await delay(500);

    try {
      await page.waitForSelector('#avisoPlanesRechazadosModal .modal-content', { visible: true, timeout: 15000 }); 
      await page.click('#avisoPlanesRechazadosModal .modal-content button');
    } catch (error) {
      console.log('No se encontró el modal de planes rechazados o ya fue cerrado.');
    }

    // Levantar datos del plan
    const newton = require('./practicas.json').newton;
    await delay(500);

    const cantidad_de_grupos = 3;
    for(let i = 0; i < cantidad_de_grupos; i++) {

      // Nuevo plan
      await page.waitForSelector('#btnNuevoPlan', { visible: true, timeout: 5000 });
      await page.click('#btnNuevoPlan');

      // // Cargar datos del plan
      await delay(500);
      await page.select('#tipoPractica', newton.tipo.toString());
      await page.select('#tecnicaturaPractica', newton.tecnicatura.toString());
      await page.select('#institucionOferentePractica', newton.institucion_oferente.toString());
      await delay(250);
      await page.select('#lugarDePracticaPractica', newton.lugar.toString());
      await page.$eval('#horasPractica', (el, val) => el.value = val, newton.horas.toString());
      // await page.keyboard.press('Backspace');
      // await page.type('#horasPractica', newton.horas.toString());
      await page.click('#btnPlanSubmit');

      // Nuevo grupo
      await page.waitForSelector('#btnNuevoGrupo', { visible: true, timeout: 5000 });
      // await page.click("");
      await delay(2000);
      await page.click('.enjoyhint_close_btn');
      await delay(500);
      const buttons = await page.$$('#gruposBodyModal button');
      await buttons[1].click();

      await delay(2000);

      // Propuesta pedagógica
      await page.$eval('#tblMisPlanes tbody tr:first-child button', el => el.click());
      await page.waitForSelector('li a[title="Plan: Propuesta Pedagógica"]', { visible: true });
      await page.$eval('li a[title="Plan: Propuesta Pedagógica"]', el => el.click());
      await delay(500);
      await page.$eval('#tituloProyecto', (el, titulo) => el.value = titulo, newton.propuesta_pedagogica.titulo);
      await page.$eval('#inicioProyecto', (el, fecha) => el.value = fecha, newton.horarios[0].grupos[i].fecha_inicio);
      await page.$eval('#finProyecto', (el, fecha) => el.value = fecha, newton.horarios[0].grupos[i].fecha_fin);
      await page.$eval('#objetivosGenerales', (el, objs) => el.value = objs, newton.propuesta_pedagogica.objetivos_generales);
      await page.$eval('#objetivosEspecificos', (el, objs) => el.value = objs, newton.propuesta_pedagogica.objetivos_especificos);
      await page.$eval('#fundamentacionPedagogica', (el, objs) => el.value = objs, newton.propuesta_pedagogica.fundamentacion_pedagogica);
      await page.$eval('#actividadesGenerales', (el, objs) => el.value = objs, newton.propuesta_pedagogica.actividades_generales);
      await page.$eval('#evaluacion', (el, objs) => el.value = objs, newton.propuesta_pedagogica.evaluacion);
      await page.$eval('#btnSubmitPropuestaPedagogica', el => el.click());

      await delay(2000);

      const grupos_por_plan = 2;
      for(let j = 0; j < grupos_por_plan; j++) {
        // Cargar grupos
        await page.$eval('#tblMisPlanes tbody tr:first-child button', el => el.click());
        await page.waitForSelector('li a[title="Plan: Grupos"]', { visible: true });
        await page.$eval('li a[title="Plan: Grupos"]', el => el.click());
        await delay(500);
        await page.$eval('#btnNuevoGrupo', el => el.click());
        await delay(500);
        await page.select('#nombreGrupo', newton.horarios[j].grupo_id);
        await page.select('#docenteGrupo', newton.docente.toString());
        await page.select(newton.horarios[j].dia_desde, newton.horarios[j].hora_desde);
        await page.select(newton.horarios[j].dia_hasta, newton.horarios[j].hora_hasta);
        await page.$eval('#btnNuevoGrupoSubmit', el => el.click());

        await delay(2000);

        // Cargar actividades del grupo
        await page.$eval('#tblMisPlanes tbody tr:first-child button', el => el.click());
        await page.waitForSelector('li a[title="Plan: Grupos"]', { visible: true });
        await page.$eval('li a[title="Plan: Grupos"]', el => el.click());
        await page.waitForSelector('button[title="Grupo: Gestionar Actividades"]', { visible: true });
        await page.$eval('button[title="Grupo: Gestionar Actividades"]', el => el.click());
        await delay(500);
        await page.$eval('#actividadesProyecto', (el, val) => el.value = val, newton.propuesta_pedagogica.actividades_generales);
        await page.$eval('#btnSubmitActividades', el => el.click());

        await delay(2000);
        await page.$eval('#gruposBodyModal .btn-warning', el => el.click());

        // // Cargar alumnos del grupo
        // await page.$eval('#tblMisPlanes tbody tr:first-child button', el => el.click());
        // await page.waitForSelector('li a[title="Plan: Grupos"]', { visible: true });
        // await page.$eval('li a[title="Plan: Grupos"]', el => el.click());
        // await page.waitForSelector('button[title="Grupo: Gestionar Estudiantes"]', { visible: true });
        // await page.$eval('button[title="Grupo: Gestionar Estudiantes"]', el => el.click());

        // for(const dni of newton.horarios[j].grupos[i].alumnos) {

        //   await page.evaluate(() => { $('#alumnoGrupoSelect').select2('open'); });
        //   await page.waitForSelector('input[class="select2-search__field"]', { visible: true });
        //   await page.$eval('input[class="select2-search__field"]', (el, dni) => el.value = dni, dni);
        //   await delay(500);
        //   await page.$eval('#select2-alumnoGrupoSelect-results li', el => el.click());
        //   await page.$eval('#btnAddAlumnoGrupo', el => el.click());
        // }
      }
      await delay(2000);
    }
})();