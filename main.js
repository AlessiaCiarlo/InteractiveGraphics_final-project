onload = main;

// Inizializzazione delle costanti
//const STEP = 1;  //step fisso per l'animazione (modificato poi in variabile)
const VIEW_TRANSLATION_FACTOR = 50;  //fattore di traslazione

/////// Inizializzazione delle variabili ///////
var step = 0.0; //step utile nel ciclo di animazione
var step_velocity = 1; //step utile per modificare la velocità

var MV, MVP, P, V; //matrici

var translation = [0, 0, 0]; //x y z
var rotation = [0, 0, 0]; //attorno agli assi x y z 

var lightDirection = vec4(-3.17, 0.0, -1.0, 0.0);
var lightEmission = vec4(1.0, 1.0, 1.0, 1.0);
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var shininess = 200.0;

// valori iniziali per le componenti diffuse e speculari della luce
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(0.5, 0.5, 0.5, 1.0);
var Kd = vec4(1.0, 1.0, 1.0, 1.0); //coefficiente luce diffusa
var Ks = vec4(1.0, 1.0, 1.0, 1.0); //coefficiente luce speculare

// valori iniziali 
var emissionValue = 1.0;
var specularValue = 1.0;
var diffuseValue = 1.0;
var ambient = 1.0;

//TODO aggiungi background o texture


/////// creazione delle classi ///////
// classe oggetto con i campi necessari per salvare 
// tutte le informazioni contenute nel file obj
class Object {
	constructor(fileName) {
		this.fileName = fileName;
	}
	fileName;
	objDoc;
	drawingInfo;
	vertexBuffer;
	normalBuffer;
	colorBuffer;
	indexBuffer;
}
// classe animazione con i campi necessari per salvare 
// tutti gli oggetti che compongono la stessa animazione
class Animation {
	constructor(fileNames) {
		this.fileNames = fileNames;
		this.isLoaded = false;
		this.objects = [];
		this.keyframe1Index = 0;
		this.keyframe2Index = 1;
	}
	fileNames;
	isLoaded;
	objects;
	keyframe1Index;
	keyframe2Index;
}
//////////////////////////////////////////////////

/// Funzioni per compilare ed inizializzare lo shader ///
function CompileShader( type, source, wgl=gl ) {
	const shader = wgl.createShader(type);
	wgl.shaderSource(shader, source);
	wgl.compileShader(shader);
	if (!wgl.getShaderParameter( shader, wgl.COMPILE_STATUS) ) {
		alert('An error occurred compiling shader:\n' + wgl.getShaderInfoLog(shader));
		wgl.deleteShader(shader);
		return null;
	}
	return shader;
}
function initShaderProgram( gl, vsSource, fsSource ) {
    var vertShdr = CompileShader(gl.VERTEX_SHADER, vsSource, gl);
    var fragShdr = CompileShader(gl.FRAGMENT_SHADER, fsSource, gl);

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}
/////////////////////////////////////////////////////


// FUNZIONE PRINCIPALE //
function main() {

	// Initializzazione di canvas e del GL context
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");	
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	// Iniziaizzazione dello shader program
	let program = initShaderProgram(gl, meshVS, meshFS);
	gl.useProgram(program);
	gl.vBuffer = null;
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);


	// Inizializzazione cursore per la velocità
	webglLessonsUI.setupSlider("#velocity", {value: step_velocity, slide: updateStep(), min: 0, max: 2, step: 0.1});

	// Inizializzazione dei cursori per la posizione dell'oggetto nello spazio
	webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), min: -gl.canvas.width, max: gl.canvas.width });
	webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), min: -gl.canvas.height, max: gl.canvas.height });
	webglLessonsUI.setupSlider("#z", {value: translation[2], slide: updatePosition(2), min: -300, max: 50 });
	
	// Inizializzazione dei cursori per l'orientamento della visuale sull'oggetto
	webglLessonsUI.setupSlider("#angleX", {value: rotation[0], slide: updateRotation(0), max: 360 });
	webglLessonsUI.setupSlider("#angleY", {value: rotation[1], slide: updateRotation(1), max: 360 });
	webglLessonsUI.setupSlider("#angleZ", {value: rotation[2], slide: updateRotation(2), max: 360 });
	
	// Inizializzazione dei cursori per la direzione della luce artificiale
	webglLessonsUI.setupSlider("#Light_direction_x", {value: lightDirection[0], slide: updateLightDirection(0), min: -20, max: 20, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#Light_direction_y", {value: lightDirection[1], slide: updateLightDirection(1), min: -20, max: 20, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#Light_direction_z", {value: lightDirection[2], slide: updateLightDirection(2), min: -20, max: 20, step: 0.01, precision: 2 });
	
	// Inizializzazione dei cursori per modificare i vari tipi di luce
	// componente diffusa, componente speculare, brillantezza e luce ambientale 
	webglLessonsUI.setupSlider("#diffuseValue", {value: diffuseValue, slide: updateDiffuseValue(), min: 0, max: 5, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#specularValue", {value: specularValue, slide: updateSpecularValue(), min: 0, max: 5, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#shininess", {value: shininess, slide: updateShininess(), min: 0, max: 300, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#ambient", {value: ambient, slide: updateAmbient(), min: 0, max: 5, step: 0.01, precision: 2 });
	
	// Inizializzazione dei cursori per modificare l'emissione ed il colore della luce artificiale
	webglLessonsUI.setupSlider("#emissionValue", {value: emissionValue, slide: updateEmissionValue(), min: 0, max: 5, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#emissionR", {value: lightEmission[0], slide: updateLightEmission(0), min: 0, max: 1, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#emissionG", {value: lightEmission[1], slide: updateLightEmission(1), min: 0, max: 1, step: 0.01, precision: 2 });
	webglLessonsUI.setupSlider("#emissionB", {value: lightEmission[2], slide: updateLightEmission(2), min: 0, max: 1, step: 0.01, precision: 2 });


	// Creazione delle variabili e funzioni necessarie per poter utilizzare pulsanti e Sliders 

	// SLIDER per aggiornare la velocità
	function updateStep() {
		return function (event, ui) {
			step_velocity = ui.value;
		};
	}
	// SLIDER per aggiornare i valori nell'array translation (posizione oggetto nello spazio)
	function updatePosition(index) {
		return function (event, ui) {
			translation[index] = ui.value / VIEW_TRANSLATION_FACTOR;
		};
	}
	// SLIDER per aggiornare i valori nell'array rotation (rotazione della visuale)
	function updateRotation(index) {
		return function (event, ui) {
			rotation[index] = ui.value;
		};
	}
	// SLIDER per aggiornare i valori nell'array lightDirection (direzione della luce)
	function updateLightDirection(index) {
		return function (event, ui) {
			lightDirection[index] = ui.value;
		};
	}
	// SLIDER per aggiornare i valori nell'array lightEmission (regola i canali RBG della luce)
	function updateLightEmission(index) {
		return function (event, ui) {
			lightEmission[index] = ui.value;
		};
	}
	// SLIDER per aggiornare il valore emissionValue (emissione della luce)
	function updateEmissionValue() {
		return function (event, ui) {
			emissionValue = ui.value;
		};
	}
	// SLIDER per aggiornare il valore specularValue (componente speculare della luce)
	function updateSpecularValue() {
		return function (event, ui) {
			specularValue = ui.value;
		};
	}
	// SLIDER per aggiornare il valore diffuseValue (componente diffusa della luce)
	function updateDiffuseValue() {
		return function (event, ui) {
			diffuseValue = ui.value;
		};
	}
	// SLIDER per aggiornare il valore ambient (intensità della luce abientale)
	function updateAmbient() {
		return function (event, ui) {
			ambient = ui.value;
		};
	}
	// SLIDER per aggiornare i valori nell'array shininess 
	// (livello di riflessione luminosa da parte dell'oggetto: 
	//  - alta = oggetto può sembrare di vetro o metallo
	//  - bassa = oggetto con superficie opaca)
	function updateShininess() {
		return function (event, ui) {
			shininess = ui.value;
		};
	}
	// bottone animazione 1 Start
	let AnimationButton1 = document.getElementById("Start Animation 1");
	AnimationButton1.addEventListener("click", () => {
		then = 0;
		chosenAnimation = animations[0];
		start();
	})
	// bottone animazione 2 Start
	let AnimationButton2 = document.getElementById("Start Animation 2");
	AnimationButton2.addEventListener("click", () => {
		then = 0;
		chosenAnimation = animations[1];
		start();
	})


  //----------------------------------------------------------
	// Funzione per leggere i file obj
	function readObjFile(object, scale, reverse) {
		//creo oggetto XMLHttpRequest per inviare una richiesta HTTP
		let request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			//controllo se il valore readystate di request è 4 (richiesta è DONE)
			//se il valore status di request non è 404 allora il file esiste
			if (request.readyState === 4 && request.status !== 404) {
				//creo l'oggetto objDoc dalla libreria OBJParser che conterrà info sull'oggetto 3D
				let objDoc = new OBJDoc(object.fileName); 
				//analizzo il testo contenuto nel file obj con il parser della libreria
				let text = objDoc.parse(request.responseText, scale, reverse);
				if (!text) {
					object.objDoc = null; 
					object.drawingInfo = null;
					console.log("OBJ error " + object.fileName);
					return;
				}
				//se il testo esiste, popolo il campo objDoc con l'oggetto objDoc creato
				object.objDoc = objDoc;
			}
		}
		//apro la richiesta per recuperare il file
		request.open("GET", object.fileName, true);
		request.send(); //invio la richiesta HTTP
	}

	//Funzione per scorrere i keyframe (obj) dell'animazione 
	//e caricarli utilizzando la funzione loadObjInfo
	function loadObjects() {
		for (let i = 0; i < chosenAnimation.objects.length; i++) {
			let obj = chosenAnimation.objects[i];
			//se le drawinginfo dell'oggetto non sono ancora presenti,
			//il campo objDoc esiste e tutti i file MTL associati all'oggetto sono disponibili
			//(i file MTL associati ad un OBJ contengono solitamente informazioni in più riguardo 
			//coefficienti di diffusione e speculare specifici e dipendenti dal materiale dell'oggetto)
			if (!obj.drawingInfo && obj.objDoc && obj.objDoc.isMTLComplete()) { 
				loadObjInfo(gl, obj);
			}
		}
	}

	// estrae le info e le scrive nei rispettivi buffer 
	function loadObjInfo(gl, object) {
		//estrazione delle info dal file OBJ (coordinate vertici, colore, ...)
		let drawingInfo = object.objDoc.getDrawingInfo();

		//associa il buffer dei vertici al gl.ARRAY_BUFFER e scrive i dati all'interno
		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
		//associa il buffer delle normali al gl.ARRAY_BUFFER e scrive i dati all'interno
		gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
		//associa il buffer dei colori al gl.ARRAY_BUFFER e scrive i dati all'interno
		gl.bindBuffer(gl.ARRAY_BUFFER, object.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
		//associa il buffer degli indici al gl.ELEMENT_ARRAY_BUFFER e scrive i dati all'interno
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

		//inserisco nel campo drawingInfo le info estratte dall'obj
		object.drawingInfo = drawingInfo;
	}

	//inizializza i vari buffer 
	function initBuffers(object) {
		object.vertexBuffer = gl.createBuffer();
		object.normalBuffer = gl.createBuffer();
		object.colorBuffer = gl.createBuffer();
		object.indexBuffer = gl.createBuffer();
	}

	
	//----------------------------------------------------------
	// FUNZIONI PER GLI UPDATE DURANTE L'ANIMAZIONE

	// Update della projection matrix 
	// fovy = angolo che rappresenta il campo visivo verticale della camera
	// z = valore della posizione sull'asse z
	function perspectiveProjection( fovy, z) {
		// passaggi utilizzati per la projection mtrix nelle esercitazioni 
		var fov = 3.145 * fovy / 180;
    var s = 1.0 / Math.tan( fov / 2 );
    var r = 1000 / 750;
    var near = (z - 100); //1;
    const min_n = 1;
	  if ( near < min_n ) near = min_n;
    var far = (z + 100);

		// matrice creata non come array, ma direttamente mat4 
    var result = mat4();
    result[0] = s / r;
    result[5] = s;
    result[10] = (near + far) / (near - far); //-(near + far) / d;
    result[14] = near * far * 2 / (near - far) ; //-2 * near * far / d;
    result[11] = -1;
    result[15] = 0.0;
    return result;
	}

	// update delle matrici MV, MVP ed N
	function updateMatrices() {
		// creo la matrice del modello
		let M = mat4();
		// applicazione della traslazione (funzione libreria MV)
		M = mult(M, translate(translation[0], translation[1], translation[2]));
		//applicazione delle rotazioni sugli assi (funzione della libreria MV)
		M = mult(M, rotate(rotation[0], vec3(1, 0, 0))); //asse x
		M = mult(M, rotate(rotation[1], vec3(0, 1, 0))); //asse y
		M = mult(M, rotate(rotation[2], vec3(0, 0, 1))); //asse z
		// calcolo della matrice model-view utilizzando anche la matrice view
		// che rappresenta posizione ed orientamento della camera rispetto alla scena
		MV = mult(V, M);

		// calcolo della projection matrix 
		P = perspectiveProjection(60, translation[2]);
		//calcolo della matrice model-view-projection
		MVP = mult(P, MV);
		//console.log(MVP);

		// calcolo della matrice delle normali
		let N = normalMatrix(MV, false);

		gl.uniformMatrix3fv(uN, false, flatten(N)); 
		gl.uniformMatrix4fv(uMV, false, flatten(MV));
		gl.uniformMatrix4fv(uMVP, false, flatten(MVP));
	}

	// update della luce 
	function updateLights() {
		// impostazione degli uniformi nello shader
		gl.uniform4fv(LightPosition, lightDirection); 
		gl.uniform1f(Shininess, shininess);
		let ambientProduct = multVecByScalar(ambient, lightAmbient);
		gl.uniform4fv(LightAmbient, ambientProduct); //illuminazione ambientale (in ogni direzione)
		let emissionProduct = multVecByScalar(emissionValue, lightEmission);
		gl.uniform4fv(LightEmission, emissionProduct); //emissione luminosa RGB
		let diffuseProduct = multVecByScalar(diffuseValue, mult(Kd, materialDiffuse));
		gl.uniform4fv(diffuseCoefficient, diffuseProduct); //luce diffusa
		let specularProduct = multVecByScalar(specularValue, mult(Ks, materialSpecular));
		gl.uniform4fv(specularCoefficient, specularProduct); //luce speculare
	}

	// funzione di utils per moltiplicare vettore per scalare 
	function multVecByScalar(scalar, vector) {
		return vector.map((a) => {
			return scalar * a
		});
	}


	//----------------------------------------------------------
	// FUNZIONI PER l'ANIMAZIONE
	// funzione che associa i buffer ai rispettivi array specificando 
	// le compoenti (3 o 4), il tipo, ecc.
	function bindBuffers(object, attribute) {
		// bind del buffer dei vertici
		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
		gl.vertexAttribPointer(positionAttributes[attribute], 3, gl.FLOAT, false, 0, 0);
		// bind del buffer delle normali
		gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
		gl.vertexAttribPointer(normalAttributes[attribute], 3, gl.FLOAT, false, 0, 0);
		// bind del buffer dei colori (al posto della texture)
		gl.bindBuffer(gl.ARRAY_BUFFER, object.colorBuffer);
		gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
		// bind del buffer degli indici (utili per riconoscere il keyframe attuale dal successivo)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
	}

	// funzione chiave per l'animazione, che prende un parametro deltaTime, 
	// (tempo trascorso tra i fotogrammi di animazione) e disegna il keyframe attuale
	function animation(deltaTime) {
		// object continene i keyframes della chosen animation 
		let objects = chosenAnimation.objects;
		// se step è maggiore-uguale a 1 lo reinposta a zero
		// e aggiorna l'indice dei primi 2 keyframes aggiungendo 1 
		// e usando il modulo % per ciclare all'interno dell'array objects.
		if (step >= 1.0) {
			step = 0.0;
			chosenAnimation.keyframe1Index = (chosenAnimation.keyframe1Index + 1) % objects.length;
			chosenAnimation.keyframe2Index = (chosenAnimation.keyframe2Index + 1) % objects.length;
		} else {  // altrimenti incrementa step
			step += step_velocity * deltaTime;
		}
		// aggiorna il valore di Step nello shader 
		gl.uniform1f(Step, step);
		// prende il keyframe attuale e il successivo dall'array object
		let keyframe1 = objects[chosenAnimation.keyframe1Index];
		let keyframe2 = objects[chosenAnimation.keyframe2Index];
		// associa i rispettivi buffer ai rispettivi array
		bindBuffers(keyframe1, 0);
		bindBuffers(keyframe2, 1);
		// disegna l'interpolazione basata sui keyframes attuali (a partire dal 1)
		// e il tempo trascorso (vedi shader)
		gl.drawElements(gl.TRIANGLES, keyframe1.drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
		//gl.drawArrays( gl.TRIANGLES, 0, keyframe1.drawingInfo.indices.length );
		
	}

	// funzione chiave per il rendering di ogni keyframe
	// aggiornando l'ambiente e chiamando la funzione animation
	function render(deltaTime) {
		// pulisco i buffer di colore e profondità per il nuovo rendering
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//se deltaTime non è un numero, lo metto a zero
		if (isNaN(deltaTime)) {
			deltaTime = 0;
		}

		// aggiorna le impostazioni di illuminazione
		updateLights();
		// aggiorna le matrici di trasformazione
		updateMatrices();
		// carica gli oggetti dell'attuale aniazione da renderizzare
		loadObjects();
		// chiamata alla funzione animation
		animation(deltaTime);
	}


	// then = 0, serve per tenere traccia del tempo del keyframe precedente
	let then = 0;
	// start prende come parametro now (il timestamp corrente in millisecondi)
	// questa funzione crea un drawing loop basato su requestAnimationFrame 
	// che incrementa il contatore deltaTie in modo dipendente dal tempo, 
	// in modo da avere la stessa velocità di animazione in modo costante  
	function start(now) {
		// tempo da millisecondi a secondi
		now *= 0.001;
		// calcola il tempo trascorso dal frame precedente al frame corrente
		let deltaTime = now - then;
		//  aggiorna then con il valore di now 
		// (memorizza il tempo corrente per la prossima iterazione keyframe)
		then = now;
		// chiama la funzione render passando deltaTime per aggiornare la scena
		render(deltaTime);

		// richiede al browser di chiamare di nuovo la funzione start al prossimo repaint
		requestAnimationFrame(start);
		// requestAnimationFrame è un ciclo di animazione che utilizza l'API 
		// requestAnimationFrame del browser per eseguire ripetutamente una funzione
		// è ottimizzato per le animazioni e assicura che il rendering avvenga alla 
		// frequenza di aggiornamento del display, questo rende le animazioni più 
		// fluide ed efficienti dal punto di vista delle prestazioni.
	}


	// -------------------------------------------------------- //
	// QUI SI INIZIA //
	// creo l'oggetto animazione con i suoi keyframes (objects)
	let animation1 = new Animation([
		"Android_animation1/staypose.obj",
		"Android_animation1/rightstep.obj",
		"Android_animation1/leftstep.obj",
		"Android_animation1/rightstep.obj",
		"Android_animation1/leftstep.obj",
		"Android_animation1/leftjump.obj",
		"Android_animation1/rightstep.obj",
		"Android_animation1/rightjump.obj"
	])
	let animation2 = new Animation([
		"Android_animation2/leftstep.obj",
		"Android_animation2/rightstep.obj",
		"Android_animation2/falling.obj",
		"Android_animation2/falling_down.obj",
		"Android_animation2/going_up.obj",
		"Android_animation2/going_upper.obj",
		"Android_animation2/staypose.obj"
	])
	let animations = [animation1, animation2];


	////// INIZIALIZZO L'ANIMAZIONE ATTUALE //////
	//let chosenAnimation = animations[0];
	// array per gl attributi di posizione e per le normali
	let positionAttributes = [];
	let normalAttributes = [];
	//-- CARICO ATTRIBUTI DEI PRIMI 2 KEYFRAMES --//
	// questo permette nello shader di interpolare i due 
	// KEYFRAME 1
	let position1 = gl.getAttribLocation(program, "pos1"); //position
	gl.enableVertexAttribArray(position1);
	positionAttributes.push(position1);
	let normal1 = gl.getAttribLocation(program, "norm1"); //normali
	gl.enableVertexAttribArray(normal1);
	normalAttributes.push(normal1);
	// KEYFRAME 2
	let position2 = gl.getAttribLocation(program, "pos2"); //position
	gl.enableVertexAttribArray(position2);
	positionAttributes.push(position2);
	let normal2 = gl.getAttribLocation(program, "norm2"); //normali
	gl.enableVertexAttribArray(normal2);
	normalAttributes.push(normal2);
	// Colore che è uguale per i due keyframes 
	let color = gl.getAttribLocation(program, "color"); 
	gl.enableVertexAttribArray(color);


	////-- CARICO UNIFORMI PER LO SHADER --////
	// LUCI
	let LightPosition = gl.getUniformLocation(program, "lightPosition"); //posizione della luce
	let LightEmission = gl.getUniformLocation(program, "lightEmission"); //emissione luminosa (RGB)
	let LightAmbient = gl.getUniformLocation(program, "lightAmbient"); //intensità della luce ambientale
	let diffuseCoefficient = gl.getUniformLocation(program, "diffuseCoefficient"); //coefficiente di diffusione (finale)
	let specularCoefficient = gl.getUniformLocation(program, "specularCoefficient"); //coefficiente speculare (finale)
	let Shininess = gl.getUniformLocation(program, "shininess"); //brillantezza
	// MATRICI
	let uN = gl.getUniformLocation(program, "MN"); //matrice normali
	let uMV = gl.getUniformLocation(program, "MV"); //matrice model-view
	let uMVP = gl.getUniformLocation(program, "MVP"); //matrice model-view-projection
	// STEP 
	let Step = gl.getUniformLocation(program, "step"); //valore step


	//////// INIZIALIZZO LA CAMERA /////////
	// Matrice View che rappresenta la Camera che riprende la scena
	let eye = vec3(0, 0, 4); //punto di osservazione (posizione della camera nello spazio 3D)
	let at = vec3(0, 0 , 0); //punto in cui si svolge la scena (punto verso cui la camera è rivolta)
	let up = vec3(0, 1, 0); //verso in cui la camera è posizionata, in questo caso y=1 quindi in direzione dell'asse y
	V = lookAt(eye, at, up); // matrice VIEW 
	////////////////////////////////////////


	//////// CARICO LA/LE ANIMAZIONE/I ////////
	// per ogni animazione, per ogni keyframe nell'animazione,
	// inizializza i buffer e legge i keyframe (object file)
	for (let k = 0; k < animations.length; k++) {
		let animation = animations[k];
		for (let i = 0; i < animation.fileNames.length; i++) {
			animation.objects[i] = new Object(animation.fileNames[i]);
			initBuffers(animation.objects[i]);
			readObjFile(animation.objects[i], 1, false);
		}
	}

	// solo per testare il codice, il vero start è nel pulsante Start Animation
	// start();
}



//// SHADER PART ////
// Vertex shader source code
var meshVS = `
	attribute vec3 pos1;
	attribute vec3 norm1;
	attribute vec3 pos2;
	attribute vec3 norm2;
	attribute vec4 color;

	uniform mat4 MVP;
	uniform mat4 MV;
	uniform mat3 MN;
	uniform vec4 lightPosition;
	uniform float step;

	varying vec4 viewColor;
	varying vec3 lightDirection;
	varying vec3 viewDirection;
	varying vec3 viewNormal;

	void main() {
	 	// posizione attuale interpolando le posizioni pos1 e pos2
		vec4 position = mix(vec4(pos1, 1), vec4(pos2, 1), step);
		// posizione del vertice nello spazio dell'osservatore
		vec3 viewFragPos = (MV * position).xyz;
		// posizione della luce nello spazio dell'osservatore
		vec3 lightPosition_viewSpace = lightPosition.xyz;
		
		// calcolo della direzione della luce
		lightDirection = - lightPosition_viewSpace;
		// direzione dell'osservatore rispetto alla posizione del vertice nello spazio dell'osservatore
		viewDirection = - viewFragPos;
		// interpolazioni delle normali, normalizzazione e trasformazione nello spazio dell'osservatore
		viewNormal = MN * normalize(mix(norm1, norm2, step));
		
		// assegno colore al vertice
		viewColor = color;
		// posizione del vertice utilizzando la matrice modello-vista-proiezione
		gl_Position = MVP * position;
	}
`;

// Fragment shader source code
var meshFS = `
	precision mediump float;

	uniform vec4 lightEmission;
	uniform vec4 lightAmbient;
	uniform vec4 diffuseCoefficient;
	uniform vec4 specularCoefficient;
	uniform float shininess;

	varying vec4 viewColor;
	varying vec3 lightDirection;
	varying vec3 viewDirection;
	varying vec3 viewNormal;

	void main() {
		//blinn reflection 
		// normalizza il vettore lightDirection per ottenere la direzione verso la luce
		vec3 lightDir = normalize(lightDirection);
		// normalizza il vettore viewDirection per ottenere la direzione verso l'osservatore
		vec3 viewDir = normalize(viewDirection);
		// normalizza il vettore viewNormal per ottenere la normale al vertice
		vec3 normal = normalize(viewNormal);

		// vettore tra la direzione verso la luce e la direzione verso l'osservatore
		vec3 halfAngle = normalize(lightDir + viewDir);

		// CALCOLO DELLA COMPONENTE DIFFUSA DELLA LUCE RIFLESSA
		// angolo tra direzione verso la luce e la normale utilizzando il prodotto scalare
		float cosTheta = max(dot(lightDir, normal), 0.0);
		vec4 diffuse = cosTheta * diffuseCoefficient * lightEmission;
		
		// CALCOLO DELLA COMPONENTE SPECULARE DELLA LUCE RIFLESSA
		// angolo tra la normale e il vettore halfAngle utilizzando il prodotto scalare
		float cosOmega = max(dot(normal, halfAngle), 0.0);
		vec4 specular = specularCoefficient * lightEmission * pow(cosOmega, shininess);

		vec4 fColor = viewColor * lightAmbient + viewColor * diffuse + specular;
		//  assegna il colore finale al frammento
		gl_FragColor = fColor;
	}
`;


/**
* @param {Element} canvas. The canvas element to create a context from.
* @return {WebGLRenderingContext} The created context.
*/
function setupWebGL(canvas) {
	return WebGLUtils.setupWebGL(canvas);
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 */

//window.requestAnimFrame = (function() {
//  return window.requestAnimationFrame ||
//         window.webkitRequestAnimationFrame ||
//         window.mozRequestAnimationFrame ||
//         window.oRequestAnimationFrame ||
//         window.msRequestAnimationFrame ||
//         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
//           window.setTimeout(callback, 1000/60);
//         };
//})(); 
