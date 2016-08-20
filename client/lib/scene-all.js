            var camera, scene, renderer, material, geometry, sgeometry, originalgGeometry, particle;
            var gui, guiControl, object
            var mobile = false;
            var texture
            var objectMaterial1, objectMaterial2
            init();
            setup();
            render();
            function init() {
                // renderer
                renderer = new THREE.WebGLRenderer({antialias: true});
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                document.body.appendChild(renderer.domElement);
                // scene
                scene = new THREE.Scene();
                // camera
                camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
                camera.position.set(0, 0, 10);
                camera.focalLength = camera.position.distanceTo(scene.position);
                scene.add(camera)
                // controls


                controls = new THREE.OrbitControls(camera);
                // controls.autoRotate = true;
                if (WEBVR.isAvailable() === true) {
                    controls = new THREE.VRControls(camera);
                    controls.standing = false;
                    renderer = new THREE.VREffect(renderer);
                    document.body.appendChild(WEBVR.getButton(renderer));
                }
                // events
                window.addEventListener('deviceorientation', setOrientationControls, true);
                window.addEventListener('resize', onWindowResize, false);
            }

            function changeGeometry() {
                sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, Math.round(guiControl.p), Math.round(guiControl.q));
                originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, Math.round(guiControl.p), Math.round(guiControl.q));
                object.geometry = sgeometry;
                // object.material.map = new THREE.TextureLoader().load("assets/textures/white-fur-texture.jpg");
                // object.material.color = new THREE.Color(0xFFFFFF*Math.random());
                object.material.opacity = guiControl.opacity

            }
            function setup() {
                var cubeMap = getCubeMap(3)
                var cubeShader = THREE.ShaderLib['cube'];
                cubeShader.uniforms['tCube'].value = cubeMap;
                var skyBoxMaterial = new THREE.ShaderMaterial({
                    fragmentShader: cubeShader.fragmentShader,
                    vertexShader: cubeShader.vertexShader,
                    uniforms: cubeShader.uniforms,
                    depthWrite: false,
                    side: THREE.BackSide
                });
                var skyBox = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), skyBoxMaterial);
                scene.add(skyBox);
                texture = new THREE.TextureLoader().load("assets/textures/watercolor-blue.jpg");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 2);

                objectMaterial1 = new THREE.MeshStandardMaterial({
                    envMap: cubeMap,
                    map: texture,
                    shading: THREE.FlatShading,
                    side: THREE.DoubleSide,
                    transparent: true
                });

                objectMaterial2 = new THREE.MeshStandardMaterial({
                    envMap: cubeMap,
                    map: texture,
                    shading: THREE.SmoothShading,
                    side: THREE.DoubleSide,
                    wireframe: true,
                    transparent: true
                });

                // central object

                sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, 15, 15);
                originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, 15, 15);
                object = new THREE.Mesh(sgeometry, objectMaterial1);
                scene.add(object);

                particle = new THREE.Object3D();
                scene.add(particle);

                var partGeo = new THREE.TetrahedronGeometry(2, 0);
                var partMat = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    shading: THREE.FlatShading
                });
                for (var i = 0; i < 1000; i++) {
                    var mesh = new THREE.Mesh(partGeo, partMat);
                    mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
                    mesh.position.multiplyScalar(90 + (Math.random() * 700));
                    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
                    particle.add(mesh);
                }

                // Helpers
                var axis = new THREE.AxisHelper(10);
                scene.add(axis);

                // light
                var ambientLight = new THREE.AmbientLight(0x999999);
                scene.add(ambientLight);

                var lights = [];
                lights[0] = new THREE.DirectionalLight(0xffffff, 1);
                lights[0].position.set(1, 0, 0);
                lights[1] = new THREE.DirectionalLight(0x11E8BB, 1);
                lights[1].position.set(0.75, 1, 0.5);
                lights[2] = new THREE.DirectionalLight(0x8a00C9, 0.5);
                lights[2].position.set(-2.75, -2, 0.5);
                scene.add(lights[0]);
                scene.add(lights[1]);
                scene.add(lights[2]);
                var helper = new THREE.DirectionalLightHelper(lights[2]);
                scene.add(helper);
            }
            function remove(object) {
                scene.remove(object)
            }
            var num = 0
            var time = 0;
            function render() {
                requestAnimationFrame(render);

                particle.rotation.x += 0.0000;
                particle.rotation.y -= 0.0040;

                // if (guiControl.wfSolid > 0.5) {
                //    object.material.wireframe = false;
                //    object.material.shading = THREE.FlatShading;
                //    object.material.side = THREE.FrontSide;
                //  } else{
                //    object.material.wireframe = true;
                //    object.material.shading = THREE.SmoothShading;
                //    object.material.side = THREE.DoubleSide;
                //  };

 


                // time += 1
                // texture.offset.y = time / 10000;
                // for (var i = 0; i < sgeometry.vertices.length; i++) {
                //     var v = sgeometry.vertices[i]
                //     var ov = originalgGeometry.vertices[i];
                //     var sin = (Math.sin(time / 100 + i / 10) + 1) / 2
                //     var random = Math.random()
                //     v.x = ov.x + guiControl.shimmer * random;
                //     v.y = ov.y + guiControl.shimmer * random;
                //     v.z = ov.z + guiControl.shimmer * random;
                // }
                sgeometry.verticesNeedUpdate = true;

                controls.update();
                if (mobile) {
                    camera.position.set(0, 0, 0)
                    camera.translateZ(10);
                }
                renderer.render(scene, camera);
            }