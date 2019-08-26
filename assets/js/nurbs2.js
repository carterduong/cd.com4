var container, stats;
var camera, scene, renderer, controls;
var group;
var nurbsLine, nurbsMaterial;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = document.getElementById('canvas-container').offsetWidth / 2;
var windowHalfY = document.getElementById('canvas-container').offsetHeight / 2;
var windowX = windowHalfX * 2;
var windowY = windowHalfY * 2;
var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var canvasWidth;
var canvasHeight;

var pause = false;

init();
animate();

function init() {
    container = document.getElementById('canvas-container');
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1500 );
    if (viewportWidth < 800) {
      camera.position.set( 0, 0, 1100 );
    } else {
      camera.position.set( 0, 0, 900 );
    }
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );
    group = new THREE.Group();
    scene.add( group );

    // NURBS curve
    var nurbsControlPoints = [];
    var nurbsKnots = [];
    var nurbsDegree = 3;
    for ( var i = 0; i <= nurbsDegree; i ++ ) {
        nurbsKnots.push( 0 );
    }
    for ( var i = 0, j = 20; i < j; i ++ ) {
        nurbsControlPoints.push(
            new THREE.Vector4(
                Math.random() * 400 - 200,
                Math.random() * 400 - 230,
                Math.random() * 400 - 200,
                10 // weight of control point: higher means stronger attraction
            )
        );
        var knot = ( i + 1 ) / ( j - nurbsDegree );
        nurbsKnots.push( THREE.Math.clamp( knot, 0, 1 ) );
    }

    var nurbsCurve = new THREE.NURBSCurve( nurbsDegree, nurbsKnots, nurbsControlPoints );
    var nurbsGeometry = new THREE.BufferGeometry();
    nurbsGeometry.setFromPoints( nurbsCurve.getPoints( 200 ) );
    if (viewportWidth < 800) {
      nurbsMaterial = new THREE.LineBasicMaterial( { linewidth: 7, color: 0xFFFFFF } );
    } else {
      nurbsMaterial = new THREE.LineBasicMaterial( { linewidth: 13, color: 0xFFFFFF } );
    }
    nurbsLine = new THREE.Line( nurbsGeometry, nurbsMaterial );
    nurbsLine.position.set( 0, 0, 0 );
    group.add( nurbsLine );

    // renderer init
    canvasWidth = document.getElementById('canvas-container').offsetWidth;
    canvasHeight = document.getElementById('canvas-container').offsetHeight;
    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( canvasWidth, canvasHeight );

    control = new THREE.OrbitControls( camera, renderer.domElement );

    container.appendChild( renderer.domElement );
    stats = new Stats();
    // container.appendChild( stats.dom );
    // document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    container.addEventListener( 'mousedown', onMouseDown, false);
    document.addEventListener( 'mouseup', onMouseUp, false);
    
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    document.addEventListener( 'touchstart', onMouseDown );
    document.addEventListener( 'touchend', onMouseUp );
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    canvasWidth = document.getElementById('canvas-container').offsetWidth;
    canvasHeight = document.getElementById('canvas-container').offsetHeight;
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( canvasWidth, canvasHeight );
    
    if (viewportWidth < 800) {
      camera.position.set( 0, 0, 1100 );
      console.log(viewportWidth);
    } else {
      camera.position.set( 0, 0, 900 );
    }
    interval = 3;
}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mouseout', onDocumentMouseOut, false );
    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
}

function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
}

function onDocumentMouseUp( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentTouchStart( event ) {
    if ( event.touches.length == 1 ) {
        event.preventDefault();
        mouseXOnMouseDown = event.touches[ 0 ].pageX - canvasWidth/2;
        targetRotationOnMouseDown = targetRotation;
    }
}

function onDocumentTouchMove( event ) {
    if ( event.touches.length == 1 ) {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
    }
}

function onMouseDown( event ) {
  // pause = true;
  interval = 90;
}

function onMouseUp( event ) {
  // pause = false;
  interval = 3;
}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}

// Change curve based on interval
var interval = 3;
var current = 1;

function render() {

    if (current >= interval && !pause) {
      generateCurve();
      current = 1;
    } else {
      current++;
    }
    
    renderer.render( scene, camera );
}

function generateCurve() {
  group.remove( nurbsLine );

  // NURBS curve
  nurbsControlPoints = [];
  nurbsKnots = [];
  nurbsDegree = 3;
  for ( var i = 0; i <= nurbsDegree; i ++ ) {
    nurbsKnots.push( 0 );
  }
  for ( var i = 0, j = 20; i < j; i ++ ) {
    nurbsControlPoints.push(
        new THREE.Vector4(
            Math.random() * 400 - 200,
            Math.random() * 400 - 230,
            Math.random() * 400 - 200,
            10 // weight of control point: higher means stronger attraction
        )
    );
    var knot = ( i + 1 ) / ( j - nurbsDegree );
    nurbsKnots.push( THREE.Math.clamp( knot, 0, 1 ) );
  }
  nurbsCurve = new THREE.NURBSCurve( nurbsDegree, nurbsKnots, nurbsControlPoints );
  nurbsGeometry = new THREE.BufferGeometry();
  nurbsGeometry.setFromPoints( nurbsCurve.getPoints( 200 ) );
  nurbsLine = new THREE.Line( nurbsGeometry, nurbsMaterial );
  nurbsLine.position.set( 0, -20, 0 );
  group.add( nurbsLine );
}