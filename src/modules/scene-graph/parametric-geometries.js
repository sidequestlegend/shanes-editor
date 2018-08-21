export class ParametricGeometries{
    klein ( v, u ) {

        u *= Math.PI;
        v *= 2 * Math.PI;

        u = u * 2;
        let x, y, z;
        if ( u < Math.PI ) {

            x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v );
            z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

        } else {

            x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI );
            z = - 8 * Math.sin( u );

        }

        y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );


        return new THREE.Vector3(x,y,z);

    }

    invertedKlein(v, u){
        return this.klein(u, v);
    }

    mobius ( u, v ) {

        // flat mobius strip
        // http://www.wolframalpha.com/input/?i=M%C3%B6bius+strip+parametric+equations&lk=1&a=ClashPrefs_*Surface.MoebiusStrip.SurfaceProperty.ParametricEquations-
        u = u - 0.5;
        v = 2 * Math.PI * v;

        let x, y, z;

        let a = 2;

        x = Math.cos( v ) * ( a + u * Math.cos( v / 2 ) );
        y = Math.sin( v ) * ( a + u * Math.cos( v / 2 ) );
        z = u * Math.sin( v / 2 );
        //
        // target.set( x, y, z );

        return new THREE.Vector3(x,y,z);
    }

    mobius3d ( u, v ) {

        // volumetric mobius strip

        u *= Math.PI;
        v *= 2 * Math.PI;

        u = u * 2;
        let phi = u / 2;
        let major = 2.25, a = 0.125, b = 0.65;

        let x, y, z;

        x = a * Math.cos( v ) * Math.cos( phi ) - b * Math.sin( v ) * Math.sin( phi );
        z = a * Math.cos( v ) * Math.sin( phi ) + b * Math.sin( v ) * Math.cos( phi );
        y = ( major + x ) * Math.sin( u );
        x = ( major + x ) * Math.cos( u );
        return new THREE.Vector3(x,y,z);

    }
    invertedMobius3d(v, u){
        return this.mobius3d(u, v);
    }
    apple(u, v){
        u = u * 2 * Math.PI;
        v = (v * 2 * Math.PI)-Math.PI;
        let x = Math.cos(u)*(4+3.8*Math.cos(v));
        let y = Math.sin(u)*(4+3.8*Math.cos(v));
        let z = (Math.cos(v)+Math.sin(v)-1)*(1+Math.sin(v))*Math.log(1-Math.PI*v/10)+7.5*Math.sin(v);
        return new THREE.Vector3(x,y,z);
    }
    invertedApple(v, u){
        return this.apple(u, v);
    }
    snail(u, v){
        u = u * 2 * Math.PI;
        v = (v * 4 * Math.PI)-Math.PI*2;
        let x = u*Math.cos(v)*Math.sin(u);
        let y = u*Math.cos(u)*Math.cos(v);
        let z = -u*Math.sin(v);
        return new THREE.Vector3(x,y,z);
    }
    invertedSnail(v, u){
        return this.snail(u, v);
    }
    spiral(u, v){
        u = u * 2 * -Math.PI;
        v = v * 2 * -Math.PI;
        let n = 4;
        let a = 0.1;
        let b = 1;
        let c = 0.3;
        let x = a*(1-v/2*Math.PI)*Math.cos(n*v)*(1-Math.cos(u))+c*Math.cos(n*v);
        let y = a*(1-v/2*Math.PI)*Math.sin(n*v)*(1-Math.cos(u))+c*Math.sin(n*v);
        let z = b*v/2*Math.PI+a*(1-v/2*Math.PI)*Math.sin(u);
        return new THREE.Vector3(x,y,z);
    }
    invertedSpiral(v, u){
        return this.spiral(u, v);
    }
    fermet(u, v){
        u = u*16-8, abs_u = (u<0)?-u:u, v *= 1;
        let a = (u<0)?-1:1, H = 0.8;
        let x = a*Math.sqrt(abs_u)*Math.cos(abs_u);
        let z = H*v;
        let y = a*Math.sqrt(abs_u)*Math.sin(abs_u);
        return new THREE.Vector3(x,y,z);
    }
    helicoid(u, v){
        u = u * 6 * -Math.PI;
        v = (v * 2 * Math.PI)-Math.PI;
        let c = 2;
        let x = c*v*Math.cos(u);
        let y = c*v*Math.sin(u);
        let z = u;
        return new THREE.Vector3(x,y,z);
    }
    horn(u, v){
        v = v * 2 * Math.PI;
        let x = (2 + u*Math.cos(v))*Math.cos(2*Math.PI*u) + 2*u;
        let y = (2 + u*Math.cos(v))*Math.sin(2*Math.PI*u);
        let z = u*Math.sin(v);
        return new THREE.Vector3(x,y,z);
    }
    invertedHorn(v, u){
        return this.horn(u, v);
    }
    pillow(u, v){
        u = (u * 2 * Math.PI)-Math.PI;
        v = (v * 2 * Math.PI)-Math.PI;
        let x = Math.cos(u);
        let y = Math.cos(v);
        let z = Math.sin(u)*Math.sin(v);
        return new THREE.Vector3(x,y,z);
    }
    invertedPillow(v, u){
        return this.pillow(u, v);
    }
    spring(u,v){
        u = u * 6 * -Math.PI;
        v = (v * 2 * Math.PI)-Math.PI;
        let r1 = 0.3, r2 = 0.3, periodlength=1.2, cycles = 3;

        let x = (1 - r1 * Math.cos(v)) * Math.cos(u);
        let y = (1 - r1 * Math.cos(v)) * Math.sin(u);
        let z = r2 * (Math.sin(v) + periodlength * u / Math.PI);
        return new THREE.Vector3(x,y,z);
    }
    invertedSpring(v, u){
        return this.spring(u, v);
    }
    scherk(u, v){
        v = (v * Math.PI)-Math.PI/2;
        u = (u * Math.PI)-Math.PI/2;
        let c = 0.9;
        let x = v;
        let y = u;
        let z = Math.log(Math.cos(c*u) / Math.cos(c*v)) / c;
        return new THREE.Vector3(x,y,z);
    }
    catenoid(u, v){
        u = u * 2 * Math.PI;
        v = (v * 2 * Math.PI)-Math.PI;
        let c = 2;
        let x = c* Math.cosh(v/c)*Math.sin(u);
        let y = c* Math.cosh(v/c)* Math.cos(u);
        let z = v;
        return new THREE.Vector3(x,y,z);
    }
    natica(u, v){
        u = u*21-20, v *= Math.PI*2;
        let a=2.6, b=2.4, c=1.0, h=1.25, k=-2.8, w=0.18, R=1;
        let exp_wu = Math.exp(w*u);
        let sin_v=Math.sin(v), cos_v=Math.cos(v), sin_cu=Math.sin(c*u), cos_cu=Math.cos(c*u);
        let x = exp_wu*(h+a*cos_v)*cos_cu;
        let y = R*exp_wu*(h+a*cos_v)*sin_cu;
        let z = exp_wu*(k+b*sin_v);
        return new THREE.Vector3(x,y,z);
    }
    invertedNatica(v, u){
        return this.natica(u, v);
    }
};