/** Small instanced WebGL2 renderer. All geometry is generated locally. */
export const v3 = {
  sub: (a,b) => a.map((v,i) => v-b[i]),
  dot: (a,b) => a.reduce((s,v,i) => s+v*b[i],0),
  cross: (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  norm: a => { const d = Math.hypot(...a) || 1; return a.map(v => v/d); },
};
export function multiply(a,b) {
  const out = new Float32Array(16);
  for(let c=0;c<4;c++) for(let r=0;r<4;r++) for(let k=0;k<4;k++) out[c*4+r]+=a[k*4+r]*b[c*4+k];
  return out;
}
export function lookAt(eye,target) {
  const z=v3.norm(v3.sub(eye,target)), x=v3.norm(v3.cross([0,1,0],z)), y=v3.cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-v3.dot(x,eye),-v3.dot(y,eye),-v3.dot(z,eye),1]);
}
export function ortho(w,h,near=.1,far=250) { return new Float32Array([2/w,0,0,0,0,2/h,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]); }
const COLORS = new Map();
export function rgb(hex) {
  if (!COLORS.has(hex)) { const n=parseInt(hex.replace('#',''),16); COLORS.set(hex,[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]); }
  return COLORS.get(hex);
}
export function object(type,x,y,z,w,h,d,color,rotation=0) { return {type,x,y,z,w,h,d,color,rotation}; }
function geometry(type) {
  const v=[];
  const tri=(a,b,c,n)=>{ for(const p of [a,b,c]) v.push(...p,...n); };
  if(type==='box') {
    for (const [n,u,t] of [[[1,0,0],[0,0,-.5],[0,.5,0]],[[-1,0,0],[0,0,.5],[0,.5,0]],[[0,1,0],[.5,0,0],[0,0,-.5]],[[0,-1,0],[.5,0,0],[0,0,.5]],[[0,0,1],[.5,0,0],[0,.5,0]],[[0,0,-1],[-.5,0,0],[0,.5,0]]]) {
      const p=(s,k)=>n.map((a,i)=>a*.5+u[i]*s+t[i]*k);
      tri(p(-1,-1),p(1,-1),p(1,1),n); tri(p(-1,-1),p(1,1),p(-1,1),n);
    }
  } else {
    const sides=type==='gem'?4:type==='cone'?7:12;
    for(let i=0;i<sides;i++) {
      const a=i/sides*Math.PI*2,b=(i+1)/sides*Math.PI*2;
      const p=[Math.cos(a)*.5,-.5,Math.sin(a)*.5], q=[Math.cos(b)*.5,-.5,Math.sin(b)*.5];
      if(type==='cone'||type==='gem') {
        const top=[0,.5,0], n=v3.norm(v3.cross(v3.sub(top,p),v3.sub(q,p)));
        tri(p,top,q,n);
        if(type==='gem') tri([p[0],0,p[2]],[q[0],0,q[2]],[0,-.9,0],v3.norm([Math.cos(a),-.7,Math.sin(a)]));
      } else {
        const pt=[p[0],.5,p[2]],qt=[q[0],.5,q[2]],n=v3.norm([Math.cos((a+b)/2),0,Math.sin((a+b)/2)]);
        tri(p,pt,qt,n);tri(p,qt,q,n);tri([0,.5,0],qt,pt,[0,1,0]);
      }
      tri([0,-.5,0],p,q,[0,-1,0]);
    }
  }
  return new Float32Array(v);
}
const vertex=`#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
layout(location=2) in vec4 location;
layout(location=3) in vec4 scale;
layout(location=4) in vec4 tint;
uniform mat4 viewProjection;
out vec3 color;
out vec3 world;
void main(){
 float c=cos(location.w),s=sin(location.w);
 mat3 rot=mat3(c,0,-s,0,1,0,s,0,c);
 world=rot*(position*scale.xyz)+location.xyz;
 vec3 n=normalize(rot*normal);
 float light=.65+max(dot(n,normalize(vec3(-.5,1.,.65))),0.)*.35;
 color=tint.rgb*light;
 gl_Position=viewProjection*vec4(world,1.);
}`;
const fragment=`#version 300 es
precision highp float;
in vec3 color;
in vec3 world;
out vec4 outputColor;
uniform vec3 focus;
void main(){
 float fog=smoothstep(65.,150.,distance(world,focus));
 outputColor=vec4(mix(color,vec3(.85,.9,.83),fog*.65),1.);
}`;
export class Renderer {
  constructor(canvas) {
    this.canvas=canvas; this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
    if(!this.gl) throw new Error('This browser does not support WebGL 2. Try Chrome, Edge, Firefox or Safari with hardware acceleration enabled.');
    const gl=this.gl;
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
    this.program=gl.createProgram();
    for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]])gl.attachShader(this.program,shader(type,source));
    gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
    this.vp=gl.getUniformLocation(this.program,'viewProjection');this.focusUniform=gl.getUniformLocation(this.program,'focus');
    this.meshes={};
    for(const type of ['box','cylinder','cone','gem']) {
      const data=geometry(type),vao=gl.createVertexArray();gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      for(let i=0;i<2;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,24,i*12);}
      const instances=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,instances);
      for(let i=2;i<=4;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,4,gl.FLOAT,false,48,(i-2)*16);gl.vertexAttribDivisor(i,1);}
      this.meshes[type]={vao,instances,count:data.length/6,data:new Float32Array(120000)};
    }
    gl.enable(gl.DEPTH_TEST);gl.clearColor(.85,.9,.83,1);
    this.focus=[0,0,0];this.yaw=.15;this.zoom=52;this.matrix=null;this.quality='high';
  }
  resize() {
    const dpr=this.quality==='low'?1:Math.min(window.devicePixelRatio||1,1.6),w=Math.floor(this.canvas.clientWidth*dpr),h=Math.floor(this.canvas.clientHeight*dpr);
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.gl.viewport(0,0,w,h);}
  }
  render(objects) {
    const gl=this.gl;this.resize();
    const [x,y,z]=this.focus,eye=[x+Math.sin(this.yaw)*65,y+70,z+Math.cos(this.yaw)*65];
    this.matrix=multiply(ortho(this.zoom*this.canvas.width/this.canvas.height,this.zoom),lookAt(eye,this.focus));
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.vp,false,this.matrix);gl.uniform3fv(this.focusUniform,this.focus);
    const counts={box:0,cylinder:0,cone:0,gem:0};
    for(const o of objects){const m=this.meshes[o.type],at=counts[o.type]*12;if(at+12>m.data.length)continue;m.data.set([o.x,o.y,o.z,o.rotation,o.w,o.h,o.d,0,...rgb(o.color),1],at);counts[o.type]++;}
    for(const [type,m] of Object.entries(this.meshes)){gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ARRAY_BUFFER,m.instances);gl.bufferData(gl.ARRAY_BUFFER,m.data.subarray(0,counts[type]*12),gl.DYNAMIC_DRAW);gl.drawArraysInstanced(gl.TRIANGLES,0,m.count,counts[type]);}
  }
  project(x,y,z) {
    if(!this.matrix)return[-1000,-1000];const m=this.matrix;
    return [(m[0]*x+m[4]*y+m[8]*z+m[12]+1)*this.canvas.clientWidth/2,(1-m[1]*x-m[5]*y-m[9]*z-m[13])*this.canvas.clientHeight/2];
  }
}
