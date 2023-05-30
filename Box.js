import * as THREE from 'three'

export default class Box extends THREE.Mesh{       
    constructor({
        width,
        height,
        depth,
        colorsito, 
        velocity ={
            x : 0,
            y : 0,
            z : 0
        },
        position = {
            x:0,
            y:0,
            z:0
        },
        zAcceleration = false
    }){
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({ color: colorsito })
        )
        
        this.width = width
        this.height = height
        this.depth = depth
        
        this.position.set(position.x,position.y,position.z);
        
        this.right = this.position.x + this.width/2
        this.left = this.position.x - this.width/2
        
        this.front = this.position.z + this.depth/2 
        this.back = this.position.z - this.depth/2 
        
        this.bottom = this.position.y - this.height/2;
        this.top = this.position.y + this.height/2;
        
        this.velocity = velocity;
        this.gravity = -0.005
        
        this.zAcceleration = zAcceleration;
                    
        
    }
    updateSides(){
        //Aqui calculo cuales son las tapas de cada cubo
        this.right = this.position.x + this.width/2
        this.left = this.position.x - this.width/2
        
        this.bottom = this.position.y - this.height/2;
        this.top = this.position.y + this.height/2;
        
        this.front = this.position.z + this.depth/2 
        this.back = this.position.z - this.depth/2 
    }
        
    update(ground) {
        this.updateSides();
        if(this.zAcceleration)
            this.velocity.z += 0.0009;
        
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        
        this.applyGravity(ground);
                    
    }
    applyGravity(ground){
        this.velocity.y += this.gravity;

            //cuando mi cubo golpea el piso
            if( 
                boxColission({
                    box1: this,
                    box2: ground
                })
              ) {
                    this.velocity.y *= 0.6;
                    this.velocity.y = -this.velocity.y;
                }else 
                    this.position.y += this.velocity.y
                
    }
}

function boxColission({ box1, box2 }){
    const xColission = box1.right >= box2.left && box1.left <= box2.right;
    const yColission = box1.bottom +box1.velocity.y <= box2.top && box1.top >= box2.bottom
    const zColission = box1.front >= box2.back && box1.back <= box2.front
        
    return xColission && yColission && zColission
}