Float32Array.prototype.type = '';
Float32Array.prototype.index = 0;

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

function vec2()
{
    var result = _argumentsToArray( arguments );
    var out = new Float32Array(2);
    out.type = 'vec2';

    if(result)
    switch ( result.length ) {
      case 0:
        out[0] = 0.0;
        out[1] = 0.0;
        break;
      case 1:
        if(result[0].type != 'vec2') {
        out[0] = result[0];
        out[1] = result[0];
      }
      else {
        out[0] = result[0][0];
        out[1] = result[0][1];
      }
        break;
      case 2:
        out[0] = result[0];
        out[1] = result[1];
        break;
    }
    return out;
}

function vec3()
{
    var result = _argumentsToArray( arguments );
    var out = new Float32Array(3);
    out.type = 'vec3';

    switch ( result.length ) {
    case 0:
      out[0] = 0.0;
      out[1] = 0.0;
      out[2] = 0.0;
      break;
    case 1:
    if(result[0].type != 'vec3') {
      out[0] = result[0];
      out[1] = result[0];
      out[2] = result[0];
    }
    else {
      out[0] = result[0][0];
      out[1] = result[0][1];
      out[2] = result[0][2];
    }
      break;
    case 3:
      out[0] = result[0];
      out[1] = result[1];
      out[2] = result[2];
      break;
    }

    return out;
}

function vec4()
{
    var result = _argumentsToArray( arguments );
    var out = new Float32Array(4);
    out.type = 'vec4';
    switch ( result.length ) {
      case 0:
        out[0] = 0.0;
        out[1] = 0.0;
        out[2] = 0.0;
        out[3] = 0.0;
        break;
      case 1:
      if(result[0].type != 'vec4') {
        out[0] = result[0];
        out[1] = result[0];
        out[2] = result[0];
        out[3] = result[0];
      }
      else {
        out[0] = result[0][0];
        out[1] = result[0][1];
        out[2] = result[0][2];
        out[3] = result[0][3];
      }
        break;
      case 2:
        if(typeof(result[0])=='number'&&result[1].type == 'vec3') {
          out[0] = result[0];
          out[1] = result[1][0];
          out[2] = result[1][1];
          out[3] = result[1][2];
      }
        break;
      case 4:
        out[0] = result[0];
        out[1] = result[1];
        out[2] = result[2];
        out[3] = result[3];
        break;
    }
    return out;
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2()
{
    var v = _argumentsToArray( arguments );
    var out = new Float32Array(4);

    switch ( v.length ) {
    case 0:
        out[0]=out[3]=1.0;
        out[1]=out[2]=0.0;
        break;
    case 1:
      out[0] = v[0][0];
      out[1] = v[0][1];
      out[2] = v[0][2];
      out[3] = v[0][3];

        break;
    case 4:
        out[0] = v[0];
        out[1] = v[1];
        out[2] = v[2];
        out[3] = v[3];
        break;
    }
    out.type = 'mat2';

    return out;
}

//----------------------------------------------------------------------------

function mat3()
{
    var v = _argumentsToArray( arguments );

    var out = new Float32Array(9);
    switch ( v.length ) {
      case 0:
          out[0]=out[4]=out[8]=1.0;
          out[1]=out[2]=out[3]=out[5]=out[6]=out[7]=0.0;
          break;
    case 1:
         for(var i=0; i<9; i++) {
           out[i]=v[0][i];
         }
        break;

    case 9:
        out = new Float32Array(9);
        for(var i=0; i<9; i++) {
          out[i] = v[i];
        }
        break;
    }
    out.type = 'mat3';

    return out;
}

//----------------------------------------------------------------------------

function mat4()
{
    var v = _argumentsToArray( arguments );

    var out = new Float32Array(16);
    switch ( v.length ) {
    case 0:
      out[0]=out[5]=out[10]=out[15] = 1.0;
      out[1]=out[2]=out[3]=out[4]=out[6]=out[7]=out[8]=out[9]=out[11]=out[12]=out[13]=out[14]=0.0;
      break;

    case 1:
      for(var i=0; i<16; i++) {
        out[i] = v[0][i];
      }
      break;

    case 16:
      for(var i=0; i<16; i++) {
        out[i] = v[i];
      }
      break;
    }
    out.type = 'mat4';

    return out;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//----------------------------------------------------------------------------

function mult( u, v )
{

  if(!isNaN(u)||typeof(u)=="number") {
    result = new Float32Array(v.length);
    result.type = v.type;
    for(var i =0; i<v.length; i++) {
      result[i] = u*v[i];
    }
    return result;
  }
  if(u.type=='mat2' && v.type == 'vec2') {
    var result = vec2();
    result[0] =u[0]*v[0]+u[1]*v[1];
    result[1] =u[2]*v[0]+u[3]*v[1];
    return result;
  }
  if(u.type=='mat3'&& v.type=='vec3') {
    var result = vec3();
    result[0] =u[0]*v[0]+u[1]*v[1]+u[2]*v[2];
    result[1] =u[3]*v[0]+u[4]*v[1]+u[5]*v[2];
    result[2] =u[6]*v[0]+u[7]*v[1]+u[8]*v[2];
    return result;
  }
  if(u.type=='mat4'&& v.type=='vec4')  {
    var result = vec4();
    result[0] =u[0]*v[0]+u[1]*v[1]+u[2]*v[2]+u[3]*v[3];
    result[1] =u[4]*v[0]+u[5]*v[1]+u[6]*v[2]+u[7]*v[3];
    result[2] =u[8]*v[0]+u[9]*v[1]+u[10]*v[2]+u[11]*v[3];
    result[3] =u[12]*v[0]+u[13]*v[1]+u[14]*v[2]+u[15]*v[3];
    return result;
  }
 if (u.type=='mat2'&&v.type=='mat2'){
    result = mat2();
    result[0] = v[0]*u[0]+v[1]*u[2];
    result[1] = v[0]*u[1]+v[1]*u[3];
    result[2] = v[2]*u[0]+v[3]*u[2];
    result[3] = v[2]*u[1]+v[3]*u[3];
    return result;
  }
 if (u.type=='mat3'&&v.type=='mat3'){
    result = mat3();
    result[0] = v[0]*u[0]+v[1]*u[3]+v[2]*u[6];
    result[1] = v[0]*u[1]+v[1]*u[4]+v[2]*u[7];
    result[2] = v[0]*u[2]+v[1]*u[5]+v[2]*u[8];
    result[3] = v[3]*u[0]+v[4]*u[3]+v[5]*u[6];
    result[4] = v[3]*u[1]+v[4]*u[4]+v[5]*u[7];
    result[5] = v[3]*u[2]+v[4]*u[5]+v[5]*u[8];
    result[6] = v[6]*u[0]+v[7]*u[3]+v[8]*u[6];
    result[7] = v[6]*u[1]+v[7]*u[4]+v[8]*u[7];
    result[8] = v[6]*u[2]+v[7]*u[5]+v[8]*u[8];
  }
  else if (u.type=='mat4'&&v.type=='mat4'){
    result = mat4();
    result[0] = v[0]*u[0]+v[1]*u[4]+v[2]*u[8]+v[3]*u[12];
    result[1] = v[0]*u[1]+v[1]*u[5]+v[2]*u[9]+v[3]*u[13];
    result[2] = v[0]*u[2]+v[1]*u[6]+v[2]*u[10]+v[3]*u[14];
    result[3] = v[0]*u[3]+v[1]*u[7]+v[2]*u[11]+v[3]*u[15];

    result[4] = v[4]*u[0]+v[5]*u[4]+v[6]*u[8]+v[7]*u[12];
    result[5] = v[4]*u[1]+v[5]*u[5]+v[6]*u[9]+v[7]*u[13];
    result[6] = v[4]*u[2]+v[5]*u[6]+v[6]*u[10]+v[7]*u[14];
    result[7] = v[4]*u[3]+v[5]*u[7]+v[6]*u[11]+v[7]*u[15];

    result[8] = v[8]*u[0]+v[9]*u[4]+v[10]*u[8]+v[11]*u[12];
    result[9] = v[8]*u[1]+v[9]*u[5]+v[10]*u[9]+v[11]*u[13];
    result[10] = v[8]*u[2]+v[9]*u[6]+v[10]*u[10]+v[11]*u[14];
    result[11] = v[8]*u[3]+v[9]*u[7]+v[10]*u[11]+v[11]*u[15];

    result[12] = v[12]*u[0]+v[13]*u[4]+v[14]*u[8]+v[15]*u[12];
    result[13] = v[12]*u[1]+v[13]*u[5]+v[14]*u[9]+v[15]*u[13];
    result[14] = v[12]*u[2]+v[13]*u[6]+v[14]*u[10]+v[15]*u[14];
    result[15] = v[12]*u[3]+v[13]*u[7]+v[14]*u[11]+v[15]*u[15];

    return result;
  }
  if (u.type=='vec3'&&v.type=='vec3'){
    var result = vec3(u[0]*v[0], u[1]*v[1], u[2]*v[2]);
    return result;
  }
  if (u.type=='vec4'&&v.type=='vec4'){
    var result = vec4(u[0]*v[0], u[1]*v[1], u[2]*v[2], u[3]*v[3]);
    return result;
  }
    throw "mult(): trying to mult incompatible types";
}


//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

function translate( x, y, z )
{
    if(arguments.length!=2 && arguments.length != 3) {
      throw "translate(): not a mat3 or mat4";
    }
    if(arguments.length == 2) {
      result = mat3();
      //result[2] = x;
      //result[5] = y;
      result[6] = x;
      result[7] = y;

      return result;
    }
      result = mat4();
      //result[3] = x;
      //result[7] = y;
      //result[11] = z;

      result[12] = x;
      result[13] = y;
      result[14] = z;

      return result;

}

//----------------------------------------------------------------------------

function rotate( angle, axis )
{
    if(axis.type != 'vec3') throw "rotate: axis not a vec3";
    var v = normalize( axis );

    var x = v[0];
    var y = v[1];
    var z = v[2];

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var result = mat4(
        x*x*omc + c,   x*y*omc + z*s, x*z*omc - y*s, 0.0 ,
         x*y*omc - z*s, y*y*omc + c,   y*z*omc + x*s, 0.0 ,
         x*z*omc + y*s, y*z*omc - x*s, z*z*omc + c,   0.0 ,
        0.0, 0.0, 0.0, 1.0
    );
    return result;
}


//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

function lookAt( eye, at, up )
{
    if ( equal(eye, at) ) {
        return mat4();
    }

    var v = normalize( subtract(at, eye) );  // view direction vector
    var n = normalize( cross(v, up) );       // perpendicular vector
    var u = normalize( cross(n, v) );        // "new" up vector

    v = negate( v );

    var result = mat4(
        //n[0], n[1], n[2], -dot(n, eye),
        //u[0], u[1], u[2], -dot(u, eye),
        //v[0], v[1], v[2], -dot(v, eye),
        //0.0, 0.0, 0.0, 1.0
        n[0], u[0], v[0], 0.0,
        n[1], u[1], v[1], 0.0,
        n[2], u[2], v[2], 0.0,
        -dot(n, eye), -dot(u, eye), -dot(v, eye), 1.0
    );

    return result;
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

function ortho( left, right, bottom, top, near, far )
{
    if ( left == right ) { throw "ortho(): left and right are equal"; }
    if ( bottom == top ) { throw "ortho(): bottom and top are equal"; }
    if ( near == far )   { throw "ortho(): near and far are equal"; }

    var w = right - left;
    var h = top - bottom;
    var d = far - near;

    var result = mat4();

    //result[1]=result[2]=result[4]=result[6]=result[8]=result[9]=result[12]=result[13]=result[14]=0.0;
    result[1]=result[2]=result[4]=result[6]=result[8]=result[9]=result[3]=result[7]=result[11]=0.0;
    result[0] = 2.0 / w;
    result[5] = 2.0 / h;
    result[10] = -2.0 / d;
    //result[3] = -(left + right) / w;
    //result[7] = -(top + bottom) / h;
    //result[11] = -(near + far) / d;
    result[12] = -(left + right) / w;
    result[13] = -(top + bottom) / h;
    result[14] = -(near + far) / d;
    result[15] = 1.0;

    return result;
}

//----------------------------------------------------------------------------
////aspect, near, far )
/*
function perspective( fovy, z)
{
    var s = 1.0 / Math.tan( radians(fovy) / 2 );
    var r = 1000 / 750;

    var near = (z - 100); //1;
    const min_n = 1;
	  if ( near < min_n ) near = min_n;
    var far = (z + 100);

    var result = mat4();
    result[0] = s / r;
    result[5] = s;
    result[10] = (near + far) / (near - far); //-(near + far) / d;
    result[14] = near * far * 2 / (near - far) ; //-2 * near * far / d;
    result[11] = -1;
    result[15] = 0.0;

    return result;
}
*/
/*
function perspective( z, fov_angle=60 )
{
	var r = 1200 / 750;
	var n = (z - 1.74);
	const min_n = 0.001;
	if ( n < min_n ) n = min_n;
	var f = (z + 1.74);
	var fov = 3.145 * fov_angle / 180;
	var s = 1 / Math.tan( fov/2 );
	var result = mat4();
  result[0] = s/r;
  result[5] = s;
  result[10] = (n+f)/(f-n); //-(near + far) / d;
  result[14] = -2*n*f/(f-n); //-2 * near * far / d;
  result[11] = 1;
  result[15] = 0.0;

  return result;
  //[s/r, 0, 0, 0,  0, s, 0, 0,  0, 0, (n+f)/(f-n), 1,  0, 0, -2*n*f/(f-n), 0];
}
*/
//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose( m )
{
    switch(m.type) {
      case 'mat2':
        var result = mat2(m[0], m[2],
                          m[1], m[3]
                        );
        return result;
        break;

      case 'mat3':
        var result = mat3(m[0], m[4], m[7],
                        m[1], m[5], m[8],
                        m[2], m[6], m[9]
                      );
        return result;
        break;

      case 'mat4':
        var result = mat4(m[0], m[4], m[8], m[12],
                          m[1], m[5], m[9], m[13],
                          m[2], m[6], m[10], m[14],
                          m[3], m[7], m[11], m[15]
        );
        return result;
        break;

      default: throw "transpose(): trying to transpose a non-matrix";
    }
}


//----------------------------------------------------------------------------
//
//  Vector Functions
//

function dot( u, v )
{

    if ( u.type != v.type ) {
      throw "dot(): types are not the same ";
    }
    if (u.type != 'vec2' && u.type != 'vec3' && u.type != 'vec4') {
      throw "dot(): not a vector ";
    }

    var sum = 0.0;
    for ( var i = 0; i < u.length; i++ ) {
        sum += u[i] * v[i];
    }
    return sum;
}

//----------------------------------------------------------------------------

function length( u )
{
    return Math.sqrt( dot(u, u) );
}

//----------------------------------------------------------------------------

function normalize( u, excludeLastComponent )
{
    if(u.type != 'vec3' && u.type != 'vec4') {

      throw "normalize: not a vector type";
    }
    switch(u.type) {
      case 'vec2':
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]);
        var result = vec2(u[0]/len, u[1]/len);
        return result;
      break;
      case 'vec3':
        if(excludeLastComponent) {
          var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]);
          var result = vec3(u[0]/len, u[1]/len, u[2]);
          return result;
          break;
        }
        else {
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]+u[2]*u[2]);
        var result = vec3(u[0]/len, u[1]/len, u[2]/len);
        return result;
        break;
      }
      case 'vec4':
      if(excludeLastComponent) {
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]+u[2]*u[2]);
        var result = vec4(u[0]/len, u[1]/len, u[2]/len, u[3]);
        return result;
        break;
      }
      else {
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]+u[2]*u[2]+u[3]*u[3]);
        var result = vec4(u[0]/len, u[1]/len, u[2]/len, u[3]/len);
        return result;
        break;
      }
    }
}

//----------------------------------------------------------------------------

function mix( u, v, s )
{

    if ( typeof(s) !== "number" ) {
        throw "mix: the last paramter " + s + " must be a number";
    }
    if(typeof(u)=='number'&&typeof(v)=='number') {
      return (1.0-s)*u + s*v;
    }

    if ( u.length != v.length ) {

        throw "vector dimension mismatch";
    }

    var result = new Float32Array(u.length);
    for ( var i = 0; i < u.length; ++i ) {
        result[i] =  (1.0 - s) * u[i] + s * v[i] ;
    }
    switch(u.length){
      case 2:
        result.type = 'vec2';
        break;
      case 3:
        result.type = 'vec3';
        break;
      case 4:
        result.type = 'vec4';
        break;
    }
    return result;
}

//----------------------------------------------------------------------------
//
// Vector and Matrix functions
//

function scale( x, y, z )
{

    if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0] = x;
    result[5] = y;
    result[10] = z;
    result[15] = 1.0;

    return result;
}

//----------------------------------------------------------------------------
//
//
//

function flatten( v )
{

    if(!Array.isArray(v)) return v;


    if(typeof(v[0])=='number'){
      var floats = new Float32Array( v.length );

      for(var i = 0; i<v.length; i++)
          floats[i] = v[i];

      return floats;
    }

    var floats = new Float32Array( v.length*v[0].length  );

    for(var i = 0; i<v.length; i++) for(var j=0; j<v[0].length; j++) {
      floats[i*v[0].length+j] = v[i][j];

    }

    return floats;
}


function normalMatrix(m, flag)
{
    if(m.type != 'mat4') {
      throw "normalMatrix: not a mat4";
    }
    var a = mat4();

    if(flag == true)
      return a;
    else {
      var b = mat3(a[0], a[1], a[2],
                 a[4], a[5], a[6],
                 a[8], a[9], a[10]
               );
      return b;
    }

}
