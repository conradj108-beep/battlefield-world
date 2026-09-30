// ============================================================
// PROJECT BATTLEFIELD
// TERRAIN SYSTEM
// ============================================================

import * as THREE from "three";


export class BattlefieldTerrain {

    constructor(scene) {

        this.scene = scene;

        this.size = 1800;

        this.segments = 220;

        this.mesh = null;

        this.heightData = [];

        this.build();

    }


    // ========================================================
    // TERRAIN HEIGHT
    // ========================================================

    getHeight(x, z) {

        let height = 0;


        // Large rolling hills

        height +=
            Math.sin(x * 0.010) *
            Math.cos(z * 0.009) *
            22;


        // Medium terrain variation

        height +=
            Math.sin(x * 0.023 + 1.7) *
            Math.cos(z * 0.017) *
            10;


        // Smaller detail

        height +=
            Math.sin(x * 0.060 + 3) *
            Math.cos(z * 0.045) *
            3;


        // Large mountain region

        const distanceToMountain =
            Math.sqrt(
                x * x +
                (z + 400) *
                (z + 400)
            );


        const mountain =
            Math.max(
                0,
                1 -
                distanceToMountain / 700
            );


        height +=
            mountain * mountain * 75;


        return height;

    }


    // ========================================================
    // BUILD TERRAIN
    // ========================================================

    build() {

        const geometry =
            new THREE.PlaneGeometry(

                this.size,
                this.size,

                this.segments,
                this.segments

            );


        const positions =
            geometry.attributes.position;


        const colors =
            new Float32Array(
                positions.count * 3
            );


        const color =
            new THREE.Color();


        for (
            let i = 0;
            i < positions.count;
            i++
        ) {

            const x =
                positions.getX(i);


            const z =
                positions.getY(i);


            const height =
                this.getHeight(
                    x,
                    z
                );


            positions.setZ(
                i,
                height
            );


            // ------------------------------------------------
            // TERRAIN MATERIAL COLOUR
            // ------------------------------------------------

            if (height < 4) {

                // Dark damp lowlands

                color.setRGB(
                    0.16,
                    0.22,
                    0.16
                );

            }

            else if (height < 14) {

                // Natural grass

                color.setRGB(
                    0.25,
                    0.34,
                    0.22
                );

            }

            else if (height < 32) {

                // Higher grass

                color.setRGB(
                    0.30,
                    0.37,
                    0.24
                );

            }

            else if (height < 52) {

                // Rocky transition

                color.setRGB(
                    0.32,
                    0.33,
                    0.29
                );

            }

            else {

                // Mountain rock

                color.setRGB(
                    0.38,
                    0.38,
                    0.35
                );

            }


            // Slight natural variation

            const variation =
                Math.sin(
                    x * 0.15
                ) *
                Math.cos(
                    z * 0.13
                ) *
                0.025;


            colors[i * 3] =
                Math.max(
                    0,
                    color.r + variation
                );


            colors[i * 3 + 1] =
                Math.max(
                    0,
                    color.g + variation
                );


            colors[i * 3 + 2] =
                Math.max(
                    0,
                    color.b + variation
                );

        }


        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );


        geometry.computeVertexNormals();


        // ====================================================
        // MATERIAL
        // ====================================================

        const material =
            new THREE.MeshStandardMaterial({

                vertexColors: true,

                roughness: 0.96,

                metalness: 0.0

            });


        this.mesh =
            new THREE.Mesh(
                geometry,
                material
            );


        this.mesh.rotation.x =
            -Math.PI / 2;


        this.mesh.receiveShadow =
            true;


        this.mesh.castShadow =
            false;


        this.scene.add(
            this.mesh
        );

    }


    // ========================================================
    // GET HEIGHT FOR PLAYER
    // ========================================================

    getPlayerHeight(x, z) {

        return this.getHeight(
            x,
            z
        );

    }

}
