// Oliver Kovacs 2021 - mandelbrot-webgl - MIT

import WebGLShaderRenderer from "./webgl.js";
import Vector from "./vector.js";

let resolution = [ 1000, 500 ];
let position = [ 0.5, 0 ];
let background = [ 0, 0, 0, 1 ];
let zoom = 0.8;
let start = Date.now();

const wheel = event => {
    event.preventDefault();
    const speed = -0.003;
    const nzoom = zoom * (1 + event.deltaY * speed);
    let uv = Vector.scalar(Vector.subtract(Vector.scalar([ event.clientX, event.clientY ], 2), resolution), 1 / resolution[1]);
    position = Vector.add(position, Vector.scalar(uv, (zoom - nzoom) / (zoom * nzoom)));
    zoom = nzoom;
};

const changeFragmentShader = async (path, renderer) => {
    zoom = 0.8;
    position = [ 0.5, 0 ];
    await renderer.setShader("./shader/vertex.glsl", path);
};

window.onload = async () => {

    let renderer = new WebGLShaderRenderer("canvas", resolution);
    renderer.programInfo.uniforms = [
        "resolution",
        "position",
        "background",
        "zoom",
        "time",
    ];
    await renderer.setShader("./shader/vertex.glsl", "./shader/mandelbrot.glsl");

    [ "mandelbrot", "burning_ship", "multibrot" ].forEach(fractal => {
        document.getElementById(fractal).onclick = () => changeFragmentShader(`./shader/${fractal}.glsl`, renderer);
    });
    
    let fps = document.getElementById("fps");
    renderer.callback = (gl, shaderProgram) => {
        gl.uniform2fv(shaderProgram.uniforms.resolution, resolution);
        gl.uniform2fv(shaderProgram.uniforms.position, position);
        gl.uniform4fv(shaderProgram.uniforms.background, background);
        gl.uniform1f(shaderProgram.uniforms.zoom, zoom);
        gl.uniform1f(shaderProgram.uniforms.time, Date.now() - start);
        fps.innerHTML = `dt: ${Math.round(renderer.dt)}ms fps: ${Math.round(1000 / renderer.dt)}`
    };

    renderer.canvas.onwheel = wheel;
    renderer.start();
};
