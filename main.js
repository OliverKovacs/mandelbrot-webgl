// Oliver Kovacs 2021 - mandelbrot-webgl - MIT

import WebGLShaderRenderer from "./webgl.js";
import Vector from "./vector.js";

let resolution = [ 1000, 500 ];
let position = [ 0.5, 0 ];
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

const changeShader = async (path, renderer) => {
    zoom = 0.8;
    position = [ 0.5, 0 ];
    await renderer.setShader(path);
};

window.onload = async () => {

    let renderer = new WebGLShaderRenderer("canvas", resolution);
    renderer.programInfo.uniforms = [
        "resolution",
        "position",
        "zoom",
        "time",
    ];
    await renderer.setShader("shader/mandelbrot.glsl");

    document.getElementById("mandelbrot").onclick = () => changeShader("shader/mandelbrot.glsl", renderer);
    document.getElementById("burning_ship").onclick = () => changeShader("shader/burning_ship.glsl", renderer);
    document.getElementById("multibrot").onclick = () => changeShader("shader/multibrot.glsl", renderer);
    let fps = document.getElementById("fps");
    renderer.callback = (gl, shaderProgram) => {
        gl.uniform2fv(shaderProgram.uniforms.resolution, resolution);
        gl.uniform2fv(shaderProgram.uniforms.position, position);
        gl.uniform1f(shaderProgram.uniforms.zoom, zoom);
        gl.uniform1f(shaderProgram.uniforms.time, Date.now() - start);
        fps.innerHTML = `dt: ${Math.round(renderer.dt)}ms fps: ${Math.round(1000 / renderer.dt)}`
    };

    renderer.canvas.onwheel = wheel;
    renderer.start();
};
