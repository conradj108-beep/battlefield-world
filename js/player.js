// ============================================================
// PROJECT BATTLEFIELD
// PLAYER CONTROLLER
// ============================================================

import * as THREE from "three";

export class PlayerController {

    constructor(camera, terrain) {

        this.camera = camera;
        this.terrain = terrain;

        // -------------------------
        // PLAYER POSITION
        // -------------------------

        this.position = new THREE.Vector3(
            0,
            20,
            100
        );

        // -------------------------
        // MOVEMENT
        // -------------------------

        this.velocity = new THREE.Vector3();

        this.walkSpeed = 55;
        this.sprintSpeed = 95;

        this.jumpStrength = 28;

        this.gravity = -70;

        this.isGrounded = false;

        // -------------------------
        // CAMERA
        // -------------------------

        this.eyeHeight = 5.5;

        this.pitch = 0;
        this.yaw = 0;

        this.mouseSensitivity = 0.002;

        // -------------------------
        // INPUT
        // -------------------------

        this.keys = {};

        this.mouseLocked = false;

        this.setupKeyboard();
        this.setupMouse();

        // Start camera
        this.updateCamera();

    }


    // ========================================================
    // KEYBOARD
    // ========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            (event) => {

                this.keys[event.code] = true;

                // Prevent browser scrolling
                if (
                    event.code === "Space" ||
                    event.code === "ArrowUp" ||
                    event.code === "ArrowDown"
                ) {

                    event.preventDefault();

                }

            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.code] = false;

            }
        );

    }


    // ========================================================
    // MOUSE LOOK
    // ========================================================

    setupMouse() {

        document.addEventListener(
            "click",
            () => {

                if (!this.mouseLocked) {

                    document.body.requestPointerLock();

                }

            }
        );


        document.addEventListener(
            "pointerlockchange",
            () => {

                this.mouseLocked =
                    document.pointerLockElement === document.body;

            }
        );


        document.addEventListener(
            "mousemove",
            (event) => {

                if (!this.mouseLocked) return;


                this.yaw -=
                    event.movementX *
                    this.mouseSensitivity;


                this.pitch -=
                    event.movementY *
                    this.mouseSensitivity;


                // Stop player looking completely upside down

                const limit =
                    Math.PI / 2 - 0.05;


                this.pitch =
                    Math.max(
                        -limit,
                        Math.min(
                            limit,
                            this.pitch
                        )
                    );

            }
        );

    }


    // ========================================================
    // TERRAIN HEIGHT
    // ========================================================

    getTerrainHeight(x, z) {

        /*
           The terrain in our first prototype is generated
           procedurally using the same basic mathematical
           functions.

           We reproduce those functions here so the player
           can follow the landscape.
        */

        let height = 0;


        height +=
            Math.sin(x * 0.012) *
            Math.cos(z * 0.010) *
            18;


        height +=
            Math.sin(x * 0.027 + 2) *
            Math.cos(z * 0.018) *
            8;


        height +=
            Math.sin(x * 0.055) *
            Math.cos(z * 0.041) *
            3;


        const mountain =
            Math.max(
                0,
                1 -
                Math.sqrt(
                    x * x +
                    (z + 350) *
                    (z + 350)
                ) /
                650
            );


        height += mountain * 60;


        return height;

    }


    // ========================================================
    // UPDATE
    // ========================================================

    update(delta) {

        if (!delta) return;


        // ----------------------------------------------------
        // MOVEMENT DIRECTION
        // ----------------------------------------------------

        const direction =
            new THREE.Vector3();


        const forward =
            new THREE.Vector3(
                Math.sin(this.yaw),
                0,
                Math.cos(this.yaw)
            );


        const right =
            new THREE.Vector3(
                Math.cos(this.yaw),
                0,
                -Math.sin(this.yaw)
            );


        if (
            this.keys["KeyW"] ||
            this.keys["ArrowUp"]
        ) {

            direction.add(forward);

        }


        if (
            this.keys["KeyS"] ||
            this.keys["ArrowDown"]
        ) {

            direction.sub(forward);

        }


        if (this.keys["KeyD"]) {

            direction.add(right);

        }


        if (this.keys["KeyA"]) {

            direction.sub(right);

        }


        if (direction.lengthSq() > 0) {

            direction.normalize();

        }


        // ----------------------------------------------------
        // SPEED
        // ----------------------------------------------------

        let speed =
            this.walkSpeed;


        if (
            this.keys["ShiftLeft"] ||
            this.keys["ShiftRight"]
        ) {

            speed =
                this.sprintSpeed;

        }


        // ----------------------------------------------------
        // HORIZONTAL MOVEMENT
        // ----------------------------------------------------

        this.velocity.x =
            direction.x *
            speed;


        this.velocity.z =
            direction.z *
            speed;


        // ----------------------------------------------------
        // GRAVITY
        // ----------------------------------------------------

        this.velocity.y +=
            this.gravity *
            delta;


        // ----------------------------------------------------
        // JUMP
        // ----------------------------------------------------

        if (
            this.keys["Space"] &&
            this.isGrounded
        ) {

            this.velocity.y =
                this.jumpStrength;

            this.isGrounded =
                false;

        }


        // ----------------------------------------------------
        // APPLY VELOCITY
        // ----------------------------------------------------

        this.position.x +=
            this.velocity.x *
            delta;


        this.position.y +=
            this.velocity.y *
            delta;


        this.position.z +=
            this.velocity.z *
            delta;


        // ----------------------------------------------------
        // TERRAIN COLLISION
        // ----------------------------------------------------

        const ground =
            this.getTerrainHeight(
                this.position.x,
                this.position.z
            );


        const minimumHeight =
            ground +
            this.eyeHeight;


        if (
            this.position.y <=
            minimumHeight
        ) {

            this.position.y =
                minimumHeight;

            this.velocity.y =
                0;

            this.isGrounded =
                true;

        }


        // ----------------------------------------------------
        // WORLD BOUNDS
        // ----------------------------------------------------

        const limit =
            850;


        this.position.x =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    this.position.x
                )
            );


        this.position.z =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    this.position.z
                )
            );


        // ----------------------------------------------------
        // CAMERA
        // ----------------------------------------------------

        this.updateCamera();

    }


    // ========================================================
    // CAMERA UPDATE
    // ========================================================

    updateCamera() {

        this.camera.position.copy(
            this.position
        );


        this.camera.rotation.order =
            "YXZ";


        this.camera.rotation.y =
            this.yaw;


        this.camera.rotation.x =
            this.pitch;

    }

}
