import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Box from './Box.js'

let vidas = 1;
let numeroPuntaje = 0 


let contadorVidas = document.querySelector('.numeroVidas_valor');
let contendorPoderes = document.querySelector('.poderes');
let contenedorPuntaje = document.querySelector('.puntaje');

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
          
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias : true
})
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
          
//const controls = new OrbitControls(camera, renderer.domElement)
            
function boxColission({ box1, box2 }){
    const xColission = box1.right >= box2.left && box1.left <= box2.right;
    const yColission = box1.bottom +box1.velocity.y <= box2.top && box1.top >= box2.bottom
    const zColission = box1.front >= box2.back && box1.back <= box2.front
        
    return xColission && yColission && zColission
}       
            const cube = new Box({
                width :  1,
                height : 1,
                depth:   1,
                colorsito : 0x00ff00,
                velocity : {
                    x : 0,
                    y : -0.07,
                    z : 0
                }
            });
            cube.castShadow = true;
            scene.add(cube)

            //The giant platform
            const ground =  new Box ({
                width:7,
                height:0.5,
                depth:50,
                colorsito : 0x0368a1,
                position :{
                    x : 0,
                    y :-2,
                    z : 0
                }
            })
            ground.receiveShadow = true;
            ground.position.y = -2
            scene.add(ground)

            //Musica
            let isMusicaActivada = true;
            const canciones = {
                cancion1: document.getElementById('musica'),
                cancion2: document.getElementById('musica2'),
            }
            const musica = canciones.cancion2          
            musica.volume = 0.3;
            musica.loop = true;

            //efectos sonoros
            const efectosSonoros = {
                salto : document.getElementById('salto'),
                choque : document.getElementById('choque'),
                acelerar : document.getElementById('acelerar'),
                perdio1 : document.getElementById('perdio1')
            }
            function ajustarVolumen(salto,acelerar,chocar){                
                efectosSonoros.salto.volume = salto;
                efectosSonoros.acelerar.volume = acelerar;
                efectosSonoros.choque.volume = chocar;
            }
            ajustarVolumen(0.23,0.4,0.3);
            function volumenEfectosNormales(opcion){
                switch (opcion) {
                    case 0: //apagar los sonidos
                        efectosSonoros.acelerar.volume = 0
                        efectosSonoros.salto.volume = 0
                        break;
                    case 1: //encender los sonidos
                        efectosSonoros.acelerar.volume = 0.5
                        efectosSonoros.salto.volume = 0.1
                        break;
                }
            }
            
            //Tiempo transcurrido
            let startTime = null;
            let minutes = 0;
            let seconds = 0;

            const timer = document.querySelector('.timer');
        
            //Interfaz grafica
            const gui = new dat.GUI();
              //Folders
                //plataforma
                const folderPlataforma = gui.addFolder('Plataforma - textura')
                folderPlataforma.add(ground.material,'wireframe')

                //Cubo usuario
                const folderUsuario = gui.addFolder('Cubo usuario - textura')
                folderUsuario.add(cube.material, 'wireframe');

                //Otras opciones
                const folderOpciones = gui.addFolder('Opciones del juego');

                 //Musica
                folderOpciones.add(musica, 'volume', 0, 1).step(0.1).name('Volumen de la música');
                folderOpciones.add({ Musica: isMusicaActivada }, 'Musica').name('Activar/Desactivar Música').onChange(function(value) {
                    isMusicaActivada = value;
                });
                

                 
            
            //Iluminacion del juego
                                                //(color light, intensity)
            const light = new THREE.DirectionalLight(0xffffff, 1)
            light.position.y = 3;
            light.position.z = 1;
            light.castShadow = true;
            scene.add(light)
            scene.add(new THREE.AmbientLight(0xffffff, 0.4))

            //Controles del jugador
            const keys = {
                a : {
                    pressed : false
                },
                d : {
                    pressed : false
                },
                w : {
                    pressed : false
                },
                s : {
                    pressed : false
                }
            }
            
            //Cuando presiono los botonsitos
            window.addEventListener('keydown',(event)=>{
                switch(event.code){
                    case 'KeyA':
                        keys.a.pressed = true;
                        //cube.velocity.x = -0.05;
                        break;
                    case 'KeyD':
                        keys.d.pressed = true;
                        //cube.velocity.x = +0.05;
                        break;
                    case 'KeyW':
                        keys.w.pressed = true;
                        break;
                    case 'KeyS':
                        keys.s.pressed = true;
                        break;
                    case 'Space':
                        cube.velocity.y= 0.12;
                        efectosSonoros.salto.play()
                        break
                    case 'KeyR':
                        location.reload();
                    
        
                }
            })
        
            //Cuando los dejo de presionar
            window.addEventListener('keyup',(event)=>{
                switch(event.code){
                    case 'KeyA':
                        keys.a.pressed = false;
                        //cube.velocity.x = -0.05;
                        break;
                    case 'KeyD':
                        keys.d.pressed = false;
                        //cube.velocity.x = +0.05;
                        break;
                    case 'KeyW':
                        keys.w.pressed = false;
                        break;
                    case 'KeyS':
                        keys.s.pressed = false;
                        break;
                }
            })
        
            camera.position.z = 5
        
            const enemies = []
            
            const bonus = [];

            let frames = 0;
            let spawnRate = 200;
        
            function animate() {                
              const animationId = requestAnimationFrame(animate)
              renderer.render(scene, camera) 

              if (isMusicaActivada) {
                musica.play();
              } else {
                musica.pause();
              }
              
              contadorVidas.textContent = vidas;
              //Tiempo transcurrido
              if (startTime === null) {
                startTime = performance.now();
              }
              const elapsedTime = Math.floor((performance.now() - startTime) / 1000);
              minutes = Math.floor(elapsedTime / 60);
              seconds = elapsedTime % 60;

              timer.innerText = `00 : 0${minutes} : ${seconds}`;
              contenedorPuntaje.textContent = puntaje()
            
              
              //movimiento
                //velocidad de rotacion del cubo
                let speedMovement = 0.05;
                let speedRotation = 0.1;

              //Velocidad inicial del cubo
                cube.velocity.x=0;
                cube.velocity.z=0;
                if(keys.a.pressed) { //izquierda
                    cube.velocity.x = -speedMovement;
                    cube.rotation.z += speedRotation;
                }  
                else if(keys.d.pressed) { //derecha
                    cube.velocity.x = speedMovement;
                    cube.rotation.z += -speedRotation;
                }
                if(keys.w.pressed){ //adelante
                    efectosSonoros.acelerar.play();
                    efectosSonoros.acelerar.volume= 0.5
                    cube.velocity.z = -speedMovement;
                    cube.rotation.x += -speedRotation;
                } 
                else if(keys.s.pressed){ //atras
                    cube.velocity.z = speedMovement;
                    cube.rotation.x += speedRotation;
                } 
                cube.rotation.x += -speedRotation;
            
              cube.update(ground);

              if(cube.position.y < -2){
                efectosSonoros.perdio1.play()
                cancelAnimationFrame(animationId);
                contadorVidas.textContent = 0
                musica.pause();
                volumenEfectosNormales(0);               
              }
                
                crearBonus(cube) 
                //contendorPoderes.innerHTML = '';
                
              enemies.forEach(enemy =>{
                enemy.update(ground)
                
                enemy.rotation.x += speedRotation;
                
                if(
                    boxColission({
                        box1: cube,
                        box2: enemy
                    }
                )){       
                    if(vidas == 1){
                        vidas--;
                        contadorVidas.textContent = vidas;
                        efectosSonoros.choque.play();
                        efectosSonoros.choque.volume = 0.2

                        cancelAnimationFrame(animationId);
                        
                        musica.pause();
                        volumenEfectosNormales(0);
                        efectosSonoros.choque.play();
                    }else{
                        vidas--;           
                        scene.remove(enemy);
                        enemy.geometry.dispose();
                        enemy.material.dispose();
                    }
                }
              })
              //Taza de reaparicion de los enemigos
              if (frames % spawnRate === 0){
                if(spawnRate >20 ) spawnRate -=20;
        
                const enemy = new Box({
                    width :  1,
                    height : 1,
                    depth:   1,
                    position:{
                        x: (Math.random() - 0.5) * 8,
                        y:0,
                        z:-20
                    },
                    velocity : {
                        x : 0,
                        y : 0,
                        z : 0.05
                    },
                    zAcceleration: true
                });
                
                //Cargando la textura del enemigo
                const loader = new THREE.TextureLoader().load('/public/assets/Zpper.PNG',(texture)=>{
                    enemy.material.map = texture;        
                });
        
                enemy.castShadow = true;
                scene.add(enemy)
                enemies.push(enemy)
              }               
              frames++;        
            }
            animate()

function crearBonus(cube){         
              //creando poderes
                bonus.forEach(power =>{
                    power.update(ground)
                    if(
                        boxColission({
                            box1:cube,
                            box2:power
                        })
                    ){            
                        scene.remove(power);
                        power.geometry.dispose();
                        power.material.dispose();
                        posiblesPremios(cube);
                    }
                })

            if (frames % 200 === 0){
                    const power = new Box(
                        {
                            width :  1,
                            height : 1,
                            depth:   1,
                            position:{
                                x: (Math.random() - 0.5) * 8,
                                y:0,
                                z:-20
                            },
                            velocity : {
                                x : 0,
                                y : 0,
                                z : 0.7
                            },
                            zAcceleration: true
                        }
                    )   
                        const loader2 = new THREE.TextureLoader().load('/public/assets/misteryBox.PNG',(texture)=>{
                        power.material.map = texture;        
                    });
                    
                    power.gravity = -0.5
                    power.castShadow = true;
                    scene.add(power)
                    bonus.push(power)

            }
            

                
}

const posiblesPremios = (cube)=>{
    let posibilidad =  Math.floor(Math.random() * 3) + 1;

    switch(posibilidad){
        case 1: //Me sumara mas vidas
            vidas++;
            mostrarPoder(1);
            contadorVidas.textContent= vidas;
            //accionVidas(2);
            break
        case 2:
            mostrarPoder(2);
            cube.position.y = cube.position.y*-1.1;
            break
        case 3:
            mostrarPoder(3);
            cube.position.x = cube.position.x*-(Math.random() * 0.8) - 0.4;
            break
    }

};
const mostrarPoder = (opcion)=>{

    let icono = document.createElement('div')
    contendorPoderes.appendChild(icono);
    
    switch(opcion){
        case 1:           
            icono.classList.add('corazoncito');
            contendorPoderes.classList.add('aparecer');
            setTimeout(function() {
                contendorPoderes.classList.remove('aparecer');
            }, 2000);
            icono.classList.add('corazoncito');
            break;
        case 2:
            
            setTimeout(function() {
                contendorPoderes.classList.remove('aparecer');
            }, 2000);
            
            break;
        case 3:
            
            setTimeout(function() {
                contendorPoderes.classList.remove('aparecer');
            }, 2000);
          
           break;
    }
}
function puntaje(){
    const tiempoTranscurrido = Math.floor((performance.now() - startTime) / 1000);
    const minutos = Math.floor(tiempoTranscurrido / 60);
    const segundosRestantes = tiempoTranscurrido % 60;
    
    
    const puntajePorMinutos = Math.floor(segundosRestantes / 59) * 100;
    const puntajePor30Segundos = Math.floor(segundosRestantes / 30) * 50;
    const puntajePor15Segundos = Math.floor(segundosRestantes / 15) * 10;
    const puntajePor10Segundos = Math.floor(segundosRestantes / 5) * 5;

    const puntajeTotal = puntajePorMinutos + puntajePor30Segundos + puntajePor15Segundos + puntajePor10Segundos;

    return puntajeTotal;
}
